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
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

import { WorkflowActionService } from './workflow-action.service';
import { SnackBarService, EntityService, ExtService, ClassloggerService } from 'qbm';
import { PortalItshopApproveRequests, PortalWorkflow } from 'imx-api-qer';
import { ApprovalsService } from '../approvals.service';
import { PersonService } from '../../person/person.service';
import { IEntity, IEntityColumn } from 'imx-qbm-dbts';
import { Approval } from '../approval';
import { ProjectConfigurationService } from '../../project-configuration/project-configuration.service';
import { QerApiService } from '../../qer-api-client.service';
import { JustificationService } from '../../justification/justification.service';
import { JustificationType } from '../../justification/justification-type.enum';
import { _MatSlideToggleRequiredValidatorModule } from '@angular/material/slide-toggle';

describe('WorkflowActionService', () => {
  let service: WorkflowActionService;

  function createColumn(name: string): IEntityColumn {
    let value: any;
    return {
      ColumnName: name,
      GetValue: () => value,
      GetDisplayValue: () => value + '(Display)',
      PutValue: newValue => value = newValue
    } as IEntityColumn;
  }

  function createEntity(key?: string): IEntity {
    return {
      GetDisplay: () => undefined,
      GetKeys: () => [key],
      Commit: () => { },
      DiscardChanges: () => { }
    } as IEntity
  }

  const testHelper = new class {
    readonly workFlowMock = { someKey: { Data: [{} as PortalWorkflow] } };
    readonly sessionServiceStub = {
      typedClient: {
        PortalItshopApproveRequests: {
          GetSchema: () => PortalItshopApproveRequests.GetEntitySchema()
        },
        PortalWorkflow: {
          GetSchema: () => PortalWorkflow.GetEntitySchema(),
          Get: jasmine.createSpy('Get').and.callFake((uidPwo: string) => this.workFlowMock[uidPwo])
        }
      },
      v2Client: {
        portal_itshop_approve_requests_stepup_post: jasmine.createSpy('portal_itshop_approve_requests_stepup_post').and.callFake(() => '')
      }
    };

    readonly projectConfigurationServiceStub = {
      getConfig: jasmine.createSpy('getConfig').and.callFake(() => Promise.resolve({
        ITShopConfig: {
          VI_ITShop_ApproverCanSetValidFrom: true,
          VI_ITShop_ApproverCanSetValidUntil: true,
          StepUpAuthenticationProvider: "NoAuth"
        }
      }))
    };

    readonly extServiceStub = {
      getFittingComponent: jasmine.createSpy('getFittingComponent').and.callFake(() => Promise.resolve({
        instance: {}
      }))
    }

    readonly sideSheetServiceStub = new class {
      result = false;
      readonly testdata = {
        reason: 'some reason',
        justification: 'some justification',
        uidPerson: 'uid-123',
        offset: 99
      };

      open(_dialogType, config: { data: any }) {
        return {
          afterClosed: () => {
            if (this.result && config.data.actionParameters) {
              Object.keys(config.data.actionParameters).forEach(name =>
                config.data.actionParameters[name]?.column?.PutValue(this.testdata[name])
              );
            }
            return of(this.result);
          }
        }
      }
    }();

    readonly entityServiceStub = new class {
      readonly createLocalEntityColumn = jasmine.createSpy('createLocalEntityColumn').and.callFake(
        property => createColumn(property.name)
      );
    }();

    readonly approvalsServiceStub = new class {
      readonly recallDecision = jasmine.createSpy('recallDecision');
      readonly revokeDelegation = jasmine.createSpy('revokeDelegation');
      readonly addApprover = jasmine.createSpy('addApprover');
      readonly delegateDecision = jasmine.createSpy('delegateDecision');
      readonly denyDecision = jasmine.createSpy('denyDecision');
      readonly escalateDecision = jasmine.createSpy('escalateDecision');
      readonly directDecision = jasmine.createSpy('directDecision');
      readonly makeDecision = jasmine.createSpy('makeDecision');
    }();

    readonly justificationServiceStub = new class {
      cdrs = {};

      readonly createCdr = jasmine.createSpy('createCdr').and.callFake(type => this.cdrs[type]);

      constructor() {
        this.reset();
      }

      reset() {
        this.cdrs[JustificationType.approve] = { column: createColumn('just approve') };
        this.cdrs[JustificationType.deny] = { column: createColumn('just deny') };
      }
    }();

    reset() {
      this.sideSheetServiceStub.result = false;

      Object.keys(this.approvalsServiceStub).forEach(name =>
        this.approvalsServiceStub[name].calls.reset()
      );

      this.justificationServiceStub.reset();

      this.sessionServiceStub.v2Client.portal_itshop_approve_requests_stepup_post.calls.reset();
    }
  }();

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [
        WorkflowActionService,
        {
          provide: QerApiService,
          useValue: testHelper.sessionServiceStub
        },
        {
          provide: ClassloggerService,
          useValue: {
            debug: jasmine.createSpy('debug').and.callThrough()
          }
        },
        {
          provide: TranslateService,
          useValue: {
            get: jasmine.createSpy('get').and.returnValue(of())
          }
        },
        {
          provide: ProjectConfigurationService,
          useValue: testHelper.projectConfigurationServiceStub
        },
        {
          provide: SnackBarService,
          useValue: {
            open: jasmine.createSpy('open')
          }
        },
        {
          provide: EntityService,
          useValue: testHelper.entityServiceStub
        },
        {
          provide: ApprovalsService,
          useValue: testHelper.approvalsServiceStub
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
        },
        {
          provide: PersonService,
          useValue: {
            createFkProviderItem: jasmine.createSpy('createFkProviderItem')
          }
        },
        {
          provide: JustificationService,
          useValue: testHelper.justificationServiceStub
        },
        {
          provide: ExtService,
          useValue: testHelper.extServiceStub
        }
      ]
    });
    service = TestBed.inject(WorkflowActionService);
  });

  beforeEach(() => {
    testHelper.reset();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should revokeDelegation', async () => {
    testHelper.sideSheetServiceStub.result = true;
    const approvalKey = 'some key';
    const approval = new class {
      GetEntity = () => createEntity(approvalKey);
    }() as Approval;
    await service.revokeDelegations([approval]);
    expect(testHelper.approvalsServiceStub.revokeDelegation).toHaveBeenCalledWith(approval, {
      Reason: testHelper.sideSheetServiceStub.testdata.reason
    });
  });

  it('should escalateDecision', async () => {
    testHelper.sideSheetServiceStub.result = true;
    const approvalKey = 'some key';
    const approval = new class {
      GetEntity = () => createEntity(approvalKey);
    }() as Approval;
    await service.escalateDecisions([approval]);
    expect(testHelper.approvalsServiceStub.escalateDecision).toHaveBeenCalledWith(approval,
      testHelper.sideSheetServiceStub.testdata.reason
    );
  });

  it('should addAdditional', async () => {
    testHelper.sideSheetServiceStub.result = true;
    const approvalKey = 'some key';
    const approval = new class {
      GetEntity = () => createEntity(approvalKey);
    }() as Approval;
    await service.addAdditionalApprovers([approval]);
    expect(testHelper.approvalsServiceStub.addApprover).toHaveBeenCalledWith(approval, {
      Reason: testHelper.sideSheetServiceStub.testdata.reason,
      UidPerson: testHelper.sideSheetServiceStub.testdata.uidPerson
    });
  });

  it('should delegate', async () => {
    testHelper.sideSheetServiceStub.result = true;
    const approvalKey = 'some key';
    const approval = new class {
      GetEntity = () => createEntity(approvalKey);
    }() as Approval;
    await service.delegateDecisions([approval]);
    expect(testHelper.approvalsServiceStub.delegateDecision).toHaveBeenCalledWith(approval, {
      Reason: testHelper.sideSheetServiceStub.testdata.reason,
      UidPerson: testHelper.sideSheetServiceStub.testdata.uidPerson
    });
  });

  it('should denyDecision', async () => {
    testHelper.sideSheetServiceStub.result = true;
    const approvalKey = 'some key';
    const approval = new class {
      GetEntity = () => createEntity(approvalKey);
    }() as Approval;
    await service.denyDecisions([approval]);
    expect(testHelper.approvalsServiceStub.denyDecision).toHaveBeenCalledWith(approval, {
      Reason: testHelper.sideSheetServiceStub.testdata.reason
    });
  });

  it('should escalateDecision', async () => {
    testHelper.sideSheetServiceStub.result = true;
    const approvalKey = 'some key';
    const approval = new class {
      GetEntity = () => createEntity(approvalKey);
    }() as Approval;
    await service.escalateDecisions([approval]);
    expect(testHelper.approvalsServiceStub.escalateDecision).toHaveBeenCalledWith(approval,
      testHelper.sideSheetServiceStub.testdata.reason
    );
  });

  it('should directDecision', async () => {
    testHelper.sideSheetServiceStub.result = true;
    const approvalKey = 'some key';
    const approval = {
      decisionOffset: testHelper.sideSheetServiceStub.testdata.offset,
      GetEntity: () => createEntity(approvalKey)
    } as Approval;

    await service.directDecisions([approval], undefined);
    expect(testHelper.approvalsServiceStub.directDecision).toHaveBeenCalledWith(approval, {
      Offset: testHelper.sideSheetServiceStub.testdata.offset,
      Reason: testHelper.sideSheetServiceStub.testdata.reason
    });
  });

  for (const testcase of [
    { description: '(approve, no MFA)', approve: true },
    { description: '(approve, no justifications)', approve: true, noJustifications: true },
    { description: '(deny)', approve: false },
    { description: '(approve, no justifications)', approve: false, noJustifications: true },
  ]) {
    it(`should makeDecision ${testcase.description}`, async () => {
      testHelper.sideSheetServiceStub.result = true;
      const approvalKey = 'some key';
      const approval = {
        ValidFrom: {},
        ValidUntil: {},
        DenyReasonType: {},
        ApproveReasonType: {},
        IsApproveRequiresMfa: {},
        canSetValidFrom: () => true,
        canSetValidUntil: _ => true,
        GetEntity: () => createEntity(approvalKey),
        commit: () => Promise.resolve()
      } as Approval;

      if (testcase.noJustifications) {
        testHelper.justificationServiceStub.cdrs = {};
      }

      if (testcase.approve) {
        await service.approve([approval]);
      } else {
        await service.deny([approval]);
      }
      expect(testHelper.approvalsServiceStub.makeDecision).toHaveBeenCalledWith(approval, {
        Reason: testHelper.sideSheetServiceStub.testdata.reason,
        UidJustification: testcase.noJustifications ? undefined : testHelper.sideSheetServiceStub.testdata.justification,
        Decision: testcase.approve
      });
    });
  }
});
