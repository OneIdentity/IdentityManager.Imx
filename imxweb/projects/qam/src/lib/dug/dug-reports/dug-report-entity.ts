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
 * Copyright 2024 One Identity LLC.
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
  EntityColumnData,
  EntityData,
  EntitySchema,
  ExtendedTypedEntityCollection,
  IClientProperty,
  TypedEntity,
  TypedEntityBuilder,
  ValType,
} from '@imx-modules/imx-qbm-dbts';
import { TranslateService } from '@ngx-translate/core';
import { ResourceReportData } from '../../TypedClient';

export class DugReportEntity extends TypedEntity {
  public reportInfo: { uid: string; presetParameters: { [key: string]: string } };

  public static GetEntitySchema(translate?: TranslateService): EntitySchema {
    const returnColumns: { [key: string]: IClientProperty } = {};

    returnColumns.ReportDisplayName = {
      Type: ValType.String,
      ColumnName: 'ReportDisplayName',
      Display: translate ? translate.instant('#LDS#Display name') : '#LDS#Display name',
    };

    returnColumns.UidReport = {
      Type: ValType.String,
      ColumnName: 'UidReport',
    };

    returnColumns.Description = {
      Type: ValType.String,
      ColumnName: 'Description',
      Display: translate ? translate.instant('#LDS#Description') : '#LDS#Description',
    };

    return {
      TypeName: 'Reports',
      Display: translate ? translate.instant('#LDS#Reports') : '#LDS#Reports',
      Columns: returnColumns,
    };
  }

  public static buildEntities(
    entityData: EntityData[],
    extended: { [key: string]: string }[],
    entitySchema: EntitySchema,
  ): ExtendedTypedEntityCollection<DugReportEntity, { [key: string]: string }[]> {
    const builder = new TypedEntityBuilder(DugReportEntity);
    const returnColumns = builder.buildReadWriteEntities(
      {
        TotalCount: entityData.length,
        Entities: entityData,
        ExtendedData: extended,
      },
      entitySchema,
    );

    returnColumns.Data.forEach(
      (elem, index) =>
        (elem.reportInfo = { uid: elem.entity.GetColumn('UidReport').GetValue(), presetParameters: returnColumns?.extendedData?.[index]! }),
    );

    return returnColumns;
  }

  public static buildEntityData(trustees: ResourceReportData[]): EntityData[] {
    return trustees.map((elem) => {
      const returnColumns: { [key: string]: EntityColumnData } = {};
      returnColumns.ReportDisplayName = { Value: elem.ReportDisplayName, IsReadOnly: true };
      returnColumns.UidReport = { Value: elem.UidReport, IsReadOnly: true };
      returnColumns.Description = { Value: elem.Description, IsReadOnly: true };

      return { Columns: returnColumns, Display: elem.ReportDisplayName, Description: elem.Description };
    });
  }
}
