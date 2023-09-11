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

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobServersEditComponent } from './job-servers-edit.component';
import { EuiLoadingService, EuiSidesheetService, EUI_SIDESHEET_DATA, EuiSidesheetRef } from '@elemental-ui/core';
import { of } from 'rxjs';
import { OpsupportJobservers } from 'imx-api-qbm';
import { JobServersService } from '../job-servers.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SnackBarService } from '../../../../../qbm/src/lib/snackbar/snack-bar.service';
import { ConfirmationService } from 'qbm';
describe('JobServersEditComponent', () => {
  let component: JobServersEditComponent;
  let fixture: ComponentFixture<JobServersEditComponent>;

  const mockBusyService = { show: jasmine.createSpy('show'), hide: jasmine.createSpy('hide') };
  const sidesheet = {
    open: jasmine.createSpy('open').and.returnValue({
      afterClosed: () => of({}),
    }),
  };
  const matSnackBarStub = {
    open: jasmine.createSpy('open'),
    dismiss: jasmine.createSpy('dismiss'),
  };
   let confirm = true;
   const mockConfirmationService = {
     confirm: jasmine.createSpy('confirm').and.callFake(() => Promise.resolve(confirm)),
   };
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [JobServersEditComponent],
      imports: [MatSnackBarModule],
      providers: [
        {
          provide: MatSnackBar,
          useValue: matSnackBarStub,
        },
        {
          provide: SnackBarService,
          useValue: {
            open: jasmine.createSpy('open'),
          },
        },
        {
          provide: EuiSidesheetService,
          useValue: sidesheet,
        },
        {
          provide: EuiLoadingService,
          useValue: mockBusyService,
        },
        {
          provide: EUI_SIDESHEET_DATA,
          useValue: { properties: [] },
        },
        {
          provide: EuiSidesheetRef,
          useValue: {
            close: jasmine.createSpy('close'),
            closeClicked: jasmine.createSpy('closeClicked').and.returnValue(of(undefined)),
          },
        },
        {
          provide: ConfirmationService,
          useValue: mockConfirmationService,
        },
        {
          provide: JobServersService,
          useValue: {
            OpsupportJobserversSchema: OpsupportJobservers.GetEntitySchema(),
          },
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobServersEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
