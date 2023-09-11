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
import { HistoryFilterMode, PwoExtendedData } from 'imx-api-qer';
import { CollectionLoadParameters, CompareOperator, DataModel, EntitySchema, ExtendedTypedEntityCollection, FilterType } from 'imx-qbm-dbts';
import { ItshopRequestService } from '../../../itshop/itshop-request.service';
import { ItshopRequestData } from '../../../itshop/request-info/itshop-request-data';
import { QerApiService } from '../../../qer-api-client.service';
import { ItshopRequest } from '../../../request-history/itshop-request';

@Injectable({
  providedIn: 'root',
})
export class ApprovalHistoryService {
  constructor(private api: QerApiService, private itshopRequest: ItshopRequestService) {}


  public async getDataModel(): Promise<DataModel> {
    return this.api.client.portal_itshop_requests_datamodel_get();
  }

  public async getRequests(
    uidhelperpwo: string,
    filtermode: HistoryFilterMode,
    uidperson: string,
    parameter: CollectionLoadParameters
  ): Promise<ExtendedTypedEntityCollection<ItshopRequest, PwoExtendedData>> {

    const collection = await this.api.typedClient.PortalItshopRequests.Get({
      ...parameter,
      status: '4,1', // closed or active
      uidhelperpwo,
      filtermode,
      // tslint:disable-next-line: no-bitwise
      UID_PersonDecision: (filtermode & HistoryFilterMode.SameStep) === HistoryFilterMode.SameStep ? uidperson : undefined
    });

    return {
      tableName: collection.tableName,
      totalCount: collection.totalCount,
      extendedData: collection.extendedData,
      Data: collection.Data.map((element, index) => {
        const requestData = new ItshopRequestData({ ...collection.extendedData, ...{ index } });
        const parameterColumns = this.itshopRequest.createParameterColumns(element.GetEntity(), requestData.parameters);
        return new ItshopRequest(element.GetEntity(), requestData.pwoData, parameterColumns, uidperson);
      }),
    };
  }

  public get PortalItshopRequestsSchema(): EntitySchema {
    return this.api.typedClient.PortalItshopRequests.GetSchema();
  }
}
