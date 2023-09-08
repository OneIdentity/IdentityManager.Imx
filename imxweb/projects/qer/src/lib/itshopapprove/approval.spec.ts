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

import { IEntity, IEntityColumn, EntityCollectionData, EntityColumnData, IClientProperty } from 'imx-qbm-dbts';
import { ITShopConfig, PwoData } from 'imx-api-qer';
import { Approval } from './approval';

describe('Approval', () => {
  function createColumn(value?) {
    return {
      GetMetadata: () => ({ CanEdit: () => true }),
      GetValue: () => value
    } as IEntityColumn;
  }

  function createEntitySchema(columnNames) {
    const clientProperties = {};
    columnNames.forEach(name =>
      clientProperties[name] = {} as IClientProperty
    );
    return { Columns: clientProperties };
  }

  function createEntity(columns: { [name: string]: IEntityColumn } = {}, key?) {
    return {
      GetDisplay: () => '',
      GetColumn: name => columns[name] || createColumn(),
      GetKeys: () => [key],
      GetSchema: () => createEntitySchema(Object.keys(columns ?? {}))
    } as IEntity;
  }

  [
    { orderState: '', canSet: true },
    { orderState: 'OrderUnsubscribe', canSet: false },
  ].forEach(testcase =>
    it('checks if user can set ValidFrom', () => {
      const approval = new Approval(
        {
          entity: createEntity({
            OrderState: createColumn(testcase.orderState),
            ValidFrom: undefined
          }),
          parameterColumns: []
        }
      );
      expect(approval.canSetValidFrom()).toEqual(testcase.canSet);
    }));

  [
    { orderState: '', canSet: true },
    { orderState: 'OrderUnsubscribe', canSet: false },
  ].forEach(testcase =>
    it('checks if user can set ValidUntil', () => {
      const approval = new Approval(
        {
          entity: createEntity({
            OrderState: createColumn(testcase.orderState),
            ValidUntil: undefined
          }),
          parameterColumns: []
        }
      );
      expect(approval.canSetValidUntil({} as ITShopConfig)).toEqual(testcase.canSet);
    }));

  it('provides decisionOffset', () => {
    const decisionLevel = 23;
    const levelNumber = 3;
    const expectedDecisionOffset = levelNumber - decisionLevel;
    const approval = new Approval(
      {
        entity:  createEntity({ DecisionLevel: createColumn(decisionLevel) }),
        parameterColumns: []
      }
    );
    approval.updateDirectDecisionTarget({ GetColumn: name => ({ LevelNumber: createColumn(levelNumber) }[name]) } as IEntity);
    expect(approval.decisionOffset).toEqual(expectedDecisionOffset);
  });

  it('sets workflow', () => {
    const approvalKey = 'some key';
    const userUid = 'some user uid';
    const decisionLevel = 0;
    const uidWorkingStep = 'some workingstep uid';

    const approval = new Approval(
      {
        entity: createEntity({
          DecisionLevel: createColumn(decisionLevel),
          CanDelegateOrAddApprover: createColumn(true),
        }, approvalKey),
        parameterColumns: [],
        pwoData: {
          WorkflowSteps: {
            TotalCount: 1,
            Entities: [
              {
                Columns: {
                  DirectSteps: { Value: '1' },
                  LevelNumber:{Value: 0},
                  IsAdditionalAllowed: { Value: true },
                  IsInsteadOfAllowed: { Value: true },
                  EscalationSteps: { Value: 1 },
                  UID_QERWorkingStep: { Value: uidWorkingStep }
                } as { [key: string]: EntityColumnData }
              }
            ]
          } as EntityCollectionData,
          WorkflowData: {
            TotalCount: 1,
            Entities: [
              {
                Columns: {
                  LevelNumber: { Value: decisionLevel },
                  UID_PersonAdditional: { Value: '' },
                  UID_PersonInsteadOf: { Value: '' },
                  IsFromDelegation: { Value: false },
                  UID_PersonHead: { Value: userUid },
                  UID_QERWorkingStep: { Value: uidWorkingStep }
                } as { [key: string]: EntityColumnData }
              }
            ]
          } as EntityCollectionData
        } as PwoData
      }
    );

    expect(approval.canRerouteDecision(userUid)).toEqual(true);
    expect(approval.canAddApprover(userUid)).toEqual(true);
    expect(approval.canDelegateDecision(userUid)).toEqual(true);
    expect(approval.canEscalateDecision).toEqual(true);
  });

  [
    { value: true, expected: 1 },
    { value: false, expected: 0 },
    { value: undefined, expected: 0 }
  ].forEach(testcase =>
  it('adds IsCrossFunctional to propertyInfo only if it is "true"', () => {
    const approval = new Approval(
      {
        entity: createEntity({ IsCrossFunctional: { GetValue: () => testcase.value } as IEntityColumn }),
        parameterColumns: []
      }
    );

    expect(approval.propertyInfo.length).toEqual(testcase.expected);
  }));

  [
    { value: 'some reason', expected: 1 },
    { value: '', expected: 0 },
    { value: undefined, expected: 0 }
  ].forEach(testcase =>
  it('adds OrderReason to propertyInfo only if it is non-empty', () => {
    const approval = new Approval(
      {
        entity: createEntity({ OrderReason: { GetValue: () => testcase.value } as IEntityColumn }),
        parameterColumns: []
      }
    );

    expect(approval.propertyInfo.length).toEqual(testcase.expected);
  }));
});
