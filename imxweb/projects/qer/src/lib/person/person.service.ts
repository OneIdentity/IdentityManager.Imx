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

import { EntityService } from 'qbm';
import {
  TypedEntityCollectionData,
  CollectionLoadParameters,
  MetaTableRelationData,
  FkProviderItem,
  IEntityColumn,
  ValType,
  FilterData,
  DataModel,
  GroupInfoData,
  EntitySchema,
} from 'imx-qbm-dbts';
import { PortalPersonAll, PortalPersonMasterdata, PortalPersonUid } from 'imx-api-qer';
import { QerApiService } from '../qer-api-client.service';
import { PersonAllLoadParameters } from './person-all-load-parameters.interface';

@Injectable({
  providedIn: 'root',
})
export class PersonService {
  public get schemaPersonUid(): EntitySchema {
    return this.qerClient.typedClient.PortalPersonUid.GetSchema();
  }

  public get schemaPersonAll(): EntitySchema {
    return this.qerClient.typedClient.PortalPersonAll.GetSchema();
  }

  constructor(private readonly qerClient: QerApiService, private readonly entityService: EntityService) {}

  public async getMasterdataInteractive(uid: string): Promise<TypedEntityCollectionData<PortalPersonMasterdata>> {
    return this.qerClient.typedClient.PortalPersonMasterdataInteractive.Get_byid(uid);
  }

  public async getMasterdata(parameters: CollectionLoadParameters = {}): Promise<TypedEntityCollectionData<PortalPersonMasterdata>> {
    return this.qerClient.typedClient.PortalPersonMasterdata.Get(parameters);
  }

  public async get(uid: string, parameters: CollectionLoadParameters = {}): Promise<TypedEntityCollectionData<PortalPersonUid>> {
    return this.qerClient.typedClient.PortalPersonUid.Get(uid, parameters);
  }

  public async getAll(parameters: CollectionLoadParameters = {}): Promise<TypedEntityCollectionData<PortalPersonAll>> {
    return this.qerClient.typedClient.PortalPersonAll.Get(parameters);
  }

  public async getDataModel(filter?: FilterData[]): Promise<DataModel> {
    return this.qerClient.client.portal_person_all_datamodel_get({ filter: filter });
  }

  public getGroupInfo(parameters: PersonAllLoadParameters = {}): Promise<GroupInfoData> {
    const { withProperties, OrderBy, search, ...params } = parameters;
    return this.qerClient.v2Client.portal_person_all_group_get({
      ...params,
      withcount: true,
    });
  }

  public createColumnCandidatesPerson(): IEntityColumn {
    const fkRelation = {
      ChildColumnName: 'UID_Person',
      IsMemberRelation: false,
      ParentTableName: 'Person',
      ParentColumnName: 'UID_Person',
    };

    return this.entityService.createLocalEntityColumn(
      {
        ColumnName: fkRelation.ChildColumnName,
        Type: ValType.String,
        MinLen: 1,
        FkRelation: fkRelation,
      },
      [this.createFkProviderItem(fkRelation)]
    );
  }

  public createFkProviderItem(fkRelation: MetaTableRelationData, filter?: FilterData[]): FkProviderItem {
    return {
      columnName: fkRelation.ChildColumnName,
      fkTableName: fkRelation.ParentTableName,
      parameterNames: ['OrderBy', 'StartIndex', 'PageSize', 'filter', 'withProperties', 'search'],
      load: async (_, parameters: CollectionLoadParameters = {}) =>
        this.qerClient.v2Client.portal_person_active_get({ ...parameters, filter }),
      getDataModel: async () => ({}),
      getFilterTree: async () => ({ Elements: [] }),
    };
  }
}
