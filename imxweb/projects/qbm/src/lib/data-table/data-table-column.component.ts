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
  Component,
  Input,
  ViewChild,
  TemplateRef,
  ContentChild,
  OnInit
} from '@angular/core';
import { MatColumnDef } from '@angular/material/table';
import { IClientProperty, EntitySchema } from 'imx-qbm-dbts';
import { ImxTranslationProviderService } from '../translation/imx-translation-provider.service';

/**
 * Visual representation of a typed entity property as a data table column.
 *
 * @example
 * Simple use of a data table column
 *
 * <imx-data-table-column [entityColumn]="entitySchema?.Columns['ApplicationName']"></imx-data-table-column>
 *
 * @example
 * A data table column with a template
 *
 *  <imx-data-table-column [entityColumn]="entitySchema?.Columns['HostName']">
 *           <ng-template let-data>
 *             <mat-accordion>
 *                 <mat-form-field>
 *                   <input matInput placeholder="Host name" value="{{ data.HostName.Column.GetDisplayValue() }}" />
 *                 </mat-form-field>
 *                 <mat-form-field>
 *                   <input matInput placeholder="Type value" value="{{ data.HostName.Column.GetType() }}" />
 *                 </mat-form-field>
 *               </mat-expansion-panel>
 *             </mat-accordion>
 *           </ng-template>
 *         </imx-data-table-column>
 */
@Component({
  selector: 'imx-data-table-column',
  templateUrl: './data-table-column.component.html',
  styleUrls: ['./data-table-column.component.scss']
})
export class DataTableColumnComponent<T> implements OnInit {

  /**
   * Set alignment of column header and content
   */
  @Input() public align: 'center' | 'left' | 'right' = 'left';

  /**
   * The width of column header and content
   */
  @Input() public width = 'auto';

  /**
   * The label of the column.
   * If not set the display label will be retrieved from the entity schema.
   */
  @Input() public columnLabel: string;

  /**
   * Aligns text in cell header. Default = 'left'
   */
  @Input() public alignHeader: 'left' | 'center' | 'right' = 'left';

  /**
   * Aligns cell content. Default = 'left'
   */
  @Input() public alignContent: 'left' | 'center' | 'right' = 'left';


  public columnIndex: number;

  /**
   * Describes a typed entity property.
   */
  @Input()
  public get entityColumn(): IClientProperty {
    return this.entityColumnField;
  }
  public set entityColumn(value: IClientProperty) {
    this.entityColumnField = value;
  }

  /**
   * If not set the default template will be used.
   */
  @ContentChild(TemplateRef, /* TODO: add static flag */ {}) public templateRef: TemplateRef<any>;

  /**
   * @ignore Used internally in components template.
   * The mat column definition.
   */
  @ViewChild(MatColumnDef, { static: true }) public columnDef: MatColumnDef;

   /**
   * The schema of a typed entity
   */
    public entitySchema: EntitySchema;

  /**
   * @ignore Used internally.
   */
  private entityColumnField: IClientProperty;

  /**
   * Inject the 'translateProvider' for use in the template.
   */
  constructor(
    public readonly translateProvider: ImxTranslationProviderService
  ) {}

  public ngOnInit(): void {
    this.columnDef.name = this.entityColumnField.ColumnName;
  }
}
