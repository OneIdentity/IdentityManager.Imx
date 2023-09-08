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

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { EuiTheme } from '@elemental-ui/core';

@Component({
  selector: 'imx-ordered-list',
  templateUrl: './ordered-list.component.html',
  styleUrls: ['./ordered-list.component.scss'],
})
export class OrderedListComponent {
  @Input() addNewText: string;
  @Input() deleteText: string;
  @Input() placeholder: string;
  @Input() testId: string = 'list';
  @Input() dataSource: { Name: string; Display: string }[] = [];
  @Input() data: string[] = [];
  @Input() isReadOnly: boolean = false;

  @Output() valueChanged = new EventEmitter<void>();

  /** Gets the theme, that is currently applied to the web page */
  public get theme(): string {
    const bodyClasses = document.body.classList;
    return bodyClasses.contains(EuiTheme.LIGHT)
      ? EuiTheme.LIGHT
      : bodyClasses.contains(EuiTheme.DARK)
      ? EuiTheme.DARK
      : bodyClasses.contains(EuiTheme.CONTRAST)
      ? EuiTheme.CONTRAST
      : '';
  }

  public drop(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.data, event.previousIndex, event.currentIndex);
    this.notifyChange();
  }

  public deleteElement(ind: number): void {
    this.data.splice(ind, 1);
    this.notifyChange();
  }

  public addNew(): void {
    this.data.push(null);
    this.notifyChange();
  }

  public optionSelected(): void {
    this.notifyChange();
  }

  private notifyChange() {
    this.valueChanged.emit();
  }

  // https://stackoverflow.com/questions/42322968/angular2-dynamic-input-field-lose-focus-when-input-changes
  public trackByFn(index: any, item: any) {
    return index;
  }
}
