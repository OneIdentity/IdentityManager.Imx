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
 * Copyright 2022 One Identity LLC.
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

import { Component, EventEmitter, Input, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';

import { BulkItem } from './bulk-item/bulk-item';
import { BulkItemComponent } from './bulk-item/bulk-item.component';

@Component({
  selector: 'imx-bulk-editor',
  templateUrl: './bulk-property-editor.component.html',
  styleUrls: ['./bulk-property-editor.component.scss']
})
export class BulkPropertyEditorComponent implements OnInit {
  public formGroup = new FormGroup({});

  @Input() public entities: BulkItem[] = [];
  @Input() public hideButtons = false;

  @Output() public saveItem: EventEmitter<BulkItem> = new EventEmitter();
  @Output() public skipItem: EventEmitter<BulkItem> = new EventEmitter();
  @Output() public validationStateChanged = new EventEmitter<BulkItem>();
  @Output() public controlCreated: EventEmitter<AbstractControl> = new EventEmitter();

  @ViewChildren(BulkItemComponent) private panels: QueryList<BulkItemComponent>;

  public ngOnInit(): void {
    this.entities.sort((a, b) => {
      let typeA = a.properties.every(p => p.isReadOnly());
      let typeB = b.properties.every(p => p.isReadOnly());

      if (typeA && typeB) {
        return 0;
      }

      if (typeA) {
        return 1;
      }

      typeA = a.properties.some(p => p.column.GetMetadata().GetMinLength() > 0);
      typeB = b.properties.some(p => p.column.GetMetadata().GetMinLength() > 0);

      if (typeA && typeB) {
        return 0;
      }

      if (typeA) {
        return -1;
      } else {
        return 1;
      }
    });

    this.controlCreated.emit(this.formGroup);
  }

  public handleAction(item: BulkItem, save: boolean): void {
    save ? this.saveItem.emit(item) : this.skipItem.emit(item);

    if (this.panels == null) {
      return;
    }

    const currentIndex = this.entities.indexOf(item);

    if (currentIndex === this.entities.length - 1) {
      return;
    }

    const nextPanel: BulkItemComponent = this.panels.toArray()[currentIndex + 1];
    nextPanel.open();
  }
}
