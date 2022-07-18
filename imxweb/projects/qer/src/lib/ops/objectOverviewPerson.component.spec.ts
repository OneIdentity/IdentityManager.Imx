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

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { configureTestSuite } from 'ng-bullet';
import { LoggerTestingModule } from 'ngx-logger/testing';
import * as TypeMoq from 'typemoq';

import { DbObjectKey } from 'imx-qbm-dbts';
import { OpsupportDbObjectService, clearStylesFromDOM, imx_SessionService } from 'qbm';
import { ObjectOverviewPersonComponent } from './objectOverviewPerson.component';
import { PasscodeService } from './passcode.service';
import { EuiLoadingService } from '@elemental-ui/core';

[
  {
    description: ' manager',
    personPassCode: { UID_PersonManager: 'uidpersonmanager1' },
    dbEntityData: { Display: 'Display' }
  },
  {
    description: '',
    personPassCode: { UID_PersonManager: null }
  }
].forEach(testcase =>
  describe('ObjectOverviewPersonComponent', () => {
    let component: ObjectOverviewPersonComponent;
    let fixture: ComponentFixture<ObjectOverviewPersonComponent>;

    const generateSpy = jasmine.createSpy('getPasscodeWithOpsLogin').and.returnValue(Promise.resolve({
      PassCode: 'opsCode',
      UID_PersonManager: 'uidManager',
      PasscodeSplit: true
    }));
    const showSpy = jasmine.createSpy('showPasscode');

    configureTestSuite(() => {
      TestBed.configureTestingModule({
        imports: [MatDialogModule, LoggerTestingModule],
        declarations: [ObjectOverviewPersonComponent],
        schemas: [NO_ERRORS_SCHEMA],
        providers: [
          {
            provide: PasscodeService,
            useValue: {
              getPasscodeWithOpsLogin: generateSpy,
              showPasscode: showSpy,
            }
          },
          {
            provide: OpsupportDbObjectService,
            useValue: {
              Get: jasmine.createSpy('Get').and.callFake(() => {
                return Promise.resolve(testcase.dbEntityData);
              })
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
            provide: imx_SessionService,
            useValue: {
              Client: {
                opsupport_usergroups_get: () => Promise.resolve(false)
              }
            }
          }
        ]
      });
    });

    beforeEach(() => {
      generateSpy.calls.reset;
      const objKeys: ReadonlyArray<string> = ['Uid_1', 'Uid_2'];

      const objectKeyMock = TypeMoq.Mock.ofType<DbObjectKey>();
      objectKeyMock.setup(k => k.TableName).returns(() => 'person');
      objectKeyMock.setup(k => k.Keys).returns(() => objKeys);

      fixture = TestBed.createComponent(ObjectOverviewPersonComponent);
      component = fixture.componentInstance;
      component.referrer = {
        objectKey: objectKeyMock.object,
        display: 'somedisplayname'
      };
      fixture.detectChanges();
    });

    afterAll(() => {
      clearStylesFromDOM();
    });

    it('should create', () => {
      expect(component).toBeDefined();
    });

    it('generates a passcode and shows it on the screen' + testcase.description, async () => {
      await component.generateAndShowPasscode();
      expect(generateSpy).toHaveBeenCalledWith(component.referrer.objectKey.Keys[0]);
    });
  }));
