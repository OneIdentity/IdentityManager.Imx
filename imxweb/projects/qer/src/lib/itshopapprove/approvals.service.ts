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
 * Copyright 2024 One Identity LLC.
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
  DecisionInput,
  DenyDecisionInput,
  DirectDecisionInput,
  OtherApproverInput,
  PortalItshopApproveRequests,
  PwoExtendedData,
  PwoQueryInput,
  ReasonInput,
  RecallDecisionInput,
  V2ApiClientMethodFactory,
} from '@imx-modules/imx-api-qer';
import {
  ApiRequestOptions,
  DataModel,
  EntityCollectionData,
  EntitySchema,
  ExtendedTypedEntityCollection,
  MethodDefinition,
  MethodDescriptor,
} from '@imx-modules/imx-qbm-dbts';
import { DataSourceToolbarExportMethod } from 'qbm';
import { ItshopRequestService } from '../itshop/itshop-request.service';
import { QerApiService } from '../qer-api-client.service';
import { Approval } from './approval';
import { ApprovalsLoadParameters } from './approvals-load-parameters';

@Injectable()
export class ApprovalsService {
  public abortController = new AbortController();

  constructor(
    private readonly apiService: QerApiService,
    private readonly itshopRequest: ItshopRequestService,
  ) {}

  public get PortalItshopApproveRequestsSchema(): EntitySchema {
    return this.apiService.typedClient.PortalItshopApproveRequests.GetSchema();
  }

  /** Is the user working as an escalation approver? */
  public get isChiefApproval() {
    return this.itshopRequest.isChiefApproval;
  }
  public set isChiefApproval(val: boolean) {
    this.itshopRequest.isChiefApproval = val;
  }

  public abortCall(): void {
    this.abortController.abort();
    this.abortController = new AbortController();
  }

  public async get(
    parameters: ApprovalsLoadParameters,
    requestOpts?: ApiRequestOptions,
  ): Promise<ExtendedTypedEntityCollection<Approval, PwoExtendedData | undefined> | undefined> {
    const collection = await this.apiService.typedClient.PortalItshopApproveRequests.Get(
      {
        Escalation: this.isChiefApproval,
        ...parameters,
      },
      requestOpts,
    );

    return collection == null
      ? undefined
      : {
          tableName: collection.tableName,
          totalCount: collection.totalCount,
          Data: collection.Data.map((element, index) => {
            const parameter = collection.extendedData ? { ...collection.extendedData, ...{ index } } : undefined;
            return this.itshopRequest.createRequestApprovalItem(element, parameter);
          }),
          extendedData: collection.extendedData,
        };
  }

  public exportApprovalRequests(parameters: ApprovalsLoadParameters): DataSourceToolbarExportMethod {
    const params: ApprovalsLoadParameters = {
      Escalation: this.isChiefApproval,
      ...parameters,
    };
    const factory = new V2ApiClientMethodFactory();
    return {
      getMethod: (withProperties: string, PageSize?: number) => {
        let method: MethodDescriptor<EntityCollectionData>;
        if (PageSize) {
          method = factory.portal_itshop_approve_requests_get({ ...params, withProperties, PageSize, StartIndex: 0 });
        } else {
          method = factory.portal_itshop_approve_requests_get({ ...params, withProperties });
        }
        return new MethodDefinition(method);
      },
    };
  }

  public async getApprovalDataModel(signal?: AbortSignal): Promise<DataModel> {
    return this.apiService.client.portal_itshop_approve_requests_datamodel_get(undefined, { signal });
  }

  public async recallDecision(pwo: PortalItshopApproveRequests, approver: RecallDecisionInput): Promise<any> {
    await this.apiService.client.portal_itshop_recalldecision_post(this.getUidPwo(pwo), approver);
  }

  public async revokeDelegation(pwo: PortalItshopApproveRequests, approver: ReasonInput): Promise<any> {
    await this.apiService.client.portal_itshop_revokedelegation_post(this.getUidPwo(pwo), approver);
  }

  public async withdrawAdditionalApprover(pwo: PortalItshopApproveRequests, approver: ReasonInput): Promise<any> {
    await this.apiService.client.portal_itshop_revokeadditional_post(this.getUidPwo(pwo), approver);
  }

  public async askForHelp(pwo: PortalItshopApproveRequests, para: PwoQueryInput): Promise<void> {
    await this.apiService.client.portal_itshop_query_post(this.getUidPwo(pwo), para);
  }

  public async recallInquiry(pwo: PortalItshopApproveRequests, reason: ReasonInput): Promise<void> {
    return this.apiService.client.portal_itshop_recallquery_post(this.getUidPwo(pwo), reason);
  }
  public async resetReservation(pwo: PortalItshopApproveRequests, reason: ReasonInput): Promise<void> {
    return this.apiService.client.portal_itshop_resetreservation_post(this.getUidPwo(pwo), reason);
  }

  public async addApprover(pwo: PortalItshopApproveRequests, approver: OtherApproverInput): Promise<any> {
    await this.apiService.client.portal_itshop_additional_post(this.getUidPwo(pwo), approver);
  }

  public async delegateDecision(pwo: PortalItshopApproveRequests, approver: OtherApproverInput): Promise<any> {
    return this.apiService.client.portal_itshop_insteadof_post(this.getUidPwo(pwo), approver);
  }

  public async denyDecision(pwo: PortalItshopApproveRequests, decision: DenyDecisionInput): Promise<any> {
    return this.apiService.client.portal_itshop_denydecision_post(this.getUidPwo(pwo), decision);
  }

  public async escalateDecision(pwo: PortalItshopApproveRequests, reason: string): Promise<any> {
    return this.apiService.client.portal_itshop_escalate_post(this.getUidPwo(pwo), { Reason: reason });
  }

  public async directDecision(pwo: PortalItshopApproveRequests, directDecision: DirectDecisionInput): Promise<void> {
    return this.apiService.client.portal_itshop_directdecision_post(this.getUidPwo(pwo), directDecision);
  }

  public async makeDecision(pwo: PortalItshopApproveRequests, decision: DecisionInput): Promise<void> {
    await this.apiService.client.portal_itshop_decide_post(this.getUidPwo(pwo), decision);
  }

  public async answerQuestion(pwo: PortalItshopApproveRequests, answerInput: string): Promise<void> {
    return this.apiService.client.portal_itshop_answerquery_post(this.getUidPwo(pwo), { Reason: answerInput });
  }

  private getUidPwo(pwo: PortalItshopApproveRequests): string {
    return pwo.GetEntity().GetKeys()[0];
  }
}
