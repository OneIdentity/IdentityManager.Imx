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

import { EntityCollectionData, EntityData } from "imx-qbm-dbts";
import { OrderedWorkingStep } from "./ordered-working-step.interface";

export function buildWorkingStepsOrdered(decisionLevel: number, qerWorkingMethod: string, workflowSteps: EntityCollectionData): OrderedWorkingStep[] {
  let orderedSteps: OrderedWorkingStep[] = [];
  const currentLevel = decisionLevel;
  const workingMethod = qerWorkingMethod;

  const stepsForWorkingMethod = workflowSteps.Entities.filter(
    (elem) => elem.Columns.UID_QERWorkingMethod.Value === workingMethod
  );

  const startSteps = stepsForWorkingMethod.filter(
    (n, i, arr) => arr.findIndex((elem) => elem.Keys[0] === n.Keys[0] && elem.Columns.LevelNumber.Value === currentLevel) === i
  );

  if (startSteps.length === 0) {
    return [];
  }

  orderedSteps.push(
    ...startSteps.map((elem) => ({
      uidWorkingStep: elem.Keys[0],
      decisionLevel: currentLevel,
      positiveSteps: elem.Columns.PositiveSteps.Value,
      order: 1,
    }))
  );


  let goOn = true;
  while (goOn) {
    goOn = false;
    const joined = joinOrderedStepsWithOthers(stepsForWorkingMethod, orderedSteps);

    const filteredJoin = joined.filter(
      (join) =>
        join.orderedStep != null &&
        join.orderedStep.positiveSteps !== 0 &&
        orderedSteps.findIndex((workunit) => workunit.uidWorkingStep === join.workingStep.Keys[0]) === -1
    );

    if (filteredJoin != null && filteredJoin.length > 0) {
      goOn = true;
      orderedSteps = orderedSteps.concat(
        filteredJoin.map((join) => ({
          decisionLevel: join.workingStep.Columns.LevelNumber.Value,
          order: join.orderedStep.order + 1,
          positiveSteps: join.workingStep.Columns.PositiveSteps.Value,
          uidWorkingStep: join.workingStep.Keys[0],
        }))
      );
    }
  }
  return orderedSteps;
}

function joinOrderedStepsWithOthers(
  workingSteps: EntityData[],
  orderedSteps: OrderedWorkingStep[]
): { orderedStep: OrderedWorkingStep; workingStep: EntityData }[] {
  let join: { orderedStep: OrderedWorkingStep; workingStep: EntityData }[] = [];
  for (const workingStep of workingSteps) {

    const filteredOrderedSteps = orderedSteps.filter(
      (step) => workingStep.Columns.LevelNumber.Value === step.decisionLevel + step.positiveSteps
    );

    if (filteredOrderedSteps != null && filteredOrderedSteps.length > 0) {
      join = join.concat(
        filteredOrderedSteps.map((orderedStep) => ({
          orderedStep,
          workingStep,
        }))
      );
    }
  }
  return join;
}
