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
