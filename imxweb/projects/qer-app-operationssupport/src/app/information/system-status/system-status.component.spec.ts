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
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { configureTestSuite } from 'ng-bullet';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { of } from 'rxjs';
import * as TypeMoq from 'typemoq';

import { SystemStatusComponent } from './system-status.component';
import { SystemStatusService } from './system-status.service';
import { ImxTranslationProviderService, MessageDialogComponent, clearStylesFromDOM } from 'qbm';
import { RoutingMock } from '../../test-utilities/router-mock.spec';
import { TranslationProviderServiceSpy } from '../../test-utilities/imx-translation-provider.service.spy.spec';


describe('ImxSystemStatusComponent', () => {
  let component: SystemStatusComponent;
  let fixture: ComponentFixture<SystemStatusComponent>;

  const statusOkAndAllDisabled = {
    IsDbSchedulerDisabled: true,
    IsJobServiceDisabled: true,
    IsCompilationRequired: true,
    IsInMaintenanceMode: true
  };

  const statusOkAndAllEnabled = {
    IsDbSchedulerDisabled: false,
    IsJobServiceDisabled: false,
    IsCompilationRequired: false,
    IsInMaintenanceMode: false
  };

  const WarningClass = 'warning';
  const CriticalClass = 'error';
  const OkClass = 'check';
  const DbCriticalClass = 'error';
  const DbWarningClass = 'warning';
  const DbOkClass = 'check';

  const statusNull: any = null;
  let routerSpy: RoutingMock = new RoutingMock();

  const afterCloseCallback = jasmine.createSpy('afterClose callback');

  const dialogRefMock = TypeMoq.Mock.ofType<MatDialogRef<MessageDialogComponent, any>>();
  dialogRefMock.setup(d => d.afterClosed()).returns(() => of(afterCloseCallback));

  const getStatusSpy = jasmine.createSpy('getStatus');
  const setStatusSpy = jasmine.createSpy('setStatus').and.returnValue(of(statusOkAndAllDisabled));
  const openDialogSpy = jasmine.createSpy('open').and.returnValue(dialogRefMock.object);

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        SystemStatusComponent
      ],
      imports: [
        LoggerTestingModule
      ],
      schemas: [
        NO_ERRORS_SCHEMA
      ],
      providers: [
        {
          provide: SystemStatusService,
          useClass: class {
            setStatus = setStatusSpy;
            getStatus = getStatusSpy;
            isSystemAdmin = jasmine.createSpy('isSystemAdmin').and.returnValue(Promise.resolve(true));
          }
        },
        {
          provide: MatDialog,
          useClass: class {
            open = openDialogSpy;
          }
        }
      ]
    });
  });

  beforeEach(() => {
    getStatusSpy.and.returnValue(of(statusOkAndAllDisabled));
    // reset all spy calls
    getStatusSpy.calls.reset();
    setStatusSpy.calls.reset();
    openDialogSpy.calls.reset();
    fixture = TestBed.createComponent(SystemStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('has an IconClass for the DBScheduler depending on the status and the dbscheduler', async () => {
    expect(component.iconClassDb).toBe(CriticalClass);

    getStatusSpy.and.returnValue(of(statusOkAndAllEnabled));
    await component.ngOnInit();

    expect(component.iconClassDb).toBe(OkClass);

    getStatusSpy.and.returnValue(of(statusNull));
    await component.ngOnInit();

    expect(component.iconClassDb).toBe(CriticalClass);
  });

  it('has an IconClass for the JobService depending on the status and the JobService', async () => {
    expect(component.iconClassJob).toBe(CriticalClass);

    getStatusSpy.and.returnValue(of(statusOkAndAllEnabled));
    await component.ngOnInit();

    expect(component.iconClassJob).toBe(OkClass);

    getStatusSpy.and.returnValue(of(statusNull));
    await component.ngOnInit();

    expect(component.iconClassJob).toBe(CriticalClass);
  });

  it('has an IconClass for the UpdateStatus depending on the status and the UpdateStatus', async () => {
    expect(component.iconClassUpdateStatus).toBe(DbCriticalClass);

    getStatusSpy.and.returnValue(of(statusOkAndAllEnabled));
    await component.ngOnInit();

    expect(component.iconClassUpdateStatus).toBe(DbOkClass);

    getStatusSpy.and.returnValue(of(statusNull));
    await component.ngOnInit();

    expect(component.iconClassUpdateStatus).toBe(DbCriticalClass);
  });

  it('has an IconClass for the DB depending on the status and the UpdateStatus', async () => {
    getStatusSpy.and.returnValue(of(statusOkAndAllEnabled));
    await component.ngOnInit();

    expect(component.iconClassDbStatus).toBe(OkClass);

    getStatusSpy.and.returnValue(of(statusNull));
    await component.ngOnInit();

    expect(component.iconClassDbStatus).toBe(CriticalClass);
  });

  it('has an IconClass for the maintanance status depending on the maintanance state of the database', async () => {
    expect(component.iconClassMaintenance).toBe(DbCriticalClass);

    getStatusSpy.and.returnValue(of(statusOkAndAllEnabled));
    await component.ngOnInit();

    expect(component.iconClassMaintenance).toBe(DbOkClass);

    getStatusSpy.and.returnValue(of(statusNull));
    await component.ngOnInit();

    expect(component.iconClassMaintenance).toBe(DbCriticalClass);
  });

  it('could by toggling the DbQueue', async () => {
    getStatusSpy.and.returnValue(of(statusOkAndAllEnabled));
    await component.ngOnInit();

    await component.toggleDbQueue();
    expect(setStatusSpy).not.toHaveBeenCalled();
    expect(openDialogSpy).toHaveBeenCalled();

    openDialogSpy.calls.reset();
    getStatusSpy.and.returnValue(of(statusOkAndAllDisabled));
    await component.ngOnInit();

    await component.toggleDbQueue();
    expect(setStatusSpy).toHaveBeenCalled();
    expect(openDialogSpy).not.toHaveBeenCalled();
  });

  it('could by toggling the JobQueue', async () => {
    getStatusSpy.and.returnValue(of(statusOkAndAllEnabled));
    await component.ngOnInit();

    await component.toggleJobQueue();
    expect(setStatusSpy).not.toHaveBeenCalled();
    expect(openDialogSpy).toHaveBeenCalled();
    /* const args = openDialogSpy.calls.argsFor(0);
    args[0].create(); */

    openDialogSpy.calls.reset();
    getStatusSpy.and.returnValue(of(statusOkAndAllDisabled));
    await component.ngOnInit();

    await component.toggleJobQueue();
    expect(setStatusSpy).toHaveBeenCalled();
    expect(openDialogSpy).not.toHaveBeenCalled();
  });

});
