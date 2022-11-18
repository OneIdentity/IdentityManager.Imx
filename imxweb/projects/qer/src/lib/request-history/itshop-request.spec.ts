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
 * Copyright 2021 One Identity LLC.
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

import { PwoData } from 'imx-api-qer';
import { IEntity, IEntityColumn, EntityColumnData, EntitySchema, IClientProperty } from 'imx-qbm-dbts';
import { ItshopRequest } from './itshop-request';

describe('ItshopRequest', () => {
  function createColumn(value?, name?) {
    return {
      ColumnName: name,
      GetValue: () => value
    } as IEntityColumn;
  }

  function createEntityData(Columns: { [key: string]: EntityColumnData }) {
    return { Columns };
  }

  function createEntitySchema(columnNames) {
    const clientProperties = {};
    columnNames.forEach(name =>
      clientProperties[name] = {} as IClientProperty
    );
    return { Columns: clientProperties };
  }

  function createEntity(properties = {}) {
    const schema = createEntitySchema(Object.keys(properties ?? {}));

    return {
      GetColumn: name => properties[name] || createColumn(),
      GetSchema: () => schema
    } as IEntity;
  }

  const loggedOnUser = 'UserId';

  for (const testcase of [
    {
      description: ' AddInsteadOf',
      extendedData: { UID_PersonInsteadOf: 'some id', CanRevokeDelegation: true },
      userId: loggedOnUser,
      expectedAllow: { canWithdrawDelegation: true }
    },
    {
      description: ' CanRecallLastQuestion',
      extendedData: { decision: 'Q' },
      userId: loggedOnUser,
      isReserved: true,
      expectedAllow: { canRecallLastQuestion: true }
    },
    {
      description: ' CanRevokeHoldStatus',
      extendedData: {  },
      userId: loggedOnUser,
      isReserved: true,
      expectedAllow: { canRevokeHoldStatus: true }
    },
    {
      description: ' AddAdditional',
      extendedData: { UID_PersonAdditional: 'some id', CanRevokeDelegation: true },
      userId: loggedOnUser,
      expectedAllow: { canWithdrawAdditionalApprover: true }
    },
    {
      description: ' nothing (since another user)',
      extendedData: {  },
      canWithdrawAdditionalApprover: false,
      canWithdrawDelegation: false
    },
    {
      description: ' nothing (since no ExtendedData)'
    }
  ]) {
    it(`should create a request which allows: ${testcase.description}`, () => {
      const LevelNumber = { Value: 1 };

      const pwoData = testcase.extendedData ? {
        WorkflowData: {
          Entities: [
            createEntityData({
              UID_PersonAdditional: { Value: testcase.extendedData.UID_PersonAdditional },
              UID_PersonInsteadOf: { Value: testcase.extendedData.UID_PersonInsteadOf },
              UID_PersonHead: { Value: testcase.userId || 'another user' },
              LevelNumber,
              Decision: { Value: testcase.extendedData.decision }
            })
          ]
        },
        CanRevokeDelegation: testcase.extendedData?.CanRevokeDelegation || false
      } as PwoData : undefined;

      const entity = createEntity({
        IsReserved: createColumn(testcase.isReserved || false),
        UID_PersonHead: createColumn(testcase.userId || 'another user'),
        DecisionLevel: createColumn(LevelNumber.Value)
      });

      const request = new ItshopRequest(entity, pwoData, [], loggedOnUser);

      expect(request.canRecallLastQuestion).toBe(testcase.expectedAllow ? testcase.expectedAllow.canRecallLastQuestion === true : undefined);
      expect(request.canRevokeHoldStatus).toBe(testcase.expectedAllow ? testcase.expectedAllow.canRevokeHoldStatus === true : undefined);
      expect(request.canWithdrawDelegation).toBe(testcase.expectedAllow ? testcase.expectedAllow.canWithdrawDelegation === true : testcase.canWithdrawDelegation);
      expect(request.canWithdrawAdditionalApprover).toBe(testcase.expectedAllow ? testcase.expectedAllow.canWithdrawAdditionalApprover === true : testcase.canWithdrawAdditionalApprover);
    });
  }

  for (const testcase of [
    {
      description: ' 3 properties (2 property with a value)', nonEmptyProperties: 2,
      properties: {
        DisplayOrg: createColumn('DisplayOrg')
      }
    },
    {
      description: ' 4 properties (3 property with a value)', nonEmptyProperties: 3,
      properties: {
        DisplayOrg: createColumn('DisplayOrg'),
        OrderReason: createColumn('OrderReason')
      }
    },
    {
      description: ' 4 properties (1 property with a value)', nonEmptyProperties: 1,
      properties: {}
    }
  ]) {
    it(`should an array of properties, but only return properties having a value: test with ${testcase.description}`, () => {
      const request = new ItshopRequest(createEntity(testcase.properties), undefined, [], 'UserId');

      expect(request.propertyInfo.length).toBe(testcase.nonEmptyProperties);
    });
  }

  it('should init', () => {
    const propertyColumnName = 'DisplayOrg';
    const properties = { };
    properties[propertyColumnName] = createColumn('some value', propertyColumnName);

    const request = new ItshopRequest(createEntity(properties), undefined, [], undefined);

    expect(request.propertyInfo.map(p => p.column.ColumnName)).toContain(propertyColumnName);
  });

  it('avoids to init any properties that have the same column name in the ItshopRequestData.parameters', () => {
    const propertyColumnName = 'someColumnName';
    const properties = { };
    properties[propertyColumnName] = createColumn('some value', propertyColumnName);

    const request = new ItshopRequest(
      createEntity(properties),
      undefined,
      [{ ColumnName: propertyColumnName } as IEntityColumn],
      undefined
    );

    expect(request.propertyInfo.map(p => p.column.ColumnName)).not.toContain(propertyColumnName);
  });
});
