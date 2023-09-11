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

import { OverlayRef } from '@angular/cdk/overlay';
import { EuiLoadingService } from '@elemental-ui/core';

import {
  CollectionLoadParameters,
  EntityCollectionData,
  EntityData,
  HierarchyData,
  IEntity,
  IForeignKeyInfo,
  TypedEntityBuilder,
  ValType
} from 'imx-qbm-dbts';
import { TreeDatabase } from '../data-tree/tree-database';
import { TreeNodeResultParameter } from '../data-tree/tree-node-result-parameter.interface';
import { HierarchicalCandidate } from './hierarchical-candidate';

export class HierarchicalFkDatabase extends TreeDatabase {

  public fkTable: IForeignKeyInfo;

  private readonly builder = new TypedEntityBuilder(HierarchicalCandidate);

  constructor(
    private busyLoadingService: EuiLoadingService
  ) {
    super();
    this.canSearch = true;
  }

  /** implements the getData methode of TreeDataBase */
  public async getData(showLoading: boolean, parameters: CollectionLoadParameters = { ParentKey: '' /* first level */ })
    : Promise<TreeNodeResultParameter> {
    if (!this.fkTable) {
      return { entities: [], canLoadMore: false, totalCount: 0 };
    }

    const opts = {
      PageSize: 25,
      StartIndex: 0,
      ...parameters
    };

    let over: OverlayRef;
    if (showLoading) {
      setTimeout(() => over = this.busyLoadingService.show());
    }

    let data: EntityCollectionData;

    try {
      data = await this.fkTable.Get(opts);
    } finally {
      if (showLoading) {
        setTimeout(() => this.busyLoadingService.hide(over));
      }
    }

    if (data) {
      const nodeEntities = await Promise.all(data.Entities.map(async (elem): Promise<IEntity> => {
        return (await this.buildEntityWithHasChilderen(elem, data.Hierarchy)).GetEntity();
      }));
      this.dataChanged.emit(nodeEntities);
      return { entities: nodeEntities, canLoadMore: opts.StartIndex + opts.PageSize < data.TotalCount, totalCount: data.TotalCount };
    }
    return { entities: [], canLoadMore: false, totalCount: 0 };
  }

  /** adds a hasChildren column to the entity */
  public async buildEntityWithHasChilderen(entityData: EntityData, data: HierarchyData): Promise<HierarchicalCandidate> {

    const entity = this.builder.buildReadWriteEntity({ entitySchema: HierarchicalCandidate.GetEntitySchema(), entityData });
    entity.GetEntity().AddColumns([{
      Type: ValType.Bool,
      IsMultiValued: true,
      ColumnName: 'HasChildren',
      MinLen: 0,
      Display: ''
    }]);
    await entity.GetEntity().GetColumn('HasChildren')
      .PutValue(data ? data.EntitiesWithHierarchy.some(elem => entityData.Keys.some(key => key === elem)) : false);

    return entity;
  }

}
