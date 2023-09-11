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

import { EntityCollectionData } from 'imx-qbm-dbts';
import { WorkflowDataWrapper } from './workflow-data-wrapper';

describe('WorkflowDataWrapper', () => {
  const createWorkflowCollection = (data) => ({
    Entities: data.map(item => {
      const Columns = {};
      Object.keys(item).forEach(key => Columns[key] = { Value: item[key] });
      return { Columns }
    })
  } as EntityCollectionData);

  const testcaseToString = (testcase) => {
    const tokens = [];
    Object.keys(testcase).forEach(key =>
      Object.keys(testcase[key]).forEach(itemkey => tokens.push(itemkey + '="' + testcase[key][itemkey] + '"'))
    );
    return tokens.join();
  };

  describe('getDirectSteps', () => {
    it('returns undefined if no match', () => {
      const UID_PersonHead = 'some user id';
      const LevelNumber = 1;
      const UID_QERWorkingStep = 'some workingstep';

      const workflow = new WorkflowDataWrapper(
        {
          WorkflowData: createWorkflowCollection([{ UID_PersonHead, LevelNumber, UID_QERWorkingStep }]),
          WorkflowSteps: createWorkflowCollection([{ UID_QERWorkingStep: 'some other workingstep', DirectSteps: '1' }])
        }
      );

      const directSteps = workflow.getDirectSteps(UID_PersonHead, LevelNumber);

      expect(directSteps).toBeUndefined();
    });

    it('returns the directSteps for the matching item', () => {
      const UID_PersonHead = 'some user id';
      const LevelNumber = 1;
      const workflowStep = { UID_QERWorkingStep: 'some workingstep', DirectSteps: '1' };

      const workflow = new WorkflowDataWrapper(
        {
          WorkflowData: createWorkflowCollection([{ UID_PersonHead, LevelNumber, UID_QERWorkingStep: workflowStep.UID_QERWorkingStep }]),
          WorkflowSteps: createWorkflowCollection([ workflowStep ])
        }
      );

      const directSteps = workflow.getDirectSteps(UID_PersonHead, LevelNumber);

      expect(directSteps[0]).toEqual(Number(workflowStep.DirectSteps));
    });

    it('returns the directSteps for the matching item with the lowest sublevelnumber', () => {
      const UID_PersonHead = 'some user id';
      const LevelNumber = 1;
      const SubLevelNumber = 0;
      const workflowStep = { UID_QERWorkingStep: 'some workingstep', DirectSteps: '1' };
      const workflowStepOther = { UID_QERWorkingStep: 'some other workingstep', DirectSteps: '2' };;

      const workflow = new WorkflowDataWrapper(
        {
          WorkflowData: createWorkflowCollection([
            { UID_PersonHead, LevelNumber, SubLevelNumber: SubLevelNumber + 1, UID_QERWorkingStep: workflowStepOther.UID_QERWorkingStep },
            { UID_PersonHead, LevelNumber, SubLevelNumber, UID_QERWorkingStep: workflowStep.UID_QERWorkingStep  },
            { UID_PersonHead, LevelNumber, SubLevelNumber: SubLevelNumber + 2, UID_QERWorkingStep: workflowStepOther.UID_QERWorkingStep }
          ]),
          WorkflowSteps: createWorkflowCollection([
            workflowStep,
            workflowStepOther
          ])
        }
      );

      const directSteps = workflow.getDirectSteps(UID_PersonHead, LevelNumber);

      expect(directSteps[0]).toEqual(Number(workflowStep.DirectSteps));
    });
  });

  describe('isAdditionalAllowed', () => {
    it('returns false if no match', () => {
      const UID_PersonHead = 'some user id';
      const LevelNumber = 1;
      const UID_QERWorkingStep = 'some workingstep';

      const workflow = new WorkflowDataWrapper(
        {
          WorkflowData: createWorkflowCollection([{ UID_PersonHead, LevelNumber, UID_QERWorkingStep }]),
          WorkflowSteps: createWorkflowCollection([{ UID_QERWorkingStep: 'some other workingstep' }])
        }
      );

      expect(workflow.isAdditionalAllowed(UID_PersonHead, LevelNumber)).toBeFalsy();
    });

    [
      { workflowData: { IsFromDelegation: true }, workflowStep: { IsAdditionalAllowed: true } },
      { workflowData: { UID_PersonAdditional: 'id of some additional person' }, workflowStep: { IsAdditionalAllowed: true } },
      { workflowData: { UID_PersonInsteadOf: 'id of some other person' }, workflowStep: { IsAdditionalAllowed: true } },
      { workflowStep: { IsAdditionalAllowed: false } }
    ].forEach(testcase =>
    it('returns false if matching item has ' + testcaseToString(testcase), () => {
      const UID_PersonHead = 'some user id';
      const LevelNumber = 1;
      const workflowStep = { ...{ UID_QERWorkingStep: 'some workingstep' }, ...testcase.workflowStep };

      const workflow = new WorkflowDataWrapper(
        {
          WorkflowData: createWorkflowCollection([
            {
              ...{ UID_PersonHead, LevelNumber, UID_QERWorkingStep: workflowStep.UID_QERWorkingStep },
              ...testcase.workflowData
            }
          ]),
          WorkflowSteps: createWorkflowCollection([ workflowStep ])
        }
      );

      expect(workflow.isAdditionalAllowed(UID_PersonHead, LevelNumber)).toBeFalsy();
    }));

    it('returns true if matching item', () => {
      const UID_PersonHead = 'some user id';
      const LevelNumber = 1;
      const workflowStep = { UID_QERWorkingStep: 'some workingstep', IsAdditionalAllowed: true };
      const UID_PersonAdditional = '';
      const UID_PersonInsteadOf = '';

      const workflow = new WorkflowDataWrapper(
        {
          WorkflowData: createWorkflowCollection([
            { UID_PersonHead, LevelNumber, UID_QERWorkingStep: workflowStep.UID_QERWorkingStep, UID_PersonAdditional, UID_PersonInsteadOf }
          ]),
          WorkflowSteps: createWorkflowCollection([ workflowStep ])
        }
      );

      expect(workflow.isAdditionalAllowed(UID_PersonHead, LevelNumber)).toBeTruthy();
    });
  });

  describe('isInsteadOfAllowed', () => {
    it('returns false if no match', () => {
      const UID_PersonHead = 'some user id';
      const LevelNumber = 1;
      const UID_QERWorkingStep = 'some workingstep';

      const workflow = new WorkflowDataWrapper(
        {
          WorkflowData: createWorkflowCollection([{ UID_PersonHead, LevelNumber, UID_QERWorkingStep }]),
          WorkflowSteps: createWorkflowCollection([{ UID_QERWorkingStep: 'some other workingstep' }])
        }
      );

      expect(workflow.isInsteadOfAllowed(UID_PersonHead, LevelNumber)).toBeFalsy();
    });

    [
      { workflowData: { IsFromDelegation: true }, workflowStep: { IsInsteadOfAllowed: true } },
      { workflowData: { UID_PersonAdditional: 'id of some additional person' }, workflowStep: { IsInsteadOfAllowed: true } },
      { workflowData: { UID_PersonInsteadOf: 'id of some other person' }, workflowStep: { IsInsteadOfAllowed: true } },
      { workflowStep: { IsInsteadOfAllowed: false } }
    ].forEach(testcase =>
    it('returns false if matching item has ' + testcaseToString(testcase), () => {
      const UID_PersonHead = 'some user id';
      const LevelNumber = 1;
      const workflowStep = { ...{ UID_QERWorkingStep: 'some workingstep' }, ...testcase.workflowStep };

      const workflow = new WorkflowDataWrapper(
        {
          WorkflowData: createWorkflowCollection([
            {
              ...{ UID_PersonHead, LevelNumber, UID_QERWorkingStep: workflowStep.UID_QERWorkingStep },
              ...testcase.workflowData
            }
          ]),
          WorkflowSteps: createWorkflowCollection([ workflowStep ])
        }
      );

      expect(workflow.isInsteadOfAllowed(UID_PersonHead, LevelNumber)).toBeFalsy();
    }));

    it('returns true if matching item', () => {
      const UID_PersonHead = 'some user id';
      const LevelNumber = 1;
      const workflowStep = { UID_QERWorkingStep: 'some workingstep', IsInsteadOfAllowed: true };
      const UID_PersonAdditional = '';
      const UID_PersonInsteadOf = '';

      const workflow = new WorkflowDataWrapper(
        {
          WorkflowData: createWorkflowCollection([
            { UID_PersonHead, LevelNumber, UID_QERWorkingStep: workflowStep.UID_QERWorkingStep, UID_PersonAdditional, UID_PersonInsteadOf }
          ]),
          WorkflowSteps: createWorkflowCollection([ workflowStep ])
        }
      );

      expect(workflow.isInsteadOfAllowed(UID_PersonHead, LevelNumber)).toBeTruthy();
    });
  });

  describe('canRevokeAdditionalApprover', () => {
    it('returns false if no match', () => {
      const CanRevokeDelegation = true;
      const UID_PersonHead = 'some user id';
      const LevelNumber = 1;

      const workflow = new WorkflowDataWrapper(
        {
          CanRevokeDelegation,
          WorkflowData: createWorkflowCollection([{ UID_PersonHead: 'some other user id', LevelNumber }])
        }
      );

      expect(workflow.canRevokeAdditionalApprover(UID_PersonHead, LevelNumber)).toBeFalsy();
    });

    it('returns false if CanRevokeDelegation is false', () => {
      const CanRevokeDelegation = false;
      const UID_PersonHead = 'some user id';
      const LevelNumber = 1;
      const UID_PersonAdditional = 'some other user id';

      const workflow = new WorkflowDataWrapper(
        {
          CanRevokeDelegation,
          WorkflowData: createWorkflowCollection([{ UID_PersonHead, LevelNumber, UID_PersonAdditional }])
        }
      );

      expect(workflow.canRevokeAdditionalApprover(UID_PersonHead, LevelNumber)).toBeFalsy();
    });

    it('returns false if UID_PersonAdditional is empty', () => {
      const CanRevokeDelegation = true;
      const UID_PersonHead = 'some user id';
      const LevelNumber = 1;

      const workflow = new WorkflowDataWrapper(
        {
          CanRevokeDelegation,
          WorkflowData: createWorkflowCollection([{ UID_PersonHead, LevelNumber }])
        }
      );

      expect(workflow.canRevokeAdditionalApprover(UID_PersonHead, LevelNumber)).toBeFalsy();
    });

    it('returns true if CanRevokeDelegation is true and UID_PersonAdditional is not emtpy', () => {
      const CanRevokeDelegation = true;
      const UID_PersonHead = 'some user id';
      const LevelNumber = 1;
      const UID_PersonAdditional = 'some other user id';

      const workflow = new WorkflowDataWrapper(
        {
          CanRevokeDelegation,
          WorkflowData: createWorkflowCollection([{ UID_PersonHead, LevelNumber, UID_PersonAdditional }])
        }
      );

      expect(workflow.canRevokeAdditionalApprover(UID_PersonHead, LevelNumber)).toBeTruthy();
    });
  });

  describe('canRevokeDelegatedApprover', () => {
    it('returns false if no match', () => {
      const CanRevokeDelegation = true;
      const UID_PersonHead = 'some user id';
      const LevelNumber = 1;

      const workflow = new WorkflowDataWrapper(
        {
          CanRevokeDelegation,
          WorkflowData: createWorkflowCollection([{ UID_PersonHead: 'some other user id', LevelNumber }])
        }
      );

      expect(workflow.canRevokeDelegatedApprover(UID_PersonHead, LevelNumber)).toBeFalsy();
    });

    it('returns false if CanRevokeDelegation is false', () => {
      const CanRevokeDelegation = false;
      const UID_PersonHead = 'some user id';
      const LevelNumber = 1;
      const UID_PersonInsteadOf = 'some other user id';

      const workflow = new WorkflowDataWrapper(
        {
          CanRevokeDelegation,
          WorkflowData: createWorkflowCollection([{ UID_PersonHead, LevelNumber, UID_PersonInsteadOf }])
        }
      );

      expect(workflow.canRevokeDelegatedApprover(UID_PersonHead, LevelNumber)).toBeFalsy();
    });

    it('returns false if UID_PersonInsteadOf is empty', () => {
      const CanRevokeDelegation = true;
      const UID_PersonHead = 'some user id';
      const LevelNumber = 1;

      const workflow = new WorkflowDataWrapper(
        {
          CanRevokeDelegation,
          WorkflowData: createWorkflowCollection([{ UID_PersonHead, LevelNumber }])
        }
      );

      expect(workflow.canRevokeDelegatedApprover(UID_PersonHead, LevelNumber)).toBeFalsy();
    });

    it('returns true if CanRevokeDelegation is true and UID_PersonInsteadOf is not emtpy', () => {
      const CanRevokeDelegation = true;
      const UID_PersonHead = 'some user id';
      const LevelNumber = 1;
      const UID_PersonInsteadOf = 'some other user id';

      const workflow = new WorkflowDataWrapper(
        {
          CanRevokeDelegation,
          WorkflowData: createWorkflowCollection([{ UID_PersonHead, LevelNumber, UID_PersonInsteadOf }])
        }
      );

      expect(workflow.canRevokeDelegatedApprover(UID_PersonHead, LevelNumber)).toBeTruthy();
    });
  });

  describe('canDenyApproval', () => {
    it('returns false if no match', () => {
      const CanRevokeDelegation = true;
      const UID_PersonHead = 'some user id';
      const LevelNumber = 1;

      const workflow = new WorkflowDataWrapper(
        {
          CanRevokeDelegation,
          WorkflowData: createWorkflowCollection([{ UID_PersonHead: 'some other user id', LevelNumber }])
        }
      );

      expect(workflow.canDenyDecision(UID_PersonHead, LevelNumber)).toBeFalsy();
    });

    it('returns false if IsFromDelegation is false', () => {
      const UID_PersonHead = 'some user id';
      const LevelNumber = 1;
      const IsFromDelegation = false;

      const workflow = new WorkflowDataWrapper(
        {
          WorkflowData: createWorkflowCollection([{ UID_PersonHead, LevelNumber, IsFromDelegation }])
        }
      );

      expect(workflow.canDenyDecision(UID_PersonHead, LevelNumber)).toBeFalsy();
    });

    it('returns true if matching item and IsFromDelegation is true', () => {
      const UID_PersonHead = 'some user id';
      const LevelNumber = 1;
      const IsFromDelegation = false;

      const workflow = new WorkflowDataWrapper(
        {
          WorkflowData: createWorkflowCollection([{ UID_PersonHead, LevelNumber, IsFromDelegation }])
        }
      );

      expect(workflow.canDenyDecision(UID_PersonHead, LevelNumber)).toBeFalsy();
    });
  });

  describe('canEscalateDecision', () => {
    it('returns false if no match', () => {
      const LevelNumber = 1;
      const workflowStep = { EscalationSteps: 1, LevelNumber: 2 };

      const workflow = new WorkflowDataWrapper(
        {
          WorkflowSteps: createWorkflowCollection([ workflowStep ])
        }
      );

      expect(workflow.canEscalateDecision(LevelNumber)).toBeFalsy();
    });

    it('returns false if EscalationSteps === 0', () => {
      const LevelNumber = 1;
      const workflowStep = { EscalationSteps: 0, LevelNumber };

      const workflow = new WorkflowDataWrapper(
        {
          WorkflowSteps: createWorkflowCollection([ workflowStep ])
        }
      );

      expect(workflow.canEscalateDecision(LevelNumber)).toBeFalsy();
    });

    it('returns true if matching item and EscalationSteps !== 0', () => {
      const LevelNumber = 1;
      const workflowStep = { EscalationSteps: 1, LevelNumber };

      const workflow = new WorkflowDataWrapper(
        {
          WorkflowSteps: createWorkflowCollection([ workflowStep ])
        }
      );

      expect(workflow.canEscalateDecision(LevelNumber)).toBeTruthy();
    });
  });
});
