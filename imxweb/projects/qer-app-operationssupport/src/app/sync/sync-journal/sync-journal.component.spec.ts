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
import { ActivatedRoute } from '@angular/router';
import { configureTestSuite } from 'ng-bullet';

import { SyncJournalComponent } from './sync-journal.component';
import { clearStylesFromDOM, ElementalUiConfigService, SettingsService } from 'qbm';
import { EuiLoadingService } from '@elemental-ui/core';
import { OpsupportSyncJournal, OpsupportSyncShell } from 'imx-api-dpr';
import { SyncSummaryService } from './sync-summary.service';
import { SyncService } from '../sync.service';

describe('SyncJournalComponent', () => {
  let component: SyncJournalComponent;
  let fixture: ComponentFixture<SyncJournalComponent>;


  const uidSyncShell = 'uid';
  const filter = [
    {
      ColumnName: 'someColumnName',
      Type: 0,
      CompareOp: 1,
      Value1: 'someValue'
    }
  ];

  const loadSpy = jasmine.createSpy('getSyncJournal').and.returnValue(Promise.resolve({ Data: [], TotalCount: 0 }));

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        SyncJournalComponent
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: jasmine.createSpy('get').and.returnValue(uidSyncShell)
              },
              queryParamMap: {
                get: jasmine.createSpy('get').and.returnValue(JSON.stringify(filter))
              }
            }
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
        },
        {
          provide: SyncSummaryService,
          useValue: {
            get: jasmine.createSpy('get').and.returnValue(Promise.resolve({ Data: [], TotalCount: 0 })),
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
          provide: ElementalUiConfigService,
          useValue: {
            Config: jasmine.createSpy('Config').and.returnValue({ downloadOptions: {} })
          }
        },
        {
          provide: SettingsService,
          useValue:{DefaultPageSize: 25}
        }
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ]
    });
  });

  beforeEach(() => {
    loadSpy.calls.reset();
    fixture = TestBed.createComponent(SyncJournalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('can refresh the data', () => {
    component.refresh();
    expect(loadSpy).toHaveBeenCalledWith({ StartIndex: 0, PageSize: 25 });
  });
});
