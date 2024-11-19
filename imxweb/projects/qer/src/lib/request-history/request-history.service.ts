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
  EntitySchema,
  ExtendedTypedEntityCollection,
  DataModel,
  MethodDescriptor,
  EntityCollectionData,
  MethodDefinition,
} from 'imx-qbm-dbts';
import { ArchivedRequestHistoryLoadParameters, RequestHistoryLoadParameters } from './request-history-load-parameters.interface';
import {
  PortalCartitem,
  PortalItshopRequests,
  ProlongationInput,
  PwoExtendedData,
  PwoUnsubscribeInput,
  PwoUnsubscribeResult,
  V2ApiClientMethodFactory,
} from 'imx-api-qer';
import { ItshopRequest } from './itshop-request';
import { ItshopRequestData } from '../itshop/request-info/itshop-request-data';
import { QerApiService } from '../qer-api-client.service';
import { DataSourceToolbarExportMethod, DataSourceToolbarFilter } from 'qbm';
import { ItshopRequestService } from '../itshop/itshop-request.service';

@Injectable()
export class RequestHistoryService {
  public abortController = new AbortController();

  constructor(private readonly qerClient: QerApiService, private readonly itshopRequest: ItshopRequestService) {}

  public get PortalItshopRequestsSchema(): EntitySchema {
    return this.qerClient.typedClient.PortalItshopRequests.GetSchema();
  }

  public async getRequests(
    userUid: string,
    parameters: RequestHistoryLoadParameters
  ): Promise<ExtendedTypedEntityCollection<ItshopRequest, PwoExtendedData>> {
    const collection = await this.qerClient.typedClient.PortalItshopRequests.Get(parameters, { signal: this.abortController.signal });

    if (!collection) {
      return undefined;
    }
    return {
      ...collection,
      Data: collection.Data.map((element, index) => {
        const requestData = new ItshopRequestData({ ...collection.extendedData, ...{ index } });
        const parameterColumns = this.itshopRequest.createParameterColumns(element.GetEntity(), requestData.parameters);
        return new ItshopRequest(element.GetEntity(), requestData.pwoData, parameterColumns, userUid);
      }),
    };
  }

  public exportRequests(parameters: RequestHistoryLoadParameters): DataSourceToolbarExportMethod {
    const factory = new V2ApiClientMethodFactory();
    return {
      getMethod: (withProperties: string, PageSize?: number) => {
        let method: MethodDescriptor<EntityCollectionData>;
        if (PageSize) {
          method = factory.portal_itshop_requests_get({ ...parameters, withProperties, PageSize, StartIndex: 0 });
        } else {
          method = factory.portal_itshop_requests_get({ ...parameters, withProperties });
        }
        return new MethodDefinition(method);
      },
    };
  }

  public async getArchivedRequests(
    userUid: string,
    recipientId: string
  ): Promise<ExtendedTypedEntityCollection<ItshopRequest, PwoExtendedData>> {
    const dummy: ArchivedRequestHistoryLoadParameters = {};
    recipientId ? (dummy.uidpersonordered = recipientId) : (dummy.uidpersoninserted = userUid);
    const collection = await this.qerClient.typedClient.PortalItshopHistoryRequests.Get(new Date(), dummy, {
      signal: this.abortController.signal,
    });
    if (!collection) {
      return undefined;
    }
    return {
      ...collection,
      Data: collection.Data.map((element, index) => {
        const requestData = new ItshopRequestData({ ...collection.extendedData, ...{ index } });
        const parameterColumns = this.itshopRequest.createParameterColumns(element.GetEntity(), requestData.parameters);
        const request = new ItshopRequest(element.GetEntity(), requestData.pwoData, parameterColumns, userUid);
        request.isArchived = true;
        return request;
      }),
    };
  }

