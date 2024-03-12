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

import { IEntity } from 'imx-qbm-dbts';
import { PwoData, PortalItshopRequests } from 'imx-api-qer';
import { BaseReadonlyCdr, ColumnDependentReference } from 'qbm';
import { RequestParameterDataEntity } from '../itshop/request-info/request-parameter-data-entity.interface';
import { WorkflowDataWrapper } from '../itshop/workflow-data-wrapper';
import { IEntityColumn } from 'imx-qbm-dbts';

export class ItshopRequest extends PortalItshopRequests implements RequestParameterDataEntity {
  public get orderState(): string {
    return this.UiOrderState.value;
  }
  public get qerWorkingMethod(): string {
    return this.UID_QERWorkingMethod.value;
  }

  public readonly parameterColumns: IEntityColumn[];
  public readonly propertyInfo: ColumnDependentReference[];
  public readonly canProlongate: boolean;
  public readonly canRecallLastQuestion: boolean;
  public readonly canRevokeHoldStatus: boolean;
  public readonly canWithdrawDelegation: boolean;
  public readonly canWithdrawAdditionalApprover: boolean;
  public readonly canRecallDecision: boolean;
  public complianceRuleViolation = false;
  public isArchived = false;
  public readonly pwoData: PwoData;
  public readonly canEscalateDecision: boolean;
  public readonly canCopyItems:boolean;

  constructor(entity: IEntity, pwoData: PwoData, parameterColumns: IEntityColumn[], userUid: string) {
    super(entity);

    const isAffectedEmployee = this.UID_PersonInserted.value === userUid || this.UID_PersonOrdered.value === userUid;

    // If the user can unsubscribe, we consider that the user can also renew
    this.canProlongate = this.UiOrderState.value === 'Assigned' && this.UnsubscribeRequestAllowed.value;
    
    this.canCopyItems = this.UID_PersonInserted.value === userUid && this.CanCopy.value; 
    if (pwoData) {
      this.pwoData = pwoData;

      if (this.pwoData) {
        const workflowWrapper = new WorkflowDataWrapper(this.pwoData);

        this.canWithdrawAdditionalApprover = workflowWrapper.canRevokeAdditionalApprover(userUid, this.DecisionLevel.value);
        this.canWithdrawDelegation = workflowWrapper.canRevokeDelegatedApprover(userUid, this.DecisionLevel.value);

        this.canEscalateDecision = workflowWrapper.canEscalateDecision(this.DecisionLevel.value) && isAffectedEmployee;

        if (this.UID_PersonHead.value === userUid) {
          this.canRecallDecision = this.pwoData.CanRecallDecision;

          const question = this.pwoData.WorkflowData.Entities.find((entityData) => entityData.Columns.Decision.Value === 'Q');

          this.canRecallLastQuestion = this.IsReserved.value && question != null;
          this.canRevokeHoldStatus = this.IsReserved.value && question == null;
        }
      }
    }

    this.parameterColumns = parameterColumns;

    this.propertyInfo = [
      this.DisplayOrg,
      this.DisplayPersonOrdered,
      this.DisplayPersonInserted,
      this.UID_PWOState,
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
    ]
      .filter(
        (property) =>
          property.value != null &&
          property.value !== '' &&
          !this.parameterColumns.find((column) => column.ColumnName === property.Column.ColumnName)
      )
      .map((property) => new BaseReadonlyCdr(property.Column));

    if (this.IsCrossFunctional?.value) {
      this.propertyInfo.push(new BaseReadonlyCdr(this.IsCrossFunctional.Column));
    }

    const document = new BaseReadonlyCdr(this.DocumentNumber.Column, '#LDS#Request number');
    this.propertyInfo.splice(3, 0, document);
  }
}
