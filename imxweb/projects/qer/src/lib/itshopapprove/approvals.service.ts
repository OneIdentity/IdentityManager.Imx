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

import { Injectable } from '@angular/core';

import { ExtendedTypedEntityCollection, EntitySchema, DataModel } from 'imx-qbm-dbts';
import {
  PortalItshopApproveRequests,
  OtherApproverInput,
  DirectDecisionInput,
  DecisionInput,
  PwoExtendedData,
  RecallDecisionInput,
  ReasonInput,
  DenyDecisionInput
} from 'imx-api-qer';
import { Approval } from './approval';
import { QerApiService } from '../qer-api-client.service';
import { ApprovalsLoadParameters } from './approvals-load-parameters';
import { ItshopRequestService } from '../itshop/itshop-request.service';

@Injectable()
export class ApprovalsService {

  constructor(private readonly apiService: QerApiService, private readonly itshopRequest: ItshopRequestService) { }

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

  public async get(parameters: ApprovalsLoadParameters):
    Promise<ExtendedTypedEntityCollection<Approval, PwoExtendedData>> {
    const collection = await this.apiService.typedClient.PortalItshopApproveRequests.Get({
      Escalation: this.isChiefApproval,
      ...parameters
    });
    return {
      tableName: collection.tableName,
      totalCount: collection.totalCount,
      Data: collection.Data.map((element, index) =>
        this.itshopRequest.createRequestApprovalItem(
          element,
          { ...collection.extendedData, ...{ index } }
        )
      ),
      extendedData: collection.extendedData
    };
  }

  public async getApprovalDataModel(): Promise<DataModel> {
    return this.apiService.client.portal_itshop_approve_requests_datamodel_get(undefined);
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

  private getUidPwo(pwo: PortalItshopApproveRequests): string {
    return pwo.GetEntity().GetKeys()[0];
  }
}