  // TODO 409926: This api endpoint needs collection load + withProps to be used
  // public exportArchivedRequests(userUid: string, recipientId: string, parameters: ArchivedRequestHistoryLoadParameters): DataSourceToolbarExportMethod {
  //   const factory = new V2ApiClientMethodFactory();
  //   recipientId ? parameters.uidpersonordered = recipientId : parameters.uidpersoninserted = userUid;
  //   return {
  //     getMethod: (withProperties: string, PageSize?: number) => {
  //       let method: MethodDescriptor<EntityCollectionData>;
  //       if (PageSize) {
  //         method = factory.portal_itshop_history_requests_get(new Date(), {...parameters, withProperties, PageSize, StartIndex: 0})
  //       } else {
  //         method = factory.portal_itshop_history_requests_get(new Date(), {...parameters, withProperties})
  //       }
  //       return new MethodDefinition(method);
  //     }
  //   }
  // }

  public async getFilterOptions(userUid: string, filterPresets: { [name: string]: string } = {}): Promise<DataSourceToolbarFilter[]> {
    return (await this.getDataModel(userUid)).Filters.map((option: DataSourceToolbarFilter) => {
      option.InitialValue = filterPresets[option.Name];
      return option;
    });
  }

  public async getDataModel(userUid: string): Promise<DataModel> {
    return this.qerClient.client.portal_itshop_requests_datamodel_get({ UID_Person: userUid });
  }

  public async prolongate(pwo: PortalItshopRequests, input: ProlongationInput): Promise<void> {
    return this.qerClient.client.portal_itshop_prolongate_post(this.getUidPwo(pwo), input);
  }

  public async unsubscribe(input: PwoUnsubscribeInput): Promise<PwoUnsubscribeResult> {
    return this.qerClient.client.portal_itshop_unsubscribe_post(input);
  }

  public async cancelRequest(pwo: PortalItshopRequests, reason: string): Promise<void> {
    return this.qerClient.client.portal_itshop_cancel_post(this.getUidPwo(pwo), { Reason: reason });
  }

  public async recallQuery(pwo: PortalItshopRequests, reason: string): Promise<void> {
    return this.qerClient.client.portal_itshop_recallquery_post(this.getUidPwo(pwo), { Reason: reason });
  }

  public async recallDecision(pwo: PortalItshopRequests, reason: string): Promise<void> {
    return this.qerClient.client.portal_itshop_recalldecision_post(this.getUidPwo(pwo), { Reason: reason });
  }

  public async resetReservation(pwo: PortalItshopRequests, reason: string): Promise<void> {
    return this.qerClient.client.portal_itshop_resetreservation_post(this.getUidPwo(pwo), { Reason: reason });
  }

  public async revokeDelegation(pwo: PortalItshopRequests, reason: string): Promise<void> {
    return this.qerClient.client.portal_itshop_revokedelegation_post(this.getUidPwo(pwo), { Reason: reason });
  }

  public async revokeAdditionalApprover(pwo: PortalItshopRequests, reason: string): Promise<void> {
    return this.qerClient.client.portal_itshop_revokeadditional_post(this.getUidPwo(pwo), { Reason: reason });
  }

  public async escalateDecision(pwo: PortalItshopRequests, reason: string): Promise<void> {
    return this.qerClient.client.portal_itshop_escalate_post(this.getUidPwo(pwo), { Reason: reason });
  }

  private getUidPwo(pwo: PortalItshopRequests): string {
    return pwo.GetEntity().GetKeys()[0];
  }

  public async copyRequest(pwo: PortalItshopRequests): Promise<PortalCartitem> {
    const item = this.qerClient.typedClient.PortalCartitem.createEntity({
      Columns: {
        UID_AccProduct: { Value: pwo.UID_AccProduct.value },
      },
    });

    item.UID_PwoSource.Column.PutValue(pwo.GetEntity().GetKeys()[0]);
    item.UID_PersonOrdered.Column.PutValue(pwo.UID_PersonOrdered.value);

    await this.qerClient.typedClient.PortalCartitem.Post(item);

    return item;
  }

  public abortCall(): void {
    this.abortController.abort();
    this.abortController = new AbortController();
  }
}
