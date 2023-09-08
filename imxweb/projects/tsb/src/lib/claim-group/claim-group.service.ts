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

import { Injectable } from '@angular/core';

import { CollectionLoadParameters, DbObjectKey, EntityCollectionData, IEntityColumn, MetaTableRelationData, ValType } from 'imx-qbm-dbts';
import { BaseCdr, EntityService } from 'qbm';
import { TsbApiService } from '../tsb-api-client.service';

@Injectable({
  providedIn: 'root'
})
export class ClaimGroupService {
  constructor(private readonly apiService: TsbApiService, private readonly entityService: EntityService) { }

  public async hasSuggestedOwners(tableName: string, key: string): Promise<boolean> {
    const collection = await this.getOwnerCandidates(tableName, key);
    return collection.Entities != null && collection.Entities.length > 0;
  }

  public async assignOwner(tableName: string, key: string, uidOwner: string): Promise<any> {
    return this.apiService.client.portal_claimgroup_post(uidOwner, tableName, key);
  }

  public getFkValue(column: IEntityColumn): { table?: string, key?: string; } {
    const dbObjectKey = DbObjectKey.FromXml(column.GetValue());
    return {
      table: dbObjectKey.TableName,
      key: dbObjectKey.Keys[0]
    };
  }

  public createCdrSystemEntitlement(): BaseCdr {
    const column = this.createColumn(
      {
        ChildColumnName: 'UID_UNSGroup',
        IsMemberRelation: false,
        ParentTableName: 'UNSGroup',
        ParentColumnName: 'XObjectKey'
      },
      parameters => this.apiService.client.portal_claimgroup_group_get(parameters)
    );

    return new BaseCdr(column, '#LDS#System entitlement' /* TODO: globalize */);
  }

  public createColumnSuggestedOwner(tableName: string, key: string): IEntityColumn {
    const fkRelation = {
      ChildColumnName: 'UID_Owner',
      IsMemberRelation: false,
      ParentTableName: tableName,
      ParentColumnName: 'XObjectKey'
    };

    return this.createColumn(
      fkRelation,
      parameters => this.getOwnerCandidates(fkRelation.ParentTableName, key, parameters)
    );
  }

  private createColumn(
    fkRelation: MetaTableRelationData,
    loadFkCandidates: (parameters: CollectionLoadParameters) => Promise<EntityCollectionData>
  ): IEntityColumn {
    return this.entityService.createLocalEntityColumn(
      {
        ColumnName: fkRelation.ChildColumnName,
        Type: ValType.String,
        MinLen: 1,
        FkRelation: fkRelation
      },
      [{
        columnName: fkRelation.ChildColumnName,
        fkTableName: fkRelation.ParentTableName,
        parameterNames: [
          'OrderBy',
          'StartIndex',
          'PageSize',
          'filter',
          'search',
        ],
        load: async (_, parameters: CollectionLoadParameters = {}) => loadFkCandidates(parameters),
        getDataModel: async () => ({}),
        getFilterTree: async () => ({ Elements: [] })
      }]
    );
  }

  private async getOwnerCandidates(
    tableName: string, uid: string, parameters: CollectionLoadParameters = {}
  ): Promise<EntityCollectionData> {
    const collection = await this.apiService.client.portal_claimgroup_suggestedowner_get(
      tableName,
      uid,
      parameters);

    if (collection.Entities && collection.Entities.length > 0) {
      return collection;
    }

    return this.apiService.client.portal_claimgroup_suggestedowner2_get(
      tableName,
      uid,
      parameters);
  }
}
