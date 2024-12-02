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
  DisplayColumns,
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
import { ResourceActivityData, TrusteeActivityData } from '../TypedClient';

export class DugActivityEntity extends TypedEntity {
  public static GetEntitySchema(typeName: string, typeDisplay: string, translate?: TranslateService): EntitySchema {
    const returnColumns: { [key: string]: IClientProperty } = {};

    returnColumns.CountActivities = {
      Type: ValType.Int,
      ColumnName: 'CountActivities',
      Display: translate ? translate.instant('#LDS#Activity count') : '#LDS#Activity count',
    };

    returnColumns[DisplayColumns.DISPLAY_PROPERTYNAME] = DisplayColumns.DISPLAY_PROPERTY;

    return {
      TypeName: typeName,
      Display: translate ? translate.instant(typeDisplay) : typeDisplay,
      Columns: returnColumns,
    };
  }

  public static buildEntities(
    entityData: EntityData[],
    entitySchema: EntitySchema,
  ): ExtendedTypedEntityCollection<DugActivityEntity, unknown> {
    const builder = new TypedEntityBuilder(DugActivityEntity);
    return builder.buildReadWriteEntities(
      {
        TotalCount: entityData.length,
        Entities: entityData,
      },
      entitySchema,
    );
  }

  public static buildEntityDataTrustee(trustees: TrusteeActivityData[]): EntityData[] {
    return trustees.map((elem) => {
      const returnColumns: { [key: string]: EntityColumnData } = {};
      returnColumns.CountActivities = { Value: elem.CountActivities, IsReadOnly: true };

      return { Columns: returnColumns, Display: elem.Display ?? '', LongDisplay: elem.LongDisplay ?? '', Keys: [elem.UidTrustee ?? ''] };
    });
  }

  public static buildEntityDataResource(resources: ResourceActivityData[]): EntityData[] {
    return resources.map((elem) => {
      const returnColumns: { [key: string]: EntityColumnData } = {};
      returnColumns.CountActivities = { Value: elem.CountActivities, IsReadOnly: true };

      return { Columns: returnColumns, Display: elem.Display ?? '', LongDisplay: elem.LongDisplay ?? '', Keys: [elem.UidQamDug ?? ''] };
    });
  }
}
