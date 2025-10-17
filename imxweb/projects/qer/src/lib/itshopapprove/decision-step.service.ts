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
    const step = this.getStep(extended, entity, this.uidUser);

    return step?.Columns?.Ident_PWODecisionStep == null
      ? undefined
      : new BaseReadonlyCdr(this.createEntityColumn(step.Columns.Ident_PWODecisionStep), display);
  }

  public getAdditionalInfoCdr(entity: TypedEntity, extended: any, display: string): ColumnDependentReference | undefined {
    const step = getWorkflowDataWithSmallestSublevel(extended, entity, this.uidUser);

    if (!step) {
      return undefined;
    }

    return (step?.Columns?.UID_ComplianceRule?.Value ?? '') === ''
      ? undefined
      : new BaseReadonlyCdr(this.createEntityColumn(step.Columns!.UID_ComplianceRule), display);
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
  private getStep(extended: any, entity: TypedEntity, uidUser: string): EntityData {
    const smallest = getWorkflowDataWithSmallestSublevel(extended, entity, uidUser);
    const uniqueUsersMap =
      extended?.WorkflowSteps?.Entities?.filter(
        (elem: EntityData) => elem.Columns?.UID_QERWorkingStep.Value === smallest?.Columns?.UID_QERWorkingStep.Value,
      )?.reduce((acc, current) => {
        return { ...acc, [current.Keys[0]]: current };
      }, {}) ?? [];

    return Object.values(uniqueUsersMap)[0] as EntityData;
  }
}

/**
 * Gets the sublevel of the step that needs to be approved by the current user in the current decision level.
 * @param extended The extended data containing the workflow information.
 * @param entity The approval object.
 * @param uidUser The uid of the current user.
 * @returns The sublevel number or null if no step exists for the current user in the current decision level.
 */
export function getSubLevel(entity: TypedEntity, extended: any, uidUser: string): number | undefined {
  const step = getWorkflowDataWithSmallestSublevel(extended, entity, uidUser);

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
export function getWorkflowDataWithSmallestSublevel(extended: any, entity: TypedEntity, uidUser: string): EntityData | undefined {
  return extended?.WorkflowData?.Entities?.filter(
    (data: EntityData) =>
      data?.Columns?.UID_PersonHead.Value === uidUser &&
      (data?.Columns?.Decision?.Value ?? '') === '' &&
      data.Columns.LevelNumber.Value === entity.GetEntity().GetColumn('DecisionLevel').GetValue(),
  )?.reduce((lowestSublevel, current) => {
    return current.Columns.SubLevelNumber.Value < lowestSublevel.Columns.SubLevelNumber.Value ? current : lowestSublevel;
  });
}
