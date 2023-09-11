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

import { Component, Input } from '@angular/core';

import { IClientProperty, TypedEntity, ValType } from 'imx-qbm-dbts';
import { buildAdditionalElementsString } from '../data-table-additional-info.model';

@Component({
  selector: 'imx-data-table-display-cell',
  templateUrl: './data-table-display-cell.component.html',
  styleUrls: ['./data-table-display-cell.component.scss']
})
export class DataTableDisplayCellComponent {

  public readonly ValType = ValType;

  @Input() public entity: TypedEntity;
  @Input() public property: IClientProperty;
  @Input() public propertiesforSubtitle: IClientProperty[];

  public getSubtitleText(): string {
    return buildAdditionalElementsString(this.entity?.GetEntity(), this.propertiesforSubtitle);
  }
}
