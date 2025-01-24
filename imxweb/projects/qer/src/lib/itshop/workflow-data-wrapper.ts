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

import { EntityCollectionData, EntityData, MultiValue } from 'imx-qbm-dbts';
import { buildWorkingStepsOrdered } from './request-info/step-helper';

export class WorkflowDataWrapper {
  constructor(
    private readonly data: {
      WorkflowHistory?: EntityCollectionData;
      WorkflowData?: EntityCollectionData;
      WorkflowSteps?: EntityCollectionData;
      CanRevokeDelegation?: boolean;
    }
  ) {}

  public canEscalateDecision(decisionLevel: number): boolean {
    const workflowStep = this.data?.WorkflowSteps?.Entities?.find((step) => step.Columns.LevelNumber.Value === decisionLevel)?.Columns;

    return (workflowStep?.EscalationSteps?.Value ?? 0) !== 0;
  }

  public userAskedLastQuestion(userUid: string, decisionLevel: number): boolean {
    const questionHistory = this.data.WorkflowHistory.Entities.filter(
      (entityData) => entityData.Columns.DecisionLevel.Value === decisionLevel
    ).sort((item1, item2) => this.ascendingDate(item1.Columns.XDateInserted?.Value, item2.Columns.XDateInserted?.Value));
    return (
      questionHistory.length > 0 &&
      questionHistory[0].Columns.DecisionType.Value === 'Query' &&
      questionHistory[0].Columns.UID_PersonHead.Value === userUid
    );
  }

  public canDenyDecision(userUid: string, decisionLevel: number): boolean {
    return this.getWorkflowDataItem(userUid, decisionLevel)?.Columns?.IsFromDelegation?.Value;
  }

  public canRevokeDelegatedApprover(userUid: string, decisionLevel: number): boolean {
    return (
      this.data.CanRevokeDelegation && this.getWorkflowDataItem(userUid, decisionLevel)?.Columns?.UID_PersonInsteadOf?.Value?.length > 0
    );
  }

  public canRevokeAdditionalApprover(userUid: string, decisionLevel: number): boolean {
    return (
      this.data.CanRevokeDelegation && this.getWorkflowDataItem(userUid, decisionLevel)?.Columns?.UID_PersonAdditional?.Value?.length > 0
    );
  }

  public isInsteadOfAllowed(userUid: string, decisionLevel: number): boolean {
    const workflowDataItem = this.getWorkflowDataItem(userUid, decisionLevel);
    if (!workflowDataItem) return false;

    const workflowStep = this.getWorkflowStep(workflowDataItem);
    if (!workflowStep) return false;

    return (
      !workflowDataItem.Columns.IsFromDelegation?.Value &&
      !workflowDataItem.Columns.UID_PersonAdditional?.Value?.length &&
      !workflowDataItem.Columns.UID_PersonInsteadOf?.Value?.length &&
      workflowStep.Columns.IsInsteadOfAllowed?.Value
    );
  }

  public isInsteadOfAllowedForEscalation(qerWorkingMethode: string, decisionLevel: number): boolean {
    const currentStep = buildWorkingStepsOrdered(decisionLevel,qerWorkingMethode,this.data.WorkflowSteps).filter(elem=>elem.order === 1).pop();
    if(!currentStep) return false;


    const workflowDataItem = this.data.WorkflowData?.Entities.filter((item) => item.Columns.UID_QERWorkingStep.Value === currentStep.uidWorkingStep).pop();
    if (!workflowDataItem) return false;

    const workflowStep = this.data.WorkflowSteps?.Entities.filter((item) => item.Columns.UID_QERWorkingStep.Value === currentStep.uidWorkingStep).pop();
    if (!workflowStep) return false;

    this.getWorkflowStep(workflowDataItem);

    return (
      !workflowDataItem.Columns.IsFromDelegation?.Value &&
      !workflowDataItem.Columns.UID_PersonAdditional?.Value?.length &&
      !workflowDataItem.Columns.UID_PersonInsteadOf?.Value?.length &&
      workflowStep.Columns.IsInsteadOfAllowed?.Value
    );
  }

  public isAdditionalAllowed(userUid: string, decisionLevel: number): boolean {
    const workflowDataItem = this.getWorkflowDataItem(userUid, decisionLevel);

    if (workflowDataItem) {
      const workflowStep = this.getWorkflowStep(workflowDataItem);

      if (workflowStep) {
        return (
          !workflowDataItem.Columns.IsFromDelegation?.Value &&
          !workflowDataItem.Columns.UID_PersonAdditional?.Value?.length &&
          !workflowDataItem.Columns.UID_PersonInsteadOf?.Value?.length &&
          workflowStep.Columns.IsAdditionalAllowed?.Value
        );
      }
    }

    return false;
  }

  public getDirectSteps(userUid: string, decisionLevel: number): number[] {
    const workflowDataItem = this.getWorkflowDataItem(userUid, decisionLevel);

    if (workflowDataItem) {
      const workflowStep = this.getWorkflowStep(workflowDataItem);

      if (workflowStep) {
        return MultiValue.FromString(workflowStep.Columns.DirectSteps.Value)
          .GetValues()
          .map((step) => Number(step));
      }
    }

    return undefined;
  }

  private getWorkflowDataItem(userUid: string, decisionLevel: number): EntityData {
    return this.data.WorkflowData?.Entities.filter(
      (item) => item.Columns.UID_PersonHead.Value === userUid && item.Columns.LevelNumber.Value === decisionLevel
    )
      .sort((item1, item2) => this.ascending(item1.Columns.SubLevelNumber?.Value, item2.Columns.SubLevelNumber?.Value))
      .pop();
  }

  private getWorkflowStep(workflowDataItem: EntityData): EntityData {
    return this.data.WorkflowSteps?.Entities.filter(
      (item) => item.Columns.UID_QERWorkingStep.Value === workflowDataItem.Columns.UID_QERWorkingStep.Value
    ).pop();
  }

  private ascending(value1: number, value2: number): number {
    if (value1 < value2) {
      return 1;
    }

    if (value1 > value2) {
      return -1;
    }

    return 0;
  }

  private ascendingDate(value1: Date, value2: Date): number {
    if (value1 < value2) {
      return 1;
    }

    if (value1 > value2) {
      return -1;
    }

    return 0;
  }
}
