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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { EuiLoadingService } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { ImxTranslationProviderService, LdsReplacePipe, OpsupportDbObjectService } from 'qbm';
import { of } from 'rxjs';
import { ProjectConfigurationService } from '../project-configuration/project-configuration.service';
import { QerApiService } from '../qer-api-client.service';

import { PasscodeService } from './passcode.service';

for (const testcase of [
  {
    description: ' manager',
    manager: { UID_PersonManager: 'uidpersonmanager1' },
    dbEntityData: { Display: 'Display' }
  },
  {
    description: '',
    manager: null
  }
]) {
  describe('PasscodeService', () => {
    let service: PasscodeService;

    const openDialogSpy = jasmine.createSpy('openDialog').and.callThrough();
    const sessionServiceSpy = {
      client: jasmine.createSpyObj('Client', {
        opsupport_person_passcode_post: Promise.resolve({
          PassCode: 'opsCode',
          UID_PersonManager: 'uidManager',
          PasscodeSplit: true
        }),
        portal_person_passcode_post: Promise.resolve({
          PassCode: 'portalCode',
          UID_PersonManager: 'uidManager',
          PasscodeSplit: true
        })
      })
    };

    const mockTranslationProviderService = {
      Translate: jasmine.createSpy('Translate').and.callFake(value => of(value))
    };

    const mockLdsReplacePipe = {
      transform: jasmine.createSpy('transform')
    };


    configureTestSuite(() => {
      TestBed.configureTestingModule({
        imports: [MatDialogModule, LoggerTestingModule],
        providers: [
          {
            provide: QerApiService,
            useValue: sessionServiceSpy
          },
          {
            provide: MatDialog,
            useClass: class {
              open = openDialogSpy;
            }
          },
          {
            provide: EuiLoadingService,
            useValue: {
              hide: jasmine.createSpy('hide'),
              show: jasmine.createSpy('show')
            }
          },
          {
            provide: ImxTranslationProviderService,
            useValue: mockTranslationProviderService
          },
          {
            provide: LdsReplacePipe,
            useValue: mockLdsReplacePipe
          },
          {
            provides: ProjectConfigurationService,
            useValue: {
              getConfig: () => Promise.resolve({ PersonConfig: { VI_Employee_MasterData_PassCode_HoursValid: 4 } })
            }
          }
        ]
      });
      service = TestBed.inject(PasscodeService);
    });

    beforeEach(() => {
      openDialogSpy.calls.reset();
      mockLdsReplacePipe.transform.calls.reset();
    });

    it('should be created', () => {
      expect(service).toBeTruthy();
    });


    it('shows a passcode on the screen' + testcase.description, async () => {

      await service.showPasscode({
        PassCode: 'opsCode',
        UID_PersonManager: 'uidManager',
        PasscodeSplit: true
      }, 'myUser', 'the manager', 2);
      expect(mockLdsReplacePipe.transform).toHaveBeenCalled();
      expect(openDialogSpy).toHaveBeenCalled();
    });

    it('generates a passcode ' + testcase.description, async () => {
      const ops = await (service.getPasscodeWithOpsLogin(testcase.manager?.UID_PersonManager));
      const portal = await (service.getPasscodeWithPortalLogin(testcase.manager?.UID_PersonManager));
      expect(ops.PassCode).toEqual('opsCode');
      expect(portal.PassCode).toEqual('portalCode');

    });
  });
}
