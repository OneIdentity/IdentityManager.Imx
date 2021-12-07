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
 * Copyright 2021 One Identity LLC.
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

import { Component, Input, TemplateRef } from '@angular/core';

/**
 * The detail view of a selected typed entity in the data table.
 *
 * @example
 * A data table with a detail view template
 *
 * <imx-data-source-toolbar #dst [settings]="mySettings"></imx-data-source-toolbar>
 * <imx-data-table [dst]="myDst">
 *              <imx-data-table-detail [detailContentTemplate]="contentTemplate"></imx-data-table-detail>
 * </imx-data-table>
 * <imx-data-source-paginator [dst]="myDst"></imx-data-source-paginator>
 * <ng-template #detailContentTemplate>
 *        <form>
 *              <mat-form-field>
 *                <input matInput
 *                  [placeholder]="translateProvider.GetColumnDisplay('MessageDate', entitySchema)"
 *                  [value]="highlightedEntity?.MessageDate.Column.GetDisplayValue()">
 *              </mat-form-field>
 *              <mat-form-field>
 *                <input matInput
 *                  [placeholder]="translateProvider.GetColumnDisplay('ApplicationName', entitySchema)"
 *                  [value]="highlightedEntity?.ApplicationName.Column.GetDisplayValue()">
 *              </mat-form-field>
 *              <mat-form-field>
 *                <input matInput
 *                  [placeholder]="translateProvider.GetColumnDisplay('LogonUser', entitySchema)"
 *                  [value]="highlightedEntity?.LogonUser.Column.GetDisplayValue()">
 *              </mat-form-field>
 *              <mat-form-field>
 *                <textarea matInput
 *                  [placeholder]="translateProvider.GetColumnDisplay('MessageString', entitySchema)"
 *                  [value]="highlightedEntity?.MessageString.Column.GetDisplayValue()" rows="10"></textarea>
 *              </mat-form-field>
 *        </form>
 * </ng-template>
 */
@Component({
  selector: 'imx-data-table-detail',
  templateUrl: './data-table-detail.component.html',
  styleUrls: ['./data-table-detail.component.scss']
})
export class DataTableDetailComponent {

  /**
   * Reference to a custom template.
   * If no custom template is provided, an empty template will be shown.
   */
  @Input() public detailContentTemplate: TemplateRef<any>;
}
