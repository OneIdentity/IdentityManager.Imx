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
 * Copyright 2021 One Identity LLC.
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

import {
  DataModel,
  EntityCollectionData,
  ExtendedTypedEntityCollection,
  FilterData,
  FilterTreeData,
  GroupInfo,
  TypedEntityCollectionData
} from 'imx-qbm-dbts';
import { AttCaseDataRead, PortalAttestationCase } from 'imx-api-att';
import { ParameterDataService, ParameterDataLoadParameters } from 'qer';
import { ApiService } from '../api.service';
import { AttestationHistoryCase } from './attestation-history-case';
import { AttestationCaseLoadParameters } from './attestation-case-load-parameters.interface';

@Injectable({
  providedIn: 'root'
})
export class AttestationHistoryService {
  constructor(private readonly attClient: ApiService, private readonly parameterDataService: ParameterDataService) { }

  public async get(parameters: AttestationCaseLoadParameters):
    Promise<ExtendedTypedEntityCollection<PortalAttestationCase, AttCaseDataRead>> {
    return this.attClient.typedClient.PortalAttestationCase.Get(parameters);
  }

  public async getAttestations(loadParameters?: AttestationCaseLoadParameters):
    Promise<TypedEntityCollectionData<AttestationHistoryCase>> {
    const collection = await this.get(loadParameters);
    return {
      tableName: collection.tableName,
      totalCount: collection.totalCount,
      Data: collection.Data.map((item: PortalAttestationCase, index: number) => {
        const parameterDataContainer = this.parameterDataService.createContainer(
          item.GetEntity(),
          { ...collection.extendedData, ...{ index } },
          parameters => this.getParameterCandidates(parameters),
          treefilterparameter => this.getFilterTree(treefilterparameter)
        );

        return new AttestationHistoryCase(item, parameterDataContainer, { ...collection.extendedData, ...{ index } });
      })
    };
  }

  public async getDataModel(objecttable?: string, objectuid?: string, groupFilter?: FilterData[]): Promise<DataModel> {
    return this.attClient.client.portal_attestation_case_datamodel_get(objecttable, objectuid, groupFilter);
  }

  public async getGroupInfo(parameters: AttestationCaseLoadParameters = {}): Promise<GroupInfo[]> {
    return this.attClient.client.portal_attestation_case_group_get(
      parameters.by,
      parameters.def,
      parameters.groupFilter, // filter
      parameters.StartIndex,
      parameters.PageSize,
      true, // withcount
      parameters.state, // state
      parameters.attestationtype, // attestationtype
      parameters.uidpolicy, // uidpolicy
      parameters.type, // type
      parameters.risk, // risk
      parameters.objecttable,
      parameters.objectuid
    );
  }

  private async getParameterCandidates(parameters: ParameterDataLoadParameters): Promise<EntityCollectionData> {
    return this.attClient.client.portal_attestation_case_parameter_candidates_post(
      parameters.columnName,
      parameters.fkTableName,
      parameters.OrderBy,
      parameters.StartIndex,
      parameters.PageSize,
      parameters.filter,
      null,
      parameters.search,
      parameters.ParentKey,
      parameters.diffData
    );
  }

  private async getFilterTree(parameters: ParameterDataLoadParameters): Promise<FilterTreeData>
  {
    return this.attClient.client.portal_attestation_case_parameter_candidates_filtertree_post(
      parameters.columnName,
      parameters.fkTableName,
      parameters.filter,
      parameters.ParentKey,
      parameters.diffData
    );
  }
}
