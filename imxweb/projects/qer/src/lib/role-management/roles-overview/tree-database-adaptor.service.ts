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

import { OverlayRef } from '@angular/cdk/overlay';
import { EuiLoadingService } from '@elemental-ui/core';
import { OwnershipInformation } from 'imx-api-qer';
import { CollectionLoadParameters, EntityData, EntitySchema, HierarchyData, IEntity, TypedEntityBuilder, ValType } from 'imx-qbm-dbts';
import { SettingsService, TreeDatabase, TreeNodeResultParameter } from 'qbm';
import { RoleService } from '../role.service';

export class TreeDatabaseAdaptorService extends TreeDatabase {
  private entitySchema: EntitySchema;
  private builder: TypedEntityBuilder<any>;

  constructor(
    private readonly roleService: RoleService,
    private readonly settingsService: SettingsService,
    private readonly busyService: EuiLoadingService,
    private readonly ownershipInfo: OwnershipInformation,
    type: any) {
    super();
    this.canSearch = true;
    this.builder = new TypedEntityBuilder(type);
  }

  public async getData(
    showLoading: boolean,
    parameter: CollectionLoadParameters = { ParentKey: '' /* first level */ })
    : Promise<TreeNodeResultParameter> {
    if (this.ownershipInfo == null) {
      return { entities: [], canLoadMore: false, totalCount: 0 };
    }

    let overlay: OverlayRef;

    if (showLoading) {
      setTimeout(() => { overlay = this.busyService.show(); });
    }

    try {
      const navigationState = {
        ...parameter,
        ...{
          PageSize: this.settingsService.DefaultPageSize,
          StartIndex: parameter.StartIndex ? parameter.StartIndex : 0
        }
      };

      const data = await this.roleService.getEntitiesForTree(this.ownershipInfo.TableName, navigationState);

      if (data) {
        const nodeEntities = await Promise.all(data.Entities.map(async (elem): Promise<IEntity> => {
          return (await this.buildEntityWithHasChildren(elem, data.Hierarchy)).GetEntity();
        }));
        this.dataChanged.emit(nodeEntities);
        return {
          entities: nodeEntities,
          canLoadMore: navigationState.StartIndex + navigationState.PageSize < data.TotalCount,
          totalCount: data.TotalCount
        };
      }
      return { entities: [], canLoadMore: false, totalCount: 0 };
    } finally {

      if (showLoading) {
        setTimeout(() => { this.busyService.hide(overlay); });
      }
    }
  }

  public async prepare(
    entitySchema: EntitySchema): Promise<void> {
    this.entitySchema = entitySchema;
    this.reloadData();
  }

  /** adds a hasChildren column to the entity */
  private async buildEntityWithHasChildren(entityData: EntityData, data: HierarchyData): Promise<any> {

    const entity = this.builder.buildReadWriteEntity({ entitySchema: this.entitySchema, entityData });
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
