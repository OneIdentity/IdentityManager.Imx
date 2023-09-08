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

import { PortalItshopApproveRequests, PwoData, ITShopConfig } from 'imx-api-qer';
import { IEntity, IEntityColumn } from 'imx-qbm-dbts';
import { BaseReadonlyCdr } from 'qbm';
import { ItshopRequestEntityWrapper } from '../itshop/request-info/itshop-request-entity-wrapper.interface';
import { RequestParameterDataEntity } from '../itshop/request-info/request-parameter-data-entity.interface';
import { WorkflowDataWrapper } from '../itshop/workflow-data-wrapper';

export class Approval extends PortalItshopApproveRequests implements RequestParameterDataEntity {
  public get decisionOffset(): number {
    return this.directDecisionTarget - this.DecisionLevel.value;
  }
  public get canEscalateDecision(): boolean {
    return this.workflowWrapper.canEscalateDecision(this.DecisionLevel.value);
  }
  public get hasAskedLastQuestion(): boolean {
    return this.workflowWrapper.userAskedLastQuestion(this.currentUser, this.DecisionLevel.value);
  }

  public get canRecallInquiry(): boolean {
    return this.IsReserved.value && this.hasAskedLastQuestion;
  }

  public readonly parameterColumns: IEntityColumn[];
  public readonly propertyInfo: BaseReadonlyCdr[] = [];
  public readonly pwoData: PwoData;
  public readonly key: string;

  private directDecisionTarget: number;
  private currentUser: string;

  private readonly workflowWrapper: WorkflowDataWrapper;

  constructor(private readonly entityWrapper: ItshopRequestEntityWrapper) {
    super(entityWrapper.entity);

    this.key = entityWrapper.entity.GetKeys()[0];

    if (entityWrapper.pwoData) {
      this.pwoData = entityWrapper.pwoData;

      this.workflowWrapper = new WorkflowDataWrapper(this.pwoData);
    }

    this.parameterColumns = entityWrapper.parameterColumns;

    this.propertyInfo = [
      this.DisplayOrg,
      this.DisplayPersonOrdered,
      this.DisplayPersonInserted,
      this.UiOrderState,
      this.PWOPriority,
      this.OrderDate,
      this.ValidFrom,
      this.ValidUntil,
      this.ValidUntilProlongation,
      this.ValidUntilUnsubscribe,
      this.UID_PersonWantsOrgParent,
      this.UID_Department,
      this.UID_ProfitCenter,
      this.OrderReason,
      this.IsCrossFunctional,
    ]
      .filter(
        (property) =>
          property.value != null &&
          property.value !== '' &&
          property.value !== false &&
          !this.parameterColumns.find((column) => column.ColumnName === property.Column.ColumnName)
      )
      .map((property) => new BaseReadonlyCdr(property.Column));

    this.currentUser = entityWrapper.uidCurrentUser;
  }

  public async commit(): Promise<void> {
    return this.entityWrapper.commit();
  }

  public canSetValidFrom(): boolean {
    return this.ValidFrom.GetMetadata().CanEdit() && !this.entityWrapper.isChiefApproval && this.OrderState.value !== 'OrderUnsubscribe';
  }

  public canSetValidUntil(itShopConfig: ITShopConfig): boolean {
    return (
      this.ValidUntil.GetMetadata().CanEdit() &&
      !this.entityWrapper.isChiefApproval &&
      this.OrderState.value !== 'OrderUnsubscribe' &&
      (!itShopConfig.VI_ITShop_ShowValidUntilQERReuse || this.TableName.value !== 'QERReuse')
    );
  }

  public updateDirectDecisionTarget(workflow: IEntity): void {
    this.directDecisionTarget = workflow.GetColumn('LevelNumber').GetValue();
  }

  public getLevelNumbers(userUid: string): number[] {
    return this.workflowWrapper?.getDirectSteps(userUid, this.DecisionLevel.value)?.map((step) => step + this.DecisionLevel.value);
  }

  public canRerouteDecision(userUid: string): boolean {
    return this.workflowWrapper?.getDirectSteps(userUid, this.DecisionLevel.value)?.some((value) => value !== 0);
  }

  public canAddApprover(userUid: string): boolean {
    return !this.IsReserved.value && this.workflowWrapper?.isAdditionalAllowed(userUid, this.DecisionLevel.value);
  }

  public canDelegateDecision(userUid: string): boolean {
    return !this.IsReserved.value && this.workflowWrapper?.isInsteadOfAllowed(userUid, this.DecisionLevel.value);
  }

  public canWithdrawAdditionalApprover(userUid: string): boolean {
    return this.workflowWrapper?.canRevokeAdditionalApprover(userUid, this.DecisionLevel.value);
  }

  public canDenyApproval(userUid: string): boolean {
    return !this.IsReserved.value && this.workflowWrapper?.canDenyDecision(userUid, this.DecisionLevel.value);
  }

  public canResetReservation(isChiefApprover: boolean): boolean {
    return this.IsReserved.value && (this.hasAskedLastQuestion || isChiefApprover);
  }
}
