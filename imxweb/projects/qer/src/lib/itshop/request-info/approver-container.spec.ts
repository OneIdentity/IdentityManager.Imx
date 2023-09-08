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

import { ITShopConfig, PwoData } from 'imx-api-qer';
import { EntityData } from 'imx-qbm-dbts';
import { ApproverContainer } from './approver-container';

describe('ApproverContainer', () => {
  function buildPwo(uidWorkingMethode?: string, level?: number, steps?: EntityData[], data?: EntityData[], approvers?: string[]) {
    return {
      decisionLevel: level,
      qerWorkingMethod: uidWorkingMethode,
      pwoData: buildPwoData(steps, data),
      approvers
    };
  }

  function buildPwoData(steps?: EntityData[], data?: EntityData[]): PwoData {
    return {
      WorkflowSteps: steps == null ? {} : { TotalCount: steps.length, IsLimitReached: true, Entities: steps },
      WorkflowData: data == null ? {} : { TotalCount: data.length, IsLimitReached: true, Entities: data }
    } as PwoData
  }

  function buildStep(uidWorkingMethode?: string, level?: number, positive?: number, uidstep?: string): EntityData {
    return {
      Columns: {
        UID_QERWorkingMethod: { Value: uidWorkingMethode },
        LevelNumber: { Value: level },
        PositiveSteps: { Value: positive },
      },
      Keys: uidstep == null ? [] : [uidstep]
    }
  }

  function buildData(uidWorkingStep?: string, uidPersonHead?: string): EntityData {
    return {
      Columns: {
        UID_QERWorkingStep: { Value: uidWorkingStep },
        UID_PersonHead: {
          Value: uidPersonHead,
          DisplayValue: uidPersonHead,
        }
      }
    }
  }

  it('should create', () => {
    const test = new ApproverContainer(
      {} as {
        decisionLevel: number,
        qerWorkingMethod: string,
        pwoData: PwoData,
        approvers: string[]
      }
    );
    expect(test).toBeTruthy();
  });

  for (const testcase of [
    { descriprion: 'with null values', pwo: {}, personNow: [], personsFuture: [] },
    {
      descriprion: 'with empty values', pwo: buildPwo('uidQerWorkingMethode', 0, [], [], []), personNow: [], personsFuture: []
    },
    {
      descriprion: 'with single step', pwo: buildPwo('uidQerWorkingMethode', 0,
        [buildStep('uidQerWorkingMethode', 0, 0, 'uidStep')], [buildData('uidStep', 'person')], ['person']),
      personNow: ['person'], personsFuture: []
    }, {
      descriprion: 'with multiple steps (only 1 match)', pwo: buildPwo('uidQerWorkingMethode', 0,
        [buildStep('uidQerWorkingMethode', 0, 0, 'uidStep'), buildStep('uidQerWorkingMethode', 1, 2, 'uidStep2')],
        [buildData('uidStep', 'person')], ['person']), personNow: ['person'], personsFuture: []
    }, {
      descriprion: 'with multiple steps (but only 1 approver)', pwo: buildPwo('uidQerWorkingMethode', 0,
        [buildStep('uidQerWorkingMethode', 0, 0, 'uidStep'), buildStep('uidQerWorkingMethode', 1, 1, 'uidStep2')],
        [buildData('uidStep', 'person'), buildData('uidStep2', 'person2')], ['person']),
      personNow: ['person'], personsFuture: []
    }, {
      descriprion: 'with multiple steps (future and now)', pwo: buildPwo('uidQerWorkingMethode', 0,
        [buildStep('uidQerWorkingMethode', 0, 1, 'uidStep'), buildStep('uidQerWorkingMethode', 1, 1, 'uidStep2')],
        [buildData('uidStep', 'person'), buildData('uidStep2', 'person2')], ['person', 'person2']),
      personNow: ['person'], personsFuture: ['person2']
    }, {
      descriprion: 'with multiple steps (multiple future and now)', pwo: buildPwo('uidQerWorkingMethode', 0,
        [buildStep('uidQerWorkingMethode', 0, 1, 'uidStep'),
        buildStep('uidQerWorkingMethode', 1, 1, 'uidStep2'),
        buildStep('uidQerWorkingMethode', 2, 1, 'uidStep3')],
        [buildData('uidStep', 'person'),
        buildData('uidStep', 'person2'),
        buildData('uidStep2', 'person2'),
        buildData('uidStep3', 'person3')],
        ['person', 'person2', 'person3']),
      personNow: ['person', 'person2'], personsFuture: ['person2', 'person3']
    }

  ]) {
    it(`can initialize ${testcase.descriprion}`, () => {
      const container = new ApproverContainer(
        testcase.pwo as {
          decisionLevel: number,
          qerWorkingMethod: string,
          pwoData: PwoData,
          approvers: string[]
        }
      );

      expect(container.approverNow.length).toEqual(testcase.personNow.length);
      for (const approver of testcase.personNow) {
        const result = container.approverNow.map(app => app.Columns.UID_PersonHead.Value);
        expect(result.includes(approver)).toBeTruthy();
      }

      expect(container.approverFuture.length).toEqual(testcase.personsFuture.length);
      for (const approver of testcase.personsFuture) {
        const result = container.approverFuture.map(app => app.Columns.UID_PersonHead.Value);
        expect(result.includes(approver)).toBeTruthy();
      }
    })
  }

  it('can initialize with multiple approvers (now)', () => {
    const stepUid = 'uidStep0'

    const personsSteps = {
      person1: stepUid,
      person2: stepUid,
    };

    const persons = Object.keys(personsSteps);

    const uidQerWorkingMethod = 'uidQerWorkingMethod';

    const level = 0;

    const positiveSteps = 1;

    const steps = [
      buildStep(uidQerWorkingMethod, level, positiveSteps, stepUid)
    ];

    const data = [];
    persons.forEach(person => data.push(buildData(personsSteps[person], person)))

    const container = new ApproverContainer(
      {
        decisionLevel: level,
        qerWorkingMethod: uidQerWorkingMethod,
        pwoData: buildPwoData(steps, data),
        approvers: persons
      },
      { VI_ITShop_CurrentApproversCanBeSeen: true } as ITShopConfig
    );

    expect(container.approverNow.length).toEqual(persons.length);
    persons.forEach((approver, index) => expect(container.approverNow[index].Columns.UID_PersonHead.DisplayValue).toEqual(approver));
  })

  it('can initialize with multiple future steps', () => {
    const personsFutureSteps = {
      person1: 'uidStep1',
      person2: 'uidStep2',
    };

    const personsFuture = Object.keys(personsFutureSteps);

    const uidQerWorkingMethod = 'uidQerWorkingMethod';

    const level = 0;

    const positiveSteps = 1;

    const steps = [
      buildStep(uidQerWorkingMethod, level, positiveSteps, 'uidStep0'),
      buildStep(uidQerWorkingMethod, level + positiveSteps, positiveSteps, personsFutureSteps.person1),
      buildStep(uidQerWorkingMethod, level + positiveSteps * 2, positiveSteps, personsFutureSteps.person2)
    ];

    const data = [buildData('uidStep', 'person')];
    personsFuture.forEach(person => data.push(buildData(personsFutureSteps[person], person)))

    const container = new ApproverContainer(
      {
        decisionLevel: level,
        qerWorkingMethod: uidQerWorkingMethod,
        pwoData: buildPwoData(steps, data),
        approvers: undefined
      },
      { VI_ITShop_NextApproverCanBeSeen: true } as ITShopConfig
    );

    expect(container.approverFuture.length).toEqual(personsFuture.length);
    personsFuture.forEach((approver, index) => expect(container.approverFuture[index].Columns.UID_PersonHead.DisplayValue).toEqual(approver));
  })

  it('can initialize with auto steps', () => {
    const stepUids = ['0', '1']

    const uidQerWorkingMethod = 'uidQerWorkingMethod';

    const level = 0;

    const positiveSteps = 1;

    const steps =  stepUids.map((stepUid, index) =>
      buildStep(uidQerWorkingMethod, level + index * positiveSteps, positiveSteps, stepUid)
    );

    const data = stepUids.map(stepUid => buildData(stepUid));

    const container = new ApproverContainer(
      {
        decisionLevel: level,
        qerWorkingMethod: uidQerWorkingMethod,
        pwoData: buildPwoData(steps, data),
        approvers: ['some approver']
      }
    );

    expect(container.approverNow.length).toEqual(0);
    expect(container.approverFuture.length).toEqual(0);
  })
});
