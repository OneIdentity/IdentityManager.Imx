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
import { MatDialog } from '@angular/material/dialog';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';
import { of, Subject } from 'rxjs';

import { ClassloggerService, MessageDialogResult, SnackBarService, UserMessageService } from 'qbm';
import { QerApiService } from '../../qer-api-client.service';
import { ItshopPatternCreateService } from './itshop-pattern-create.service';

const commitSpy = jasmine.createSpy('Commit');

describe('ItshopPatternCreateService', () => {
  let service: ItshopPatternCreateService;

  const euiLoadingServiceStub = {
    hide: jasmine.createSpy('hide'),
    show: jasmine.createSpy('show')
  };

  const dialogStub = {
    open: jasmine.createSpy('open').and.returnValue({
      beforeClosed: () => of(MessageDialogResult.YesResult),
      afterClosed: () => of(MessageDialogResult.YesResult)
    })
  };

  const qerApiServiceStub = {
    typedClient: {
      PortalItshopPatternPrivate: {
        Post: jasmine.createSpy('Post').and.returnValue(Promise.resolve({ Data: [{}] }))
      }
    }
  }

  const sidesheetServiceStub = {
    open: jasmine.createSpy('open').and.returnValue({
      afterClosed: () => of({})
    })
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ClassloggerService,
          useValue: {
            debug: jasmine.createSpy('debug').and.callThrough(),
            trace: jasmine.createSpy('trace').and.callThrough()
          }
        },
        {
          provide: EuiLoadingService,
          useValue: euiLoadingServiceStub
        },
        {
          provide: EuiSidesheetService,
          useValue: sidesheetServiceStub
        },
        {
          provide: MatDialog,
          useValue: dialogStub
        },
        {
          provide: SnackBarService,
          useValue: {
            open: jasmine.createSpy('open')
          }
        },
        {
          provide: UserMessageService,
          useValue: {
            subject: new Subject()
          }
        },
        {
          provide: QerApiService,
          useValue: qerApiServiceStub
        }
      ]
    });
    service = TestBed.inject(ItshopPatternCreateService);
  });

  afterEach(() => {
    commitSpy.calls.reset();
  })

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
