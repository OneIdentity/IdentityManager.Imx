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

import {
  Component, Input, OnDestroy, OnInit, Optional, ViewChild,
  ContentChild, TemplateRef, ElementRef, Output, EventEmitter
} from '@angular/core';
import { MatSortHeader } from '@angular/material/sort';
import { MatColumnDef, MatTable } from '@angular/material/table';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { ImxExpandableItem } from './imx-data-source';

@Component({
  selector: 'imx-column',
  templateUrl: './MatColumn.html',
  styleUrls: ['./MatColumn.scss']
})
export class ImxMatColumnComponent<T> implements OnDestroy, OnInit {
  @Input()
  get field(): string { return this.name; }
  set field(name: string) {
    this.name = name;
  }

  @Input() public title: string;
  @Input() public dataAccessor: ((data: T, index: number, name: string) => string);

  @Input() public align: 'before' | 'after' = 'before';

  @ViewChild(MatColumnDef, { static: true }) public columnDef: MatColumnDef;

  @ViewChild(MatSortHeader) public sortHeader: MatSortHeader;

  @ContentChild('imxCellTemplate', { static: true }) public cellTemplate: TemplateRef<ElementRef>;
  @ContentChild('imxHeaderTemplate', { static: true }) public headerTemplate: TemplateRef<ElementRef>;

  @Input() public class = 'imx-normalCell';
  @Output() public itemExpanded = new EventEmitter<ImxExpandableItem<T>>();
  @Output() public itemCollapsed = new EventEmitter<ImxExpandableItem<T>>();
  @Input() public isFirstColumn = true;

  public hasChildrenProvider: ((data: T) => boolean);

  private name: string;

  constructor(private sanitizer: DomSanitizer, @Optional() public table: MatTable<any>) { }

  public ButtonClass(data: ImxExpandableItem<T>): string {
    if (data.data == null) { return 'k-icon k-i-collapse'; }
    const res = data.level === 0 || (this.hasChildrenProvider ? this.hasChildrenProvider(data.data) : false);
    return !res ? 'imx-small-right-margin k-sprite' : data.isExpanded
      ? 'imx-small-right-margin cux-icon cux-icon--caret-down'    // TODO replace cux-icon (TFS 806274)
      : 'imx-small-right-margin cux-icon cux-icon--caret-right';   // TODO replace cux-icon (TFS 806274)
  }

  public getMargin(data: any): SafeStyle {
    return this.sanitizer.bypassSecurityTrustStyle((data.level ? data.level : .0) * 20 + 'px');
  }

  public ngOnInit(): void {
    this.columnDef.name = this.name;
    if (this.table) {
      this.table.addColumnDef(this.columnDef);
    }
  }

  public ngOnDestroy(): void {
    if (this.table) {
      this.table.removeColumnDef(this.columnDef);
    }
  }

  public getData(data: ImxExpandableItem<T>, index: number): any {
    return this.dataAccessor ? this.dataAccessor(data.data, index, this.field) : (data.data as any)[this.field];
  }


  public buttonClicked(data: ImxExpandableItem<T>): void {
    data.isExpanded = !data.isExpanded;
    if (data.isExpanded) {
      this.itemExpanded.emit(data);
    } else {
      this.itemCollapsed.emit(data);
    }
  }

  public getClass(data: ImxExpandableItem<T>): string {
    return this.isFirstColumn ? (data.level === 0 ? 'imx-title' : 'imx-subtitle') : this.class;
  }
}
