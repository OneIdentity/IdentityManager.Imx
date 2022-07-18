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

import { IEntityColumn, WriteExtTypedEntity } from 'imx-qbm-dbts';

export class GroupTypedEntity extends WriteExtTypedEntity<any> {
  public getColumns(showRiskIndex: boolean, propertyList: string[]): ReadonlyArray<IEntityColumn> {
    const columns = [];

    // TODO: for each property, determine from dynamic entity schema (282445)

    if (propertyList.indexOf('DisplayName') === -1) {
      propertyList.unshift('DisplayName');
    }

    if (showRiskIndex && propertyList.indexOf('RiskIndex') === -1) {
      propertyList.push('RiskIndex');
    }

    for (const name of propertyList) {
      columns.push(this.tryGetColumn(name));
    }
    return columns.filter(column => column != null);
  }

  private tryGetColumn(name: string): IEntityColumn {
    try {
      return this.GetEntity().GetColumn(name);
    } catch {
      return undefined;
    }
  }
}
