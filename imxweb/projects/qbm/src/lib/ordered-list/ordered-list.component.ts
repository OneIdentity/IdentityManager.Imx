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

import { Component, Input } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: "imx-ordered-list",
  templateUrl: './ordered-list.component.html',
  styleUrls: ['./ordered-list.component.scss']
})
export class OrderedListComponent {

  @Input() addNewText: string;
  @Input() deleteText: string;
  @Input() testId: string = 'list';
  @Input() dataSource: { Name: string, Display: string }[] = [];
  @Input() data: string[] = [];
  @Input() isReadOnly: boolean = false;

  ngOnInit(): void {
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.data, event.previousIndex, event.currentIndex);
    this.notifyChange();
  }

  deleteElement(ind: number) {
    this.data.splice(ind, 1);
    this.notifyChange();
  }

  addNew() {
    this.data.push(null);
    this.notifyChange();
  }

  optionSelected() {
    this.notifyChange();
  }

  private notifyChange() {

  }

  // https://stackoverflow.com/questions/42322968/angular2-dynamic-input-field-lose-focus-when-input-changes
  trackByFn(index: any, item: any) {
    return index;
  }
}