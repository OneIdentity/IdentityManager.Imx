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

import { EntityWriteDataColumn, IEntityColumn } from 'imx-qbm-dbts';

export class ParameterDataContainer {
  public readonly columns: IEntityColumn[] = [];

  constructor(private readonly parameterCategoryColumns: { [key: string]: IEntityColumn[] }) {
    Object.keys(parameterCategoryColumns).forEach(key => parameterCategoryColumns[key].forEach(column => this.columns.push(column)));
  }

  public getEntityWriteDataColumns(): { [key: string]: EntityWriteDataColumn[][] } {
    const extendedData: { [key: string]: EntityWriteDataColumn[][] } = { };
    Object.keys(this.parameterCategoryColumns).forEach(key => {
      extendedData[key] = [[]];
      this.parameterCategoryColumns[key].forEach(column => extendedData[key][0].push({
        Name: column.ColumnName,
        Value: column.GetValue()
      }));
    });
    return extendedData;
  }
}
