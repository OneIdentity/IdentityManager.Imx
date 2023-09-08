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

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatCheckboxDefaultOptions, MAT_CHECKBOX_DEFAULT_OPTIONS } from '@angular/material/checkbox';

@Component({
  selector: 'imx-filter-tile',
  templateUrl: './filter-tile.component.html',
  styleUrls: ['./filter-tile.component.scss'],
  providers: [
    {provide: MAT_CHECKBOX_DEFAULT_OPTIONS, useValue: { clickAction: 'noop' } as MatCheckboxDefaultOptions}
  ]
})
export class FilterTileComponent {
  @Input() public caption: string;
  @Input() public value: any;
  @Input() public icon: string;
  @Input() public isChecked = false;
  @Input() public groupName: string;

  @Output() public checkedChanged: EventEmitter<FilterTileComponent>;

  get cardClass(): string {
    return this.isChecked ? 'mat-card FilterMatCardChecked' : 'mat-card FilterMatCard';
  }
  get contentClass(): string {
    return this.isChecked ? 'FilterContentClassChecked' : 'FilterContentClass';
  }

  constructor() {
    this.checkedChanged = new EventEmitter<FilterTileComponent>();
  }

  public cardSelected(): void {
    this.isChecked = !this.isChecked;
    this.checkedChanged.emit(this);
  }
}
