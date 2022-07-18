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
import { MatSnackBar } from '@angular/material/snack-bar';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

import { PortalAttestationRun } from 'imx-api-att';
import { AppConfigService, ElementalUiConfigService, SnackBarService } from 'qbm';
import { RunsService } from './runs.service';
import { ApiService } from '../api.service';
import { AttestationCasesService } from '../decision/attestation-cases.service';

describe('RunsService', () => {
  let service: RunsService;

  const sessionServiceStub = {
    client: {
      portal_attestation_run_extend_post: jasmine.createSpy('portal_attestation_run_extend_post'),
      portal_attestation_run_sendreminder_post: jasmine.createSpy('portal_attestation_run_sendreminder_post')
    },
    typedClient: {
      PortalAttestationRunApprovers: {
        Get: jasmine.createSpy('Get')
      }
    }
  };

  const mockSendReminderDialog = new class {
    result = false;
    readonly testdata = {
      message: 'some message'
    };

    open(dialogType, config: { data: { message: string } }) {
      return {
        afterClosed: () => {
          if (this.result) {
            config.data.message = this.testdata.message;
          }
    
          return of(this.result);
        }
      }
    }

    reset() {
      this.result = false;
    }
  }();

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [
        RunsService,
        {
          provide: MatSnackBar,
          useValue: {}
        },
        {
          provide: ApiService,
          useValue: sessionServiceStub
        },
        {
          provide: EuiSidesheetService,
          useValue: mockSendReminderDialog
        },
        {
          provide: SnackBarService,
          useValue: {
            open: jasmine.createSpy('open')
          }
        },
        {
          provide: EuiLoadingService,
          useValue: {
            show: jasmine.createSpy('show'),
            hide: jasmine.createSpy('hide')
          }
        },
        {
          provide: TranslateService,
          useValue: {
            get: jasmine.createSpy('get').and.callFake(__ => of(''))
          }
        },
        {
          provide: AppConfigService,
          useValue: {}
        },
        {
          provide: AttestationCasesService,
          useValue: {}
        },
        {
          provide: ElementalUiConfigService,
          useValue: { 
            Config: jasmine.createSpy('Config').and.returnValue({ downloadOptions: {} })
          }
        }
      ]
    });
    service = TestBed.get(RunsService);
  });

  beforeEach(() => {
    sessionServiceStub.client.portal_attestation_run_extend_post.calls.reset();
    sessionServiceStub.client.portal_attestation_run_sendreminder_post.calls.reset();
    sessionServiceStub.typedClient.PortalAttestationRunApprovers.Get.calls.reset();
    mockSendReminderDialog.reset();
  });

  [
    { hasDueDate: false, secondsLeft: 1, expected: false },
    { hasDueDate: true, secondsLeft: 1, expected: false },
    { hasDueDate: false, secondsLeft: 0, expected: false },
    { hasDueDate: true, secondsLeft: 0, expected: true }
  ].forEach(testcase =>
  it('calculates if run is overdue', () => {
    const attestationRun = {
      DueDate: { value: testcase.hasDueDate ? new Date() : undefined },
      SecondsLeft: { value: testcase.secondsLeft }
    } as PortalAttestationRun;
    expect(service.isOverdue(attestationRun)).toEqual(testcase.expected);
  }));

  it('has an extend run method', async () => {
    const runKey = 'some key';
    const testdata = {
      ProlongateUntil: new Date(),
      Reason: 'some reason'
    };
    await service.extendRun({ GetEntity: () => ({ GetKeys: () => [runKey] }) } as PortalAttestationRun, testdata);
    expect(sessionServiceStub.client.portal_attestation_run_extend_post).toHaveBeenCalledWith(runKey, testdata);
  });

  it('has a get approvers method', async () => {
    const runKey = 'some key';
    await service.getApprovers({ GetEntity: () => ({ GetKeys: () => [runKey] }) } as PortalAttestationRun);
    expect(sessionServiceStub.typedClient.PortalAttestationRunApprovers.Get).toHaveBeenCalledWith(runKey);
  });

  [
    { dialogResult: false },
    { dialogResult: true }
  ].forEach(testcase =>
  it('has a send reminder method', async () => {
    mockSendReminderDialog.result = testcase.dialogResult;

    const runKeys = ['some key', 'some other key'];

    const reminderInput = {
      Message: mockSendReminderDialog.testdata.message,
      UidPerson: [],
      UidRuns: runKeys
    };

    await service.sendReminderEmail(
      runKeys.map(key => ({ GetEntity: () => ({ GetKeys: () => [key] }) } as PortalAttestationRun)),
      reminderInput.UidPerson
    );

    if (testcase.dialogResult) {
      expect(sessionServiceStub.client.portal_attestation_run_sendreminder_post).toHaveBeenCalledWith(reminderInput);
    } else {
      expect(sessionServiceStub.client.portal_attestation_run_sendreminder_post).not.toHaveBeenCalled();
    }
  }));
});
