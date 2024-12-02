/*
 * ONE IDENTITY LLC. PROPRIETARY INFORMATION
 *
 * This software is confidential.  One Identity, LLC. or one of its affiliates or
 * subsidiaries, has supplied this software to you under terms of a
 * license agreement, nondisclosure agreement or both.
 *
 * You may not copy, disclose, or use this software except in accordance with
 * those terms.
 *
 *
 * Copyright 2024 One Identity LLC.
 * ALL RIGHTS RESERVED.
 *
 * ONE IDENTITY LLC. MAKES NO REPRESENTATIONS OR
 * WARRANTIES ABOUT THE SUITABILITY OF THE SOFTWARE,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
 * TO THE IMPLIED WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE, OR
 * NON-INFRINGEMENT.  ONE IDENTITY LLC. SHALL NOT BE
 * LIABLE FOR ANY DAMAGES SUFFERED BY LICENSEE
 * AS A RESULT OF USING, MODIFYING OR DISTRIBUTING
 * THIS SOFTWARE OR ITS DERIVATIVES.
 *
 */

import { Component, ElementRef, EventEmitter, OnDestroy, ViewChild } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';

import { ClassloggerService } from '../../classlogger/classlogger.service';
import { FileSelectorService } from '../../file-selector/file-selector.service';
import { Base64ImageService } from '../../images/base64-image.service';
import { CdrEditor, ValueHasChangedEventArg } from '../cdr-editor.interface';
import { ColumnDependentReference } from '../column-dependent-reference.interface';
import { EntityColumnContainer } from '../entity-column-container';

/**
 * Provides a {@link CdrEditor | CDR editor} for editing / viewing image data columns.
 *
 * To change its value, it uses an {@link ImageSelectComponent | image select component}.
 * When set to read-only, it uses an {@link ImageViewComponent | image view component} to display the content.
 */
@Component({
  selector: 'imx-edit-image',
  templateUrl: './edit-image.component.html',
  styleUrls: ['./edit-image.component.scss'],
})
export class EditImageComponent implements CdrEditor, OnDestroy {
  /**
   * @ignore only to access the file input from the template.
   */
  @ViewChild('file') public fileInput: ElementRef;

  /**
   * Gets a small hint, if the file format is not supported.
   */
  public get fileFormatHint(): string | undefined {
    return this.fileFormatError ? '#LDS#Please select an image in PNG format.' : undefined;
  }

  /**
   * A subject for triggering an update of the editor.
   */
  public readonly updateRequested = new Subject<void>();

  /**
   * The form control associated with the editor.
   */
  public readonly control = new UntypedFormControl(undefined);

  /**
   * The container that wraps the column functionality.
   */
  public readonly columnContainer = new EntityColumnContainer<string>();

  /**
   * Event that is emitted, after a value has been changed.
   */
  public readonly valueHasChanged = new EventEmitter<ValueHasChangedEventArg>();

  /**
   * Indicator that the component is loading data from the server.
   */
  public isLoading = false;

  private fileFormatError = false;

  private readonly subscriptions: Subscription[] = [];
  private isWriting = false;

  constructor(
    private readonly logger: ClassloggerService,
    private readonly imageProvider: Base64ImageService,
    private readonly fileSelector: FileSelectorService,
  ) {
    this.subscriptions.push(
      this.fileSelector.fileFormatError.subscribe(() => (this.fileFormatError = true)),
      this.fileSelector.fileSelected.subscribe((filepath) => this.writeValue(this.imageProvider.getImageData(filepath))),
    );
  }

  /**
   * Unsubscribes all events, after the 'OnDestroy' hook is triggered.
   */
  public ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  /**
   * Binds a column dependent reference to the component.
   * Subscribes to subjects from the column dependent reference and its container.
   * @param cdref a column dependent reference.
   */
  public bind(cdref: ColumnDependentReference): void {
    if (cdref && cdref.column) {
      this.columnContainer.init(cdref);
      this.control.setValue(this.columnContainer.value, { emitEvent: false });
      if (this.columnContainer.isValueRequired && this.columnContainer.canEdit) {
        this.control.setValidators(Validators.required);
      }

      if (cdref.minlengthSubject) {
        this.subscriptions.push(
          cdref.minlengthSubject.subscribe(() => {
            this.setValidators();
          }),
        );
      }
      this.subscriptions.push(
        this.columnContainer.subscribe(() => {
          if (this.isWriting) {
            return;
          }
          if (this.control.value !== this.columnContainer.value) {
            this.logger.trace(this, 'Control set to new value');
            this.control.setValue(this.columnContainer.value, { emitEvent: false });
          }
          this.valueHasChanged.emit({ value: this.control.value });
        }),
      );

      this.subscriptions.push(
        this.updateRequested.subscribe(() => {
          setTimeout(() => {
            try {
              if (this.control.value !== this.columnContainer.value) {
                this.logger.trace(this, 'Control set to new value');
                this.control.setValue(this.columnContainer.value, { emitEvent: false });
              }
              this.valueHasChanged.emit({ value: this.control.value });
              this.setValidators();
              this.control.updateValueAndValidity({ onlySelf: true, emitEvent: false });
            } finally {
            }
          });
        }),
      );
    }
  }

  /**
   * Resets the file format error.
   */
  public resetFileFormatErrorState(): void {
    this.fileFormatError = false;
  }

  /**
   * Emits a list of files to the {@link FileSelectorService | file selector service}.
   * @param files A list of files to emit as *.png.
   */
  // TODO: Check Upgrade
  public emitFiles(files: EventTarget | null): void {
    this.fileSelector.emitFiles((files as any).files, 'image/png');
  }

  /**
   * Removes the current image and writes the 'empty' value to the column.
   */
  public async remove(): Promise<void> {
    this.fileInput.nativeElement.value = '';
    this.fileFormatError = false;

    this.logger.debug(this, 'Removing current image...');
    await this.writeValue(undefined);
  }

  /**
   * Sets Validators.required, if the control is mandatory, else it's set to null.
   * @ignore used internally
   */
  private setValidators() {
    if (this.columnContainer.isValueRequired && this.columnContainer.canEdit) {
      this.control.setValidators(Validators.required);
    } else {
      this.control.setValidators(null);
    }
  }

  /**
   * Updates the value for the CDR.
   * @param value The new image url, that will be used as the new value.
   */
  private async writeValue(value: string | undefined): Promise<void> {
    this.logger.debug(this, 'writeValue called with value', value);

    if (!this.columnContainer.canEdit || this.columnContainer.value === value) {
      return;
    }

    this.control.setValue(value, { emitEvent: false });

    try {
      this.isLoading = true;
      this.isWriting = true;
      this.logger.debug(this, 'writeValue - updateCdrValue...');
      await this.columnContainer.updateValue(value);
    } catch (e) {
      this.logger.error(this, e);
    } finally {
      this.isLoading = false;
      this.isWriting = false;

      if (this.control.value !== this.columnContainer.value) {
        this.control.setValue(this.columnContainer.value, { emitEvent: false });
        this.logger.debug(this, 'form control value is set to', this.control.value);
      }
      this.valueHasChanged.emit({ value: this.control.value, forceEmit: true });
    }

    this.control.markAsDirty();
  }
}
