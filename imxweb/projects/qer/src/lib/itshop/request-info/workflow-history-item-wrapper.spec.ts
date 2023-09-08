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

import { PortalItshopApproveHistory } from 'imx-api-qer';
import { DecisionHistoryService } from '../decision-history.service';
import { WorkflowHistoryItemWrapper } from './workflow-history-item-wrapper';

function createProperty(name?, value?, display?) {
  const column = {
    ColumnName: name,
    GetValue: () => value,
    GetDisplayValue: () => value,
    GetMetadata: () => ({ GetDisplay: () => display || name })
  };

  return {
    value: value,
    Column: column,
    GetMetadata: () => column.GetMetadata()
  };
}

describe('WorkflowHistoryItemWrapper', () => {
  const expectedDefaultColumns: { name: string, display?: string }[] = [];

  for (const testcase of [
    {},
    { rulerLevel: 0 },
    { rulerLevel: 1, expectedAdditionalColumns: [{ name: 'RulerLevel' }] },
    { personRelated: 'value' },
    { isFromDelegation: true, expectedAdditionalColumns: [{ name: 'IsFromDelegation' }] },
    { pwoDecisionRule: 'value', expectedAdditionalColumns: [{ name: 'UID_PWODecisionRule' }] },
    { decisionType: 'Answer' },
    { decisionType: 'Query' },
    { decisionType: 'Query', personRelated: 'value', expectedAdditionalColumns: [{ name: 'UID_PersonRelated', display: 'Recipient' }] },
    { decisionType: 'Create' },
    { decisionType: 'Order' },
    { decisionType: 'AddInsteadOf' },
    { decisionType: 'AddInsteadOf', personRelated: 'value', expectedAdditionalColumns: [{ name: 'UID_PersonRelated' }] },
    { decisionType: 'Unsubscribe' },
    { decisionType: 'Deny' },
    { decisionType: 'AddAdditional' },
    { decisionType: 'AddAdditional', personRelated: 'value', expectedAdditionalColumns: [{ name: 'UID_PersonRelated' }] }
  ]) {
    it('can be initialized with data', () => {
      const expectedColumns = expectedDefaultColumns.concat(testcase.expectedAdditionalColumns || []);

      const history = {
        DecisionType: createProperty('DecisionType', testcase.decisionType),
        ReasonHead: createProperty('ReasonHead'),
        UID_QERJustification: createProperty('UID_QERJustification'),
        DisplayPersonHead: createProperty('DisplayPersonHead'),
        RulerLevel: createProperty('RulerLevel', testcase.rulerLevel),
        UID_PWODecisionRule: createProperty('UID_PWODecisionRule', testcase.pwoDecisionRule),
        UID_PersonRelated: createProperty('UID_PersonRelated', testcase.personRelated),
        IsFromDelegation: createProperty('IsFromDelegation', testcase.isFromDelegation),
        IsDecisionBySystem: createProperty('IsDecisionBySystem')
      } as PortalItshopApproveHistory;
      const decision = { } as DecisionHistoryService;

      const historyItemWrapper = new WorkflowHistoryItemWrapper(history,decision);

      expect(historyItemWrapper.approveHistory).toEqual(history);

      expect(historyItemWrapper.columns.length).toEqual(expectedColumns.length);

      expectedColumns.forEach(expectedColumn => {
        const cdr = historyItemWrapper.columns.find(cdr => cdr.column.ColumnName === expectedColumn.name);
        expect(cdr.column).toBeDefined();
        if (expectedColumn.display) {
          expect(cdr.display).toContain(expectedColumn.display);
        } else {
          expect(cdr.column.GetMetadata().GetDisplay()).toContain(expectedColumn.name);
        }
      });
    });
  }

  [
    { expectedDisplay: 'ReasonHead' },
    { justification: 'value', expectedDisplay: 'ReasonHead' },
    { reason: 'value', expectedDisplay: 'ReasonHead' },
    { justification: 'value', reason: 'value', expectedDisplay: 'ReasonHead' },
    { decisionType: 'Answer', reason: 'value', expectedDisplay: 'Answer' },
    { decisionType: 'Query', reason: 'value', expectedDisplay: 'Query' },
    { decisionType: 'Create', reason: 'value', expectedDisplay: 'ReasonHead' },
    { decisionType: 'Order', reason: 'value', expectedDisplay: 'ReasonHead' },
  ].forEach(testcase =>
    it('should getReasonDisplay', () => {
      const history = {
        DecisionType: createProperty('DecisionType', testcase.decisionType),
        ReasonHead: createProperty('ReasonHead', testcase.reason),
        UID_QERJustification: createProperty('UID_QERJustification', testcase.justification),
        DisplayPersonHead: { value: 'some name' },
        IsDecisionBySystem: {},
        RulerLevel: {},
      } as PortalItshopApproveHistory;

      const decision = { getColumnDescriptionForDisplayPersonHead: orderType => orderType} as DecisionHistoryService;

      const historyItemWrapper = new WorkflowHistoryItemWrapper(history,decision);

      expect(historyItemWrapper.getReasonDisplay()).toContain(testcase.expectedDisplay);
    }));
});
