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

import {
  DataModel,
  EntityCollectionData,
  ExtendedTypedEntityCollection,
  FilterData,
  FilterTreeData,
  GroupInfoData,
  MethodDefinition,
  MethodDescriptor,
  TypedEntityCollectionData,
} from 'imx-qbm-dbts';
import { AttCaseDataRead, PortalAttestationCase, V2ApiClientMethodFactory } from 'imx-api-att';
import { ParameterDataService, ParameterDataLoadParameters } from 'qer';
import { ApiService } from '../api.service';
import { AttestationHistoryCase } from './attestation-history-case';
import { AttestationCaseLoadParameters } from './attestation-case-load-parameters.interface';
import { DataSourceToolbarExportMethod } from 'qbm';

@Injectable({
  providedIn: 'root',
})
export class AttestationHistoryService {
  constructor(private readonly attClient: ApiService, private readonly parameterDataService: ParameterDataService) {}

  public async get(
    parameters: AttestationCaseLoadParameters
  ): Promise<ExtendedTypedEntityCollection<PortalAttestationCase, AttCaseDataRead>> {
    return this.attClient.typedClient.PortalAttestationCase.Get(parameters);
  }

  public async getAttestations(loadParameters?: AttestationCaseLoadParameters): Promise<TypedEntityCollectionData<AttestationHistoryCase>> {
    const collection = await this.get(loadParameters);
    return {
      tableName: collection.tableName,
      totalCount: collection.totalCount,
      Data: collection.Data.map((item: PortalAttestationCase, index: number) => {
        const parameterDataContainer = this.parameterDataService.createContainer(
          item.GetEntity(),
          { ...collection.extendedData, ...{ index } },
          (parameters) => this.getParameterCandidates(parameters),
          (treefilterparameter) => this.getFilterTree(treefilterparameter)
        );

        return new AttestationHistoryCase(item, parameterDataContainer, { ...collection.extendedData, ...{ index } });
      }),
    };
  }

  public exportAttestation(loadParameters: AttestationCaseLoadParameters): DataSourceToolbarExportMethod {
    const factory = new V2ApiClientMethodFactory();
    return {
      getMethod: (withProperties: string, PageSize?: number) => {
        let method: MethodDescriptor<EntityCollectionData>;
        if (PageSize) {
          method = factory.portal_attestation_case_get({...loadParameters, withProperties, PageSize, StartIndex: 0})
        } else {
          method = factory.portal_attestation_case_get({...loadParameters, withProperties})
        }
        return new MethodDefinition(method);
      }
    }
  }

  public async getDataModel(objecttable?: string, objectuid?: string, groupFilter?: FilterData[]): Promise<DataModel> {
    return this.attClient.client.portal_attestation_case_datamodel_get({
      objecttable: objecttable,
      objectuid: objectuid,
      filter: groupFilter,
    });
  }

  public getGroupInfo(parameters: AttestationCaseLoadParameters = {}): Promise<GroupInfoData> {
    // remove groupFilter from parameters
    const {withProperties, groupFilter, search, OrderBy, ...paramsWithoutGroupFilter } = parameters;
    return this.attClient.client.portal_attestation_case_group_get({
      ...paramsWithoutGroupFilter,
      ...{ withcount: true, filter: parameters.groupFilter },
    });
  }

  private async getParameterCandidates(parameters: ParameterDataLoadParameters): Promise<EntityCollectionData> {
    return this.attClient.client.portal_attestation_case_parameter_candidates_post(
      parameters.columnName,
      parameters.fkTableName,
      parameters.diffData,
      parameters
    );
  }

  private async getFilterTree(parameters: ParameterDataLoadParameters): Promise<FilterTreeData> {
    return this.attClient.client.portal_attestation_case_parameter_candidates_filtertree_post(
      parameters.columnName,
      parameters.fkTableName,
      parameters.diffData,
      {
        ...parameters,
        parentkey: parameters.ParentKey,
      }
    );
  }
}
