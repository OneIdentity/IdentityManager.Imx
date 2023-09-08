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

import { Component, Input, ContentChild, ViewChild, TemplateRef, OnInit } from '@angular/core';
import { MatColumnDef } from '@angular/material/table';

/**
 * Visual representation of a column.
 * In contrast to DataTableColumnComponent, which is data bound to a typed entity, this component can visualize arbitrary data.
 *
 * @example
 * A data table with a generic data column
 *
 * <imx-data-source-toolbar #dst [settings]="mySettings"></imx-data-source-toolbar>
 * <imx-data-table [dst]="myDst">
 *              <imx-data-table-generic-column columnName="funnyButtons" columnLabel="Funny button">
 *                <ng-template let-data>
 *                  <button mat-mini-fab (click)="openActionsSheet(data)">Basic</button>
 *                </ng-template>
 *              </imx-data-table-generic-column>
 * </imx-data-table>
 * <imx-data-source-paginator [dst]="myDst"></imx-data-source-paginator>
 */
@Component({
  selector: 'imx-data-table-generic-column',
  templateUrl: './data-table-generic-column.component.html',
  styleUrls: ['./data-table-generic-column.component.scss']
})
export class DataTableGenericColumnComponent implements OnInit {
  /**
   * The label of the column.
   */
  @Input() public columnLabel: string;

  /**
   * Aligns the cell header. Default = 'left'
   */
  @Input() public alignHeader: 'left' | 'center' | 'right' = 'left';

  /**
   * Aligns cell content. Default = 'left'
   */
  @Input() public alignContent: 'left' | 'center' | 'right' = 'left';

  /**
   * The unique name of the column.
   */
  @Input()
  public get columnName(): string {
    return this.columnNameField;
  }
  public set columnName(value: string) {
    this.columnNameField = value;
  }

  public columnIndex: number;

  /**
   * @ignore Used internally in components template.
   * Reference to a custom template, that contains the visual representation of the provided data.
   */
  @ContentChild(TemplateRef, /* TODO: add static flag */ {}) public templateRef: TemplateRef<any>;

  /**
   * @ignore Used internally in components template.
   * Reference to the mat column definition.
   */
  @ViewChild(MatColumnDef, { static: true }) public columnDef: MatColumnDef;

  /**
   * @ignore
   */
  private columnNameField: string;

  public ngOnInit(): void {
    this.columnDef.name = this.columnNameField;
  }
}
