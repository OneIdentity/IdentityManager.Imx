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
import { EuiSidesheetService, EuiLoadingService } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';
import { of } from 'rxjs';

import { IEntityColumn } from 'imx-qbm-dbts';
import { SnackBarService, EntityService, BaseCdr } from 'qbm';
import { JustificationService } from 'qer';
import { RulesViolationsApproval } from '../rules-violations-approval';
import { RulesViolationsActionService } from './rules-violations-action.service';
import { ApiService } from '../../api.service';
import { PortalRulesViolations } from 'imx-api-cpl';

describe('RulesViolationsActionService', () => {
  let service: RulesViolationsActionService;

  function createColumn(name: string): IEntityColumn {
    let value: any;
    return {
      ColumnName: name,
      GetValue: () => value,
      PutValue: newValue => value = newValue
    } as IEntityColumn;
  }

  const testHelper = {
    sideSheetServiceStub: {
      result: false,
      testdata: {
        reason: 'some reason',
        justification: 'some justification'
      },
      open(_dialogType, config: { data: any }) {
        return {
          afterClosed: () => {
            if (this.result && config.data.actionParameters) {
              Object.keys(config.data.actionParameters).forEach(name =>
                config.data.actionParameters[name].column.PutValue(this.testdata[name])
              );
            }
            return of(this.result);
          }
        }
      }
    },
    cplClientStub: {
      typedClient: {
        PortalRulesViolations: {
          GetSchema: () => PortalRulesViolations.GetEntitySchema(),
        }
      },
      client: {
        portal_rules_violations_post: jasmine.createSpy('portal_rules_violations_post')
      }
    },
    reset() {
      this.sideSheetServiceStub.result = false;
    }
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [
        RulesViolationsActionService,
        {
          provide: SnackBarService,
          useValue: {
            open: jasmine.createSpy('open')
          }
        },
        {
          provide: EntityService,
          useValue: {
            createLocalEntityColumn: property => createColumn(property.name)
          }
        },
        {
          provide: ApiService,
          useValue: testHelper.cplClientStub
        },
        {
          provide: JustificationService,
          useValue: {
            createCdr: _type => new BaseCdr(createColumn('Justification'))
          }
        },
        {
          provide: EuiSidesheetService,
          useValue: testHelper.sideSheetServiceStub
        },
        {
          provide: EuiLoadingService,
          useValue: {
            hide: jasmine.createSpy('hide'),
            show: jasmine.createSpy('show')
          }
        }
      ]
    });
    service = TestBed.inject(RulesViolationsActionService);
  });

  beforeEach(() => {
    testHelper.reset();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should approve', async () => {
    const makeDecisionSpy = spyOn<any>(service, 'postDecision');
    testHelper.sideSheetServiceStub.result = true;
    const ruleViolationApproval = {
      UID_Person: { value: 'uid-person-123' },
      UID_NonCompliance: { value: 'uid-NonCompliance-123' },
      commit: jasmine.createSpy('Commit')
    } as any as RulesViolationsApproval;

    await service.approve([ruleViolationApproval]);

    expect(makeDecisionSpy).toHaveBeenCalledWith(ruleViolationApproval, {
      Reason: testHelper.sideSheetServiceStub.testdata.reason,
      UidJustification: testHelper.sideSheetServiceStub.testdata.justification,
      ExceptionValidUntil: undefined,
      Decision: true
    });
  });

  it('should deny', async () => {
    const makeDecisionSpy = spyOn<any>(service, 'postDecision');
    testHelper.sideSheetServiceStub.result = true;
    const ruleViolationApproval = {
      UID_Person: { value: 'uid-person-123' },
      UID_NonCompliance: { value: 'uid-NonCompliance-123' },
      commit: jasmine.createSpy('Commit')
    } as any as RulesViolationsApproval;

    await service.deny([ruleViolationApproval]);

    expect(makeDecisionSpy).toHaveBeenCalledWith(ruleViolationApproval, {
      Reason: testHelper.sideSheetServiceStub.testdata.reason,
      UidJustification: testHelper.sideSheetServiceStub.testdata.justification,
      ExceptionValidUntil: undefined,
      Decision: false
    });
  });

});
