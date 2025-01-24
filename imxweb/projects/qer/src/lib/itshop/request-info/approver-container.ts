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

import { EntityCollectionData, EntityData, MultiValueProperty } from 'imx-qbm-dbts';

import { ClassloggerService } from 'qbm';
import { OrderedWorkingStep } from './ordered-working-step.interface';
import { buildWorkingStepsOrdered } from './step-helper';

export class ApproverContainer {
  public readonly isInWorkflow: boolean;

  /**
   * List of current approvers
   */
  public approverNow: EntityData[] = [];

  public canSeeSteps: boolean;

  /**
   * List of next approvers
   */
  public approverFuture: EntityData[] = [];

  constructor(
    private readonly request: {
      decisionLevel: number;
      qerWorkingMethod: string;
      isInWorkflow?: boolean;
      pwoData: {
        WorkflowHistory?: EntityCollectionData;
        WorkflowData?: EntityCollectionData;
        WorkflowSteps?: EntityCollectionData;
      };
      approvers: string[];
    },
    public readonly config: {
      VI_ITShop_CurrentApproversCanBeSeen?: boolean;
      VI_ITShop_NextApproverCanBeSeen?: boolean;
    } = {},
    private logger?: ClassloggerService
  ) {
    this.isInWorkflow = this.request.isInWorkflow;

    if (this.config?.VI_ITShop_NextApproverCanBeSeen || this.config?.VI_ITShop_CurrentApproversCanBeSeen) {
      this.initApproverContainer(this.config.VI_ITShop_CurrentApproversCanBeSeen, this.config.VI_ITShop_NextApproverCanBeSeen);
    } else {
      this.initApproverContainer(true, true);
    }
  }

  public getApproverSortedByStep(future = true): { display: string; data: EntityData[] }[] {
    const ret = [];
    const steps = [
      ...new Set(
        this.request.pwoData.WorkflowSteps?.Entities.sort((a, b) => a.Columns.LevelNumber.Value - b.Columns.LevelNumber.Value).map(
          (elem) =>
            elem.Columns.UID_QERWorkingStep.Value +
            MultiValueProperty.DefaultSeparator +
            (elem.Columns.Ident_PWODecisionStep.DisplayValue ?? elem.Columns.Ident_PWODecisionStep.Value)
        )
      ),
    ];

    this.logger.trace(this, 'following approval steps are available', steps);

    steps.forEach((element) => {
      const uid = element.split(MultiValueProperty.DefaultSeparator)[0];
      const display = element.split(MultiValueProperty.DefaultSeparator)[1];
      const approver = future
        ? this.approverFuture?.filter(
            (workflowData, index, newArray) =>
              workflowData.Columns.UID_QERWorkingStep.Value === uid &&
              newArray.findIndex((checkData) => checkData.Columns.UID_PersonHead.Value === workflowData.Columns.UID_PersonHead.Value) ===
                index
          )
        : this.approverNow?.filter(
            (workflowData, index, newArray) =>
              workflowData.Columns.UID_QERWorkingStep.Value === uid &&
              newArray.findIndex((checkData) => checkData.Columns.UID_PersonHead.Value === workflowData.Columns.UID_PersonHead.Value) ===
                index
          );

      this.logger.trace(this, `analysing ${future ? 'future' : 'current'} step ${uid} (${display}):`, approver);

      if (approver?.length > 0) {
        ret.push({ display: display, data: approver });
      }
    });

    return ret;
  }

  /**
   * Inits an approver container instance
   * @param canSeeCurrent Determines, if the current approver can be seen
   * @param canSeeNext Determines, if the next approvers can be seen
   */
  private initApproverContainer(canSeeCurrent: boolean, canSeeNext: boolean): void {
    const orderedWorkingSteps = this.buildOrderedWorkingSteps();
    this.logger?.trace(this, 'working steps with order', orderedWorkingSteps);

    this.canSeeSteps = this.request.pwoData?.WorkflowSteps?.Entities.length > 0;

    if (canSeeCurrent) {
      const currentSteps = orderedWorkingSteps.filter((step) => step.order === 1);
      this.logger?.trace(this, 'current steps', currentSteps);

      this.approverNow =
        this.request == null || this.request.pwoData == null || this.request.pwoData.WorkflowData == null || currentSteps.length === 0
          ? []
          : this.request.pwoData.WorkflowData.Entities.filter(
              (data) =>
                !this.isDecided(
                  data,
                  this.request.pwoData.WorkflowData.Entities.filter((elem) => elem.Columns.Decision?.Value !== '')
                ) &&
                data.Columns.UID_PersonHead.Value &&
                currentSteps.some((step) => data.Columns.UID_QERWorkingStep.Value === step.uidWorkingStep) &&
                this.request.approvers.includes(data.Columns.UID_PersonHead.Value)
            ).sort((data1, data2) => data1.Columns.UID_PersonHead.DisplayValue.localeCompare(data2.Columns.UID_PersonHead.DisplayValue));
      this.logger?.trace(this, 'personWantsOrg should be approved by', this.approverNow);
    }

    if (canSeeNext) {
      const futureSteps = orderedWorkingSteps.filter((step) => step.order > 1);
      this.logger?.trace(this, 'future steps', futureSteps);

      this.approverFuture =
        this.request == null || this.request.pwoData == null || this.request.pwoData.WorkflowData == null || futureSteps == null
          ? []
          : this.request.pwoData.WorkflowData.Entities.filter(
              (data) =>
                data.Columns.UID_PersonHead.Value &&
                futureSteps.map((step) => step.uidWorkingStep).includes(data.Columns.UID_QERWorkingStep.Value)
            ).sort((data1, data2) => data1.Columns.UID_PersonHead.DisplayValue.localeCompare(data2.Columns.UID_PersonHead.DisplayValue));
      this.logger?.trace(this, 'personWantsOrg should be approved in the future by', this.approverFuture);
    }
  }

  /*
   *  Checks, if a workflowData item is already decided (by any person in the same sub step)
   */
  private isDecided(data: EntityData, decidedEntries: EntityData[]): boolean {
    return decidedEntries.some(
      (elem) =>
        elem.Columns.LevelNumber.Value === data.Columns.LevelNumber.Value &&
        elem.Columns.SubLevelNumber.Value === data.Columns.SubLevelNumber.Value
    );
  }

  private buildOrderedWorkingSteps(): OrderedWorkingStep[] {
    if (this.request == null || this.request.pwoData == null || this.request.pwoData.WorkflowSteps == null) {
      return [];
    }
    return buildWorkingStepsOrdered(this.request.decisionLevel,this.request.qerWorkingMethod, this.request.pwoData.WorkflowSteps);
  }
}
