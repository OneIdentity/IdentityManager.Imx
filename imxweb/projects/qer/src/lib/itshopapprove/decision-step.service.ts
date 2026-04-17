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
 * Copyright 2025 One Identity LLC.
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

  public isEscalationApprover: boolean = false;
  private uidUser: string;
  constructor(
    private readonly entityService: EntityService,
    authentication: AuthenticationService,
  ) {
    authentication.onSessionResponse.subscribe((session: ISessionState) => (this.uidUser = session.UserUid || ''));
  }

  public getCurrentStepCdr(entity: TypedEntity, extended: any, display: string): ColumnDependentReference | undefined {
    const step = this.getStep(extended, entity, this.uidUser);

    return step?.Columns?.Ident_PWODecisionStep == null
      ? undefined
      : new BaseReadonlyCdr(this.createEntityColumn(step.Columns.Ident_PWODecisionStep), display);
  }

  public getAdditionalInfoCdr(entity: TypedEntity, extended: any, display: string): ColumnDependentReference | undefined {
    const step = getWorkflowDataWithSmallestSublevel(extended, entity, this.uidUser, this.isEscalationApprover);

    if (!step) {
      return undefined;
    }

    return (step?.Columns?.UID_ComplianceRule?.Value ?? '') === ''
      ? undefined
      : new BaseReadonlyCdr(this.createEntityColumn(step.Columns!.UID_ComplianceRule), display);
  }

  public checkStepForRules(rules: string[], extended: any, entity: TypedEntity): boolean {
    const step = this.getStep(extended, entity, this.uidUser);
    const data = extended?.WorkflowData?.Entities?.find(
      (elem) =>
        elem?.Columns?.UID_QERWorkingStep.Value === step?.Columns?.UID_QERWorkingStep.Value &&
        rules.includes(elem?.Columns?.UID_PWODecisionRule.Value),
    );
    return !!data;
  }


  private createEntityColumn(data: EntityColumnData): IEntityColumn {
    return this.entityService.createLocalEntityColumn({ ColumnName: 'CurrentStep', Type: ValType.String }, undefined, data);
  }

  /**
   * Gets the step that needs to be approved by the current user in the current decision level.
   * @param extended The extended data containing the workflow information.
   * @param entity The approval object.
   * @param uidUser The uid of the current user.
   * @returns
   */
  private getStep(extended: any, entity: TypedEntity, uidUser: string): EntityData | undefined {
    const smallest = getWorkflowDataWithSmallestSublevel(extended, entity, uidUser, this.isEscalationApprover);
    const steps: EntityData[] = extended?.WorkflowSteps?.Entities ?? [];
    const matchingSteps = steps.filter(
      (elem: EntityData) => elem.Columns?.UID_QERWorkingStep.Value === smallest?.Columns?.UID_QERWorkingStep.Value,
    );

    const uniqueUsersMap: { [key: string]: EntityData } = {};
    for (const current of matchingSteps) {
      const key = current?.Keys?.[0];
      if (key != null) {
        uniqueUsersMap[key] = current;
      }
    }

    return Object.values(uniqueUsersMap)[0];
  }
}

/**
 * Gets the sublevel of the step that needs to be approved by the current user in the current decision level.
 * @param extended The extended data containing the workflow information.
 * @param entity The approval object.
 * @param uidUser The uid of the current user.
 * @returns The sublevel number or null if no step exists for the current user in the current decision level.
 */
export function getSubLevel(entity: TypedEntity, extended: any, uidUser: string, isEscalationApprover: boolean): number | undefined {
  const step = getWorkflowDataWithSmallestSublevel(extended, entity, uidUser, isEscalationApprover);

  if (!step) {
    return undefined;
  }

  return step.Columns?.SubLevelNumber?.Value ?? 0;
}

/**
 * Searches the step with the smallest sublevel for the given user and decision level.
 * @param extended The extended data containing the workflow information.
 * @param entity The approval object.
 * @param uidUser The uid of the current user.
 * @returns The step with the smallest sublevel in the current main level, that needs to be approved by the current user.
 *          If no such step exists, the value is undefined.
 */
export function getWorkflowDataWithSmallestSublevel(
  extended: any,
  entity: TypedEntity,
  uidUser: string,
  isEscalationApprover: boolean,
): EntityData | undefined {
  const filteredData: EntityData[] = (extended?.WorkflowData?.Entities ?? []).filter(
    (data: EntityData) =>
      (isEscalationApprover || data?.Columns?.UID_PersonHead.Value === uidUser) &&
      (data?.Columns?.Decision?.Value ?? '') === '' &&
      data.Columns?.LevelNumber.Value === entity.GetEntity().GetColumn('DecisionLevel').GetValue(),
  );

  if (filteredData.length === 0) {
    return undefined;
  }

  let lowestSublevel = filteredData[0];
  for (let i = 1; i < filteredData.length; i++) {
    const current = filteredData[i];
    const currentSubLevel = current.Columns?.SubLevelNumber?.Value ?? Number.POSITIVE_INFINITY;
    const lowestSubLevel = lowestSublevel.Columns?.SubLevelNumber?.Value ?? Number.POSITIVE_INFINITY;
    if (currentSubLevel < lowestSubLevel) {
      lowestSublevel = current;
    }
  }

  return lowestSublevel;
}
