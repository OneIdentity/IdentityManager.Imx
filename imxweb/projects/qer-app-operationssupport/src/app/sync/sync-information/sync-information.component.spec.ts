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

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { configureTestSuite } from 'ng-bullet';

import { SyncInformationComponent } from './sync-information.component';
import { clearStylesFromDOM } from 'qbm';
import { EuiLoadingService } from '@elemental-ui/core';
import { OpsupportSyncJournal, OpsupportSyncShell } from 'imx-api-dpr';
import { RoutingMock } from '../../test-utilities/router-mock.spec';
import { SyncService } from '../sync.service';

describe('SyncInformationComponent', () => {
  let component: SyncInformationComponent;
  let fixture: ComponentFixture<SyncInformationComponent>;
 
  const loadSpy = jasmine.createSpy('getSyncJournal').and.returnValue(Promise.resolve({ Data: [], TotalCount: 0 }));

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        SyncInformationComponent
      ],
      providers: [
        {
          provide: Router,
          useValue: new RoutingMock()
        },
        {
          provide: EuiLoadingService,
          useValue: {
            hide: jasmine.createSpy('hide'),
            show: jasmine.createSpy('show')
          }
        },
        {
          provide: SyncService,
          useValue: {
            getSyncShell: jasmine.createSpy('getSyncShell').and.returnValue(Promise.resolve({ Data: [], TotalCount: 0 })),
            getSyncJournal: loadSpy,
            syncShellSchema: OpsupportSyncShell.GetEntitySchema(),
            syncJournalSchema: OpsupportSyncJournal.GetEntitySchema(),
            GetDisplayName: jasmine.createSpy('GetDisplayName').and.returnValue(Promise.resolve('theDisplay'))
          }
        }
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ]
    });
  });

  beforeEach(() => {
    loadSpy.calls.reset();
    fixture = TestBed.createComponent(SyncInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });
});
