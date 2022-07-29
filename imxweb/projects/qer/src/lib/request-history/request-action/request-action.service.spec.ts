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
import { TranslateService } from '@ngx-translate/core';
import { configureTestSuite } from 'ng-bullet';

import { PortalItshopRequests } from 'imx-api-qer';
import { IEntityColumn, IEntity } from 'imx-qbm-dbts';

import { ClassloggerService, EntityService, SnackBarService } from 'qbm';
import { PersonService } from '../../person/person.service';

import { of } from 'rxjs';

import { RequestActionService } from './request-action.service';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { RequestHistoryService } from '../request-history.service';
import { QerApiService } from '../../qer-api-client.service';
import { ProjectConfigurationService } from '../../project-configuration/project-configuration.service';
import { JustificationService } from '../../justification/justification.service';

describe('RequestActionService', () => {
  let service: RequestActionService;

  function createColumn(name: string) {
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
    readonly workFlowMock = { someKey: { Data: [{} as PortalItshopRequests] } };
    readonly sessionServiceStub = {
      typedClient: {
        PortalWorkflow: {
          Get: jasmine.createSpy('Get').and.callFake((uidPwo: string) => this.workFlowMock[uidPwo])
        }
      }
    };

    readonly loggerStub = {
      log: jasmine.createSpy('log'),
      debug: jasmine.createSpy('debug'),
      trace: jasmine.createSpy('trace')
    } as unknown;

    readonly projectConfigurationServiceStub = {
      getConfig: jasmine.createSpy('getConfig').and.callFake(() => Promise.resolve({
        ITShopConfig: {
          VI_ITShop_ApproverCanSetValidFrom: true,
          VI_ITShop_ApproverCanSetValidUntil: true
        }
      }))
    };

    readonly sideSheetServiceStub = new class {
      result = false;
      readonly testdata = {
        reason: 'some reason'
      };

      open(_dialogType, config: { data: any }) {
        return {
          afterClosed: () => {
            if (this.result && config.data.reason) {
              config.data.reason.column.PutValue(this.testdata.reason);
            }
            return of(this.result);
          }
        }
      }
    }();

    readonly entityServiceStub = new class {
      readonly createLocalEntityColumn = jasmine.createSpy('createLocalEntityColumn').and.callFake(
        property => createColumn(property.ColumnName)
      );
    }();

    readonly requestHistoryService = new class {
      readonly cancelRequest = jasmine.createSpy('cancelRequest');
      readonly recallQuery = jasmine.createSpy('recallQuery');
      readonly resetReservation = jasmine.createSpy('resetReservation');
      readonly revokeDelegation = jasmine.createSpy('revokeDelegation');
    }();

    reset() {
      this.sideSheetServiceStub.result = false;

      Object.keys(this.requestHistoryService).forEach(name =>
        this.requestHistoryService[name].calls.reset()
      );
    }
  }();

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerTestingModule
      ],
      providers: [
        RequestActionService,
        {
          provide: QerApiService,
          useValue: testHelper.sessionServiceStub
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
          provide: RequestHistoryService,
          useValue: testHelper.requestHistoryService
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
          provider: ClassloggerService,
          useValue: testHelper.loggerStub
        },
        {
          provide: JustificationService,
          useValue: {}
        }
      ]
    });
    service = TestBed.inject(RequestActionService);
  });

  beforeEach(() => {
    testHelper.reset();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  for (const testcase of [
    { description: 'cancel', result: false },
    { description: 'a reason', result: true }
  ]) {
    it('should withdrawRequest', async () => {
      testHelper.sideSheetServiceStub.result = testcase.result;
      const pwoKey = 'some key';
      const pwo = new class {
        GetEntity = () => createEntity(pwoKey);
      }() as PortalItshopRequests;
      await service.withdrawRequest([pwo]);
      if (testcase.result) {
        expect(testHelper.requestHistoryService.cancelRequest).toHaveBeenCalledWith(pwo, testHelper.sideSheetServiceStub.testdata.reason);
      }
      else {
        expect(testHelper.requestHistoryService.cancelRequest).not.toHaveBeenCalled();
      }
    });
  }
  for (const testcase of [
    { description: 'cancel', result: false },
    { description: 'a reason', result: true }
  ]) {

    it('should recallLastQuestion', async () => {
      testHelper.sideSheetServiceStub.result = testcase.result;
      const pwoKey = 'some key';
      const pwo = new class {
        GetEntity = () => createEntity(pwoKey);
      }() as PortalItshopRequests;
      await service.recallLastQuestion([pwo]);
      if (testcase.result) {
        expect(testHelper.requestHistoryService.recallQuery).toHaveBeenCalledWith(pwo,
          testHelper.sideSheetServiceStub.testdata.reason
        );
      }
      else {
        expect(testHelper.requestHistoryService.recallQuery).not.toHaveBeenCalled();
      }
    });
  }

  for (const testcase of [
    { description: 'cancel', result: false },
    { description: 'a reason', result: true }
  ]) {
    it('should revokeHoldStatus', async () => {
      testHelper.sideSheetServiceStub.result = testcase.result;
      const pwoKey = 'some key';
      const pwo = new class {
        GetEntity = () => createEntity(pwoKey);
      }() as PortalItshopRequests;
      await service.revokeHoldStatus([pwo]);
      if (testcase.result) {
        expect(testHelper.requestHistoryService.resetReservation).toHaveBeenCalledWith(pwo,
          testHelper.sideSheetServiceStub.testdata.reason
        );
      }
      else {
        expect(testHelper.requestHistoryService.resetReservation).not.toHaveBeenCalled();
      }
    });
  }

  for (const testcase of [
    { description: 'cancel', result: false },
    { description: 'a reason', result: true }
  ]) {
    it('should revokeDelegation', async () => {
      testHelper.sideSheetServiceStub.result = testcase.result;
      const pwoKey = 'some key';
      const pwo = new class {
        GetEntity = () => createEntity(pwoKey);
      }() as PortalItshopRequests;
      await service.revokeDelegation([pwo], 'some title', 'a message', 'a description');
      if (testcase.result) {
        expect(testHelper.requestHistoryService.revokeDelegation).toHaveBeenCalledWith(pwo,
          testHelper.sideSheetServiceStub.testdata.reason
        );
      }
      else {
        expect(testHelper.requestHistoryService.revokeDelegation).not.toHaveBeenCalled();
      }
    });
  }

});
