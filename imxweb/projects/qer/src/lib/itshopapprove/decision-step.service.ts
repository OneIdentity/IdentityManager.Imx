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
import { EntityColumnData, EntityData, IEntityColumn, TypedEntity, ValType } from '@imx-modules/imx-qbm-dbts';
import { AuthenticationService, BaseReadonlyCdr, ColumnDependentReference, EntityService, ISessionState } from 'qbm';

@Injectable({
  providedIn: 'root',
})
export class DecisionStepSevice {
  private uidUser: string;
  constructor(
    private readonly entityService: EntityService,
    authentication: AuthenticationService,
  ) {
    authentication.onSessionResponse.subscribe((session: ISessionState) => (this.uidUser = session.UserUid || ''));
  }

  public getCurrentStepCdr(entity: TypedEntity, extended: any, display: string): ColumnDependentReference | undefined {
    const step = this.getStep(extended, entity);

    return step?.Columns.Ident_PWODecisionStep == null
      ? undefined
      : new BaseReadonlyCdr(this.createEntityColumn(step.Columns.Ident_PWODecisionStep), display);
  }

  public getAdditionalInfoCdr(entity: TypedEntity, extended: any, display: string): ColumnDependentReference | undefined {
    const step = this.getStep(extended, entity);

    const data = extended.WorkflowData?.Entities?.find(
      (elem) =>
        elem.Columns.UID_QERWorkingStep.Value === step.Columns.UID_QERWorkingStep.Value &&
        elem.Columns.UID_PersonHead.Value === this.uidUser,
    );

    return (data?.Columns.UID_ComplianceRule?.Value ?? '') === ''
      ? undefined
      : new BaseReadonlyCdr(this.createEntityColumn(data.Columns.UID_ComplianceRule), display);
  }

  private getStep(extended: any, entity: TypedEntity) {
    const steps = extended.WorkflowSteps?.Entities?.filter(
      (elem) =>
        elem?.Columns?.UID_QERWorkingMethod.Value === entity.GetEntity().GetColumn('UID_QERWorkingMethod').GetValue() &&
        elem.Columns.LevelNumber.Value === entity.GetEntity().GetColumn('DecisionLevel').GetValue(),
    );

    //add sublevel to steps
    const stepsWithSubLevel: { subLevel: number; column: any }[] = [];
    steps
      .filter((elem) => this.isFitting(extended.WorkflowData?.Entities, elem))
      .forEach((element) => {
        const subLevel = extended.WorkflowData.Entities.find(
          (data) => data.Columns.UID_QERWorkingStep.Value === element.Columns.UID_QERWorkingStep.Value,
        );
        stepsWithSubLevel.push({ subLevel: subLevel.Columns.SubLevelNumber.Value, column: element });
      });

    //Sort steps and get step with lowest sub level
    const step = stepsWithSubLevel?.sort((x, y) => x.subLevel - y.subLevel)?.[0]?.column;
    return step;
  }

  private createEntityColumn(data: EntityColumnData): IEntityColumn {
    return this.entityService.createLocalEntityColumn({ ColumnName: 'CurrentStep', Type: ValType.String }, undefined, data);
  }

  private isFitting(workflowData: EntityData[], step: EntityData): boolean {
    return workflowData.some(
      (elem) =>
        elem?.Columns?.UID_QERWorkingStep.Value === step?.Columns?.UID_QERWorkingStep.Value &&
        elem?.Columns?.UID_PersonHead.Value === this.uidUser,
    );
  }
}
