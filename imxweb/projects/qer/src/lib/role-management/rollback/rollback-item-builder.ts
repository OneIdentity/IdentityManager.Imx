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

import { Injectable } from '@angular/core';

import { EntityCollectionData, EntityData, TypedEntityBuilder, TypedEntityCollectionData } from 'imx-qbm-dbts';
import { RollbackItem, ComparisonItem } from './rollback-item';

@Injectable({
  providedIn: 'root',
})
export class RollbackItemBuilder {
  public readonly entitySchema = RollbackItem.GetEntitySchema();

  private readonly builder = new TypedEntityBuilder(RollbackItem);

  public build(entityCollectionData: EntityCollectionData): TypedEntityCollectionData<RollbackItem> {
    return this.builder.buildReadWriteEntities(entityCollectionData, this.entitySchema);
  }

  public buildEntityCollectionData(items: ComparisonItem[]): EntityCollectionData {
    const entities = items.map((elem) => this.buildEntityData(elem));
    return { Entities: entities, TotalCount: items.length };
  }

  public buildEntityData(item: ComparisonItem): EntityData {
    return {
      Columns: {
        CurrentValueDisplay: { Value: item.CurrentValueDisplay },
        HasChanged: { Value: item.HasChanged },
        ChangeType: { Value: item.ChangeType },
        HistoryValueDisplay: { Value: item.HistoryValueDisplay },
        Property: { Value: item.Property },
        TableName: { Value: item.TableName },
        Id: { Value: item.Id },
        TypeDisplay: { Value: item.TypeDisplay },
      },
      Keys: [item.Id ?? [item.ChangeType ?? '', item.CurrentValueDisplay ?? '', item.HistoryValueDisplay ?? '',item.TypeDisplay ?? ''].join('_')],
    };
  }
}
