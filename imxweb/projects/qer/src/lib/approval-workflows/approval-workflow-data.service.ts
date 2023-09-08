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

import { OverlayRef } from '@angular/cdk/overlay';
import { Injectable } from '@angular/core';
import { EuiLoadingService } from '@elemental-ui/core';
import {
  PortalRequestsWorkflowsSubmethods,
  PortalRequestsWorkflowsSubmethodsInteractive,
  PortalRequestsWorkflowsSubmethodsSteps,
  PortalRequestsWorkflowsSubmethodsStepsInteractive,
  WorkflowStepBulk,
  WorkflowStepBulkData,
} from 'imx-api-qer';
import { CollectionLoadParameters, EntitySchema, ExtendedTypedEntityCollection } from 'imx-qbm-dbts';
import { QerApiService } from '../qer-api-client.service';
import { GroupedData } from './approval-workflow.interface';

@Injectable({
  providedIn: 'root',
})
export class ApprovalWorkflowDataService {
  private busyIndicator: OverlayRef;

  constructor(private readonly qerClient: QerApiService, private readonly busyService: EuiLoadingService) {}

  public get approvalWorkFlowRequestColumns(): string[] {
    return ['Ident_PWODecisionSubMethod', 'Description', 'DaysToAbort'];
  }

  public get approvalWorkFlowLevelRequestColumns(): string[] {
    return ['LevelDisplay'];
  }

  public get approvalWorkFlowStepsRequestColumns(): GroupedData {
    return {
      General: [
        'Ident_PWODecisionStep',
        'UID_PWODecisionRule',
        'UID_PWOStateFinalSuccess',
        'UID_PWOStateFinalError',
        'ObjectKeyOfAssignedOrg',
        'UID_AERoleFallBack',
        'WhereClause',
        'CountApprover',
        'Description',
        'MinutesReminder',
        'MinutesAutomaticDecision',
        'AutomaticDecision',
        'ApproveReasonType',
        'DenyReasonType',
        'IsAdditionalAllowed',
        'IsInsteadOfAllowed',
        'IgnoreNoDecideForPerson',
        'IsToHideInHistory',
        'IsNoAutoDecision',
        'EscalateIfNoApprover',
      ],
      Mail: [
        'UID_DialogRichMailReminder',
        'UID_DialogRichMailInsert',
        'UID_DialogRichMailToDelegat',
        'UID_DialogRichMailGrant',
        'UID_DialogRichMailNoGrant',
        'UID_DialogRichMailEscalate',
        'UID_DialogRichMailFromDelegat',
      ],
    };
  }

  public get approvalworkflowSchema(): EntitySchema {
    return this.qerClient.typedClient.PortalRequestsWorkflowsSubmethods.GetSchema();
  }

  public get approvalWorkFlowStepsSchema(): EntitySchema {
    return this.qerClient.typedClient.PortalRequestsWorkflowsSubmethodsSteps.GetSchema();
  }

  public async getNewWorkFlow(): Promise<PortalRequestsWorkflowsSubmethodsInteractive> {
    const entities = await this.qerClient.typedClient.PortalRequestsWorkflowsSubmethodsInteractive.Get();
    return entities.Data[0];
  }

  public async getWorkFlows(
    parameters: CollectionLoadParameters
  ): Promise<ExtendedTypedEntityCollection<PortalRequestsWorkflowsSubmethods, unknown>> {
    return this.qerClient.typedClient.PortalRequestsWorkflowsSubmethods.Get(parameters);
  }

  public async getWorkFlowSteps(
    entityWorkFlowUid: string,
    parameters?: CollectionLoadParameters
  ): Promise<PortalRequestsWorkflowsSubmethodsSteps[]> {
    return (await this.qerClient.typedClient.PortalRequestsWorkflowsSubmethodsSteps.Get(entityWorkFlowUid, parameters)).Data;
  }

  public async getNewWorkFlowSteps(entityWorkFlowUid: string): Promise<PortalRequestsWorkflowsSubmethodsSteps[]> {
    const entities = await this.qerClient.typedClient.PortalRequestsWorkflowsSubmethodsSteps.Get(entityWorkFlowUid);
    return entities.Data;
  }

  public async getNewWorkflowStep(entityWorkFlowUid: string): Promise<PortalRequestsWorkflowsSubmethodsStepsInteractive> {
    const entities = await this.qerClient.typedClient.PortalRequestsWorkflowsSubmethodsStepsInteractive.Get(entityWorkFlowUid);
    return entities.Data[0];
  }

  public async workFlowDelete(uid: string): Promise<void> {
    await this.qerClient.client.portal_requests_workflows_submethods_delete(uid);
  }

  public async workFlowStepDelete(workflowUid: string, stepUid: string): Promise<void> {
    await this.qerClient.client.portal_requests_workflows_submethods_steps_delete(workflowUid, stepUid);
  }

  public async getWorkFlowInteractve(workFlowUid: string): Promise<PortalRequestsWorkflowsSubmethodsInteractive> {
    const workFlowCollection = await this.qerClient.typedClient.PortalRequestsWorkflowsSubmethodsInteractive.Get_byid(workFlowUid);

    if (workFlowCollection == null || workFlowCollection.Data == null || workFlowCollection.Data.length === 0) {
      throw new Error('getWorkFlow - workflow not found');
    }

    return workFlowCollection.Data[0];
  }

  public async getWorkFlowStepsInteractive(
    workFlowUid: string,
    stepUid: string
  ): Promise<PortalRequestsWorkflowsSubmethodsStepsInteractive> {
    const workFlowStepCollection = await this.qerClient.typedClient.PortalRequestsWorkflowsSubmethodsStepsInteractive.Get_byid(
      workFlowUid,
      stepUid
    );

    if (workFlowStepCollection == null || workFlowStepCollection.Data == null || workFlowStepCollection.Data.length === 0) {
      throw new Error('getWorkflowSteps - Step not found');
    }

    return workFlowStepCollection.Data[0];
  }

  public async deleteWorkFlowStep(workflowUid: string, stepInteractive: PortalRequestsWorkflowsSubmethodsStepsInteractive): Promise<void> {
    await this.qerClient.typedClient.PortalRequestsWorkflowsSubmethodsStepsInteractive.Delete(workflowUid, stepInteractive);
  }

  public async saveDiffData(diffData: WorkflowStepBulkData[]): Promise<void> {
    const bulk: WorkflowStepBulk = {};
    bulk.Entities = diffData;
    await this.qerClient.v2Client.portal_requests_workflows_steps_post(bulk);
  }

  public handleOpenLoader(): void {
    if (!this.busyIndicator) {
      this.busyIndicator = this.busyService.show();
    }
  }

  public handleCloseLoader(): void {
    if (this.busyIndicator) {
      this.busyService.hide(this.busyIndicator);
      this.busyIndicator = undefined;
    }
  }

  public async waitForPromises(promises: Promise<any>[]): Promise<void> {
    this.handleOpenLoader();
    try {
      await Promise.all(promises);
    } finally {
      this.handleCloseLoader();
    }
  }
}
