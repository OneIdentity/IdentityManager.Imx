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

import { Component, Input, ViewChild, ViewContainerRef, OnChanges, SimpleChanges, EventEmitter, Output, ElementRef } from '@angular/core';
import { AbstractControl } from '@angular/forms';

import { ColumnDependentReference } from '../column-dependent-reference.interface';
import { CdrRegistryService } from '../cdr-registry.service';
import { ClassloggerService } from '../../classlogger/classlogger.service';
import { CdrEditor } from '../cdr-editor.interface';

/**
 * This component provides an {@link CdrEditor|editor} for a {@link ColumnDependentReference|column dependent reference}.
 *
 * In order to determine the appropriate editor it uses a {@link CdrRegistryService|registry}.
 */
@Component({
  selector: 'imx-cdr-editor',
  templateUrl: './cdr-editor.component.html',
  styleUrls: ['./cdr-editor.component.scss'],
})
export class CdrEditorComponent implements OnChanges {

  public editor: CdrEditor;
  /**
   * The column dependent reference for which the editor should be provided.
   */
  @Input() public cdr: ColumnDependentReference;

  @Output() public controlCreated = new EventEmitter<AbstractControl>();
  @Output() public readonly valueChange = new EventEmitter<any>();
  @Output() public readonly readOnlyChanged = new EventEmitter<boolean>();
  @Output() public readonly pendingChanged = new EventEmitter<boolean>();

  @ViewChild('viewcontainer', { read: ViewContainerRef, static: true }) private viewContainerRef: ViewContainerRef;

  // stores if the cdr is readonly, because otherwise you're unable to check if the value has changed
  private isReadonly: boolean;

  constructor(private registry: CdrRegistryService, private logger: ClassloggerService, private readonly elementRef: ElementRef) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['cdr'] && changes['cdr'].currentValue) {
      this.viewContainerRef.clear();
      try {
        const ref = this.registry.createEditor(this.viewContainerRef, this.cdr);
        this.isReadonly = this.cdr.isReadOnly();
        if (ref.instance.valueHasChanged) {
          ref.instance.valueHasChanged.subscribe((value) => {
            if (value?.forceEmit === true) {
              this.valueChange.emit(value.value);
            } else {
              const val = value.value?.DataValue ?? value.value;
              if ((val ?? '') !== (this.cdr.column.GetValue() ?? '')) {
                this.valueChange.emit(value.value);
              }
            }
            if (this.cdr.isReadOnly() !== this.isReadonly) {
              this.isReadonly = this.cdr.isReadOnly();
              this.readOnlyChanged.emit(this.isReadonly);
            }
          });
        }
        if (ref.instance.pendingChanged) {
          ref.instance.pendingChanged.subscribe((value) => {
            this.pendingChanged.emit(value);
          });
        }
        this.controlCreated.emit(ref.instance.control);
        this.elementRef.nativeElement.setAttribute('data-imx-identifier', `cdr-editor-${this.cdr.column.ColumnName}`);
        this.editor = ref.instance;
      } catch (e) {
        this.logger.error(this, 'Failed to create editor for column dependent reference.', e);
      }
    }
  }

  public get description() {
    // Preferably use CDR-level hint; if none is defined: use the metadata description field.
    return this.cdr?.hint || this.cdr?.column.GetMetadata().GetDescription();
  }

  public get infotitle() {
    return this.cdr.column.GetMetadata().GetDisplay();
  }

  public update(){
    this.editor?.updateRequested?.next();
  }
}
