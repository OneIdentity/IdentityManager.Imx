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
 * Copyright 2023 One Identity LLC.
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

import { ColumnDependentReference } from '../column-dependent-reference.interface';
import { CdrEditor, ValueHasChangedEventArg } from '../cdr-editor.interface';
import { EntityColumnContainer } from '../entity-column-container';
import { ClassloggerService } from '../../classlogger/classlogger.service';
import { Base64ImageService } from '../../images/base64-image.service';
import { FileSelectorService } from '../../file-selector/file-selector.service';

/**
 * A component for viewing / editing binary columns with image data
 */
@Component({
  selector: 'imx-edit-image',
  templateUrl: './edit-image.component.html',
  styleUrls: ['./edit-image.component.scss'],
})
export class EditImageComponent implements CdrEditor, OnDestroy {
  @ViewChild('file') public fileInput: ElementRef;

  public get fileFormatHint(): string {
    return this.fileFormatError ? '#LDS#Please select an image in PNG format.' : undefined;
  }

  public readonly updateRequested = new Subject<void>();

  public readonly control = new UntypedFormControl(undefined);

  public readonly columnContainer = new EntityColumnContainer<string>();
  public readonly valueHasChanged = new EventEmitter<ValueHasChangedEventArg>();

  public isLoading = false;

  private fileFormatError = false;

  private readonly subscriptions: Subscription[] = [];
  private isWriting = false;

  constructor(
    private readonly logger: ClassloggerService,
    private readonly imageProvider: Base64ImageService,
    private readonly fileSelector: FileSelectorService
  ) {
    this.subscriptions.push(
      this.fileSelector.fileFormatError.subscribe(() => (this.fileFormatError = true)),
      this.fileSelector.fileSelected.subscribe((filepath) => this.writeValue(this.imageProvider.getImageData(filepath)))
    );
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  /**
   * Binds a column dependent reference to the component
   * @param cdref a column dependent reference
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
          })
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
        })
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
        })
      );
    }
  }

  public resetFileFormatErrorState(): void {
    this.fileFormatError = false;
  }

  // TODO: Check Upgrade
  public emitFiles(files: FileList): void {
    this.fileSelector.emitFiles(files, 'image/png');
  }

  /**
   * removes the current image
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
   * updates the value for the CDR
   * @param value the new image url
   */
  private async writeValue(value: string): Promise<void> {
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
