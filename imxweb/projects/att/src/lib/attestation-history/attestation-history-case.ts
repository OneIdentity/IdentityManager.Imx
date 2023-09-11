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

import { AttCaseDataRead, AttestationCaseData, PortalAttestationCase } from 'imx-api-att';
import { IEntityColumn, TypedEntity } from 'imx-qbm-dbts';
import { ParameterDataContainer, WorkflowDataWrapper } from 'qer';
import { BaseCdr, ColumnDependentReference } from 'qbm';
import { AttestationCaseAction } from '../attestation-action/attestation-case-action.interface';

export class AttestationHistoryCase extends PortalAttestationCase implements AttestationCaseAction {
  public get attestationParameters(): IEntityColumn[] { return this.parameterDataContainer.columns; }
  public get isPending(): boolean { return this.AttestationState.value !== 'approved' && this.AttestationState.value !== 'denied'; }

  public readonly propertyInfo: ColumnDependentReference[];
  public readonly key: string;
  public readonly data: AttestationCaseData;

  public readonly canRecallDecision: boolean;

  public readonly typedEntity: TypedEntity;
  public readonly propertiesForAction: IEntityColumn[];

  private readonly workflowWrapper: WorkflowDataWrapper;

  constructor(
    private readonly baseObject: PortalAttestationCase,
    private readonly parameterDataContainer: ParameterDataContainer,
    extendedCollectionData: { index: number } & AttCaseDataRead
  ) {
    super(baseObject.GetEntity());

    this.key = this.baseObject.GetEntity().GetKeys()[0];
    this.typedEntity = this;
    this.propertiesForAction = [this.ToSolveTill.Column, this.UID_AttestationPolicy.Column];
    this.propertyInfo = [
      this.IsNotApprovedBefore,
      this.StructureDisplay1,
      this.StructureDisplay2,
      this.StructureDisplay3,
      this.PropertyInfo1,
      this.PropertyInfo2,
      this.PropertyInfo3,
      this.PropertyInfo4,
      this.ToSolveTill,
      this.RiskIndex,
      this.UID_AttestationPolicy
    ].filter(property => property.value != null && property.value !== '')
      .map(property => new BaseCdr(property.Column, extendedCollectionData[property.Column.ColumnName]));

    this.data = extendedCollectionData.Data ? extendedCollectionData.Data[extendedCollectionData.index] : undefined;

    if (this.data) {
      this.workflowWrapper = new WorkflowDataWrapper(this.data);
      this.canRecallDecision = this.data.CanRecallDecision;
    }
  }

  public async commit(): Promise<void> {
    this.baseObject.extendedData = this.parameterDataContainer.getEntityWriteDataColumns();
    await this.baseObject.GetEntity().Commit(true);
  }

  public canWithdrawDelegation(userUid: string): boolean {
    return this.workflowWrapper?.canRevokeDelegatedApprover(userUid, this.DecisionLevel.value);
  }
}

