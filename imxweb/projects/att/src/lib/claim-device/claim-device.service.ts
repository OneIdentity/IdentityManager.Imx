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

import { CollectionLoadParameters, EntityCollectionData, IEntityColumn, MetaTableRelationData, ValType } from 'imx-qbm-dbts';
import { BaseCdr, EntityService } from 'qbm';
import { ApiService } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class ClaimDeviceService {
  constructor(private readonly apiService: ApiService, private readonly entityService: EntityService) { }

  public async canClaimDevice(): Promise<boolean> {
    return (await this.apiService.client.portal_attestation_userconfig_get()).CanClaimDevice;
  }

  public async assignOwner(key: string, uidOwner: string): Promise<any> {
    return this.apiService.client.portal_claimdevice_post(uidOwner, key);
  }

  public createCdrForDevice(): BaseCdr {
    const column = this.createColumn(
      {
        ChildColumnName: 'UID_Hardware',
        IsMemberRelation: false,
        ParentTableName: 'Hardware',
        ParentColumnName: 'XObjectKey'
      },
      parameters => this.apiService.client.portal_claimdevice_devices_get(parameters),
    );

    return new BaseCdr(column, '#LDS#Device' /* TODO: globalize */);
  }

  private createColumn(
    fkRelation: MetaTableRelationData,
    loadFkCandidates: (parameters: CollectionLoadParameters) => Promise<EntityCollectionData>,
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
        getDataModel: async () => ({ Filters: [] }),
        getFilterTree: async () => ({ Elements: [] })
      }]
    );
  }



  private async getOwnerCandidates(
    parameters: CollectionLoadParameters = {}
  ): Promise<EntityCollectionData> {
    const collection = await this.apiService.client.portal_candidates_Person_get(parameters);

    return collection;
  }
}
