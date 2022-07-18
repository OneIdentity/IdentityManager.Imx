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
 * Copyright 2022 One Identity LLC.
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

import { TestBed } from '@angular/core/testing';
import { configureTestSuite } from 'ng-bullet';

import { DecisionHistoryService } from './decision-history.service';

describe('DecisionHistoryService', () => {
  let service: DecisionHistoryService;

  configureTestSuite(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DecisionHistoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  [
    { inputs: ['information'], output: 'imx-info' },
    { inputs: ['dismiss', 'cancel', 'abort', 'unsubscribe', 'reject'], output: 'imx-negative' },
    { inputs: ['grant'], output: 'imx-positive' },
    { inputs: ['query'], output: 'imx-question' },
  ].forEach(testcase => {
    it(`returns GetDecisionTypeCssClass ${testcase.output}`, () => {
      testcase.inputs.forEach(input => {
        expect(service.getDecisionTypeCssClass(input)).toEqual(testcase.output);
      });
    })
  });

  [
    { inputs: ['Order'], output: '#LDS#DisplayPersonHead_Order' },
    { inputs: ['Escalate'], output: '#LDS#DisplayPersonHead_Escalate' },
    { inputs: ['Dismiss'], output: '#LDS#DisplayPersonHead_Dismiss' },
    { inputs: ['Prolongate'], output: '#LDS#DisplayPersonHead_Prolongate' },
    { inputs: ['Query'], output: '#LDS#DisplayPersonHead_Query' },
    { inputs: ['Reject'], output: '#LDS#DisplayPersonHead_Reject' },
    { inputs: ['Grant'], output: '#LDS#DisplayPersonHead_Grant' },
    { inputs: ['Unsubscribe'], output: '#LDS#DisplayPersonHead_Unsubscribe' },
    { inputs: ['Answer'], output: '#LDS#DisplayPersonHead_Answer' },
    { inputs: ['Recall'], output: '#LDS#DisplayPersonHead_Recall' },
    { inputs: ['Cancel'], output: '#LDS#DisplayPersonHead_Cancel' },
    { inputs: ['Abort'], output: '#LDS#DisplayPersonHead_Abort' },
    { inputs: ['Assign'], output: '#LDS#DisplayPersonHead_Assign' },
    { inputs: ['Waiting'], output: '#LDS#DisplayPersonHead_Waiting' },
    { inputs: ['Direct'], output: '#LDS#DisplayPersonHead_Direct' },
    { inputs: ['AddAdditional'], output: '#LDS#DisplayPersonHead_AddAdditional' },
    { inputs: ['AddInsteadOf'], output: '#LDS#DisplayPersonHead_AddInsteadOf' },
    { inputs: ['Deny'], output: '#LDS#DisplayPersonHead_Deny' },
    { inputs: ['RevokeDelegation'], output: '#LDS#DisplayPersonHead_RevokeDelegation' },
    { inputs: ['RecallQuery'], output: '#LDS#DisplayPersonHead_RecallQuery' },
    { inputs: ['ResetReservation'], output: '#LDS#DisplayPersonHead_ResetReservation' },
    { inputs: ['AddHistoryEntry'], output: '#LDS#DisplayPersonHead_AddHistoryEntry' },
    { inputs: ['CreateOrder'], output: '#LDS#DisplayPersonHead_CreateOrder' },
    { inputs: ['Reserve'], output: '#LDS#DisplayPersonHead_Reserve' },
    { inputs: ['Create'], output: '#LDS#DisplayPersonHead_Create' },
    { inputs: ['ReAction'], output: '#LDS#DisplayPersonHead_ReAction' },
    { inputs: ['Reset'], output: '#LDS#DisplayPersonHead_Reset' },
  ].forEach(testcase => {
    it(`returns getColumnDescriptionForDisplayPersonHead ${testcase.output}`, () => {
      testcase.inputs.forEach(input => {
        expect(service.getColumnDescriptionForDisplayPersonHead(input)).toEqual(testcase.output);
      });
    })
  });
});
