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

import { EntityCollectionData, EntityData, TypedEntityBuilder, TypedEntityCollectionData } from 'imx-qbm-dbts';
import { CompareItem } from './compare-item';
import { RoleCompareItem } from 'imx-api-qer';

export class CompareItemBuilder {
  public readonly entitySchema = CompareItem.GetEntitySchema();

  private readonly builder = new TypedEntityBuilder(CompareItem);

  public build(entityCollectionData: EntityCollectionData): TypedEntityCollectionData<CompareItem> {
    return this.builder.buildReadWriteEntities(entityCollectionData, this.entitySchema);
  }

  public buildEntityCollectionData(items: RoleCompareItem[]): EntityCollectionData {
    const entities = items.map((elem) => this.buildEntityData(elem));
    return { Entities: entities, TotalCount: items.length };
  }

  public buildEntityData(item: RoleCompareItem): EntityData {
    return {
      Columns: {
        ObjectTypeDisplay: { Value: item.ObjectTypeDisplay },
        Display: { Value: item.Display },
        XOriginRole1: { Value: item.XOriginRole1 },
        XOriginRole2: { Value: item.XOriginRole2 },
      },
    };
  }
}
