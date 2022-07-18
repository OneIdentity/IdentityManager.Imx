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
import { configureTestSuite } from 'ng-bullet';

import { WebApplicationsComponent } from './web-applications.component';
import { WebApplicationsService } from './web-applications.service';
import { clearStylesFromDOM, SettingsService } from 'qbm';
import { EuiLoadingService } from '@elemental-ui/core';
import { OpsupportWebapplications } from 'imx-api-qbm';

describe('WebApplicationsComponent', () => {
  let component: WebApplicationsComponent;
  let fixture: ComponentFixture<WebApplicationsComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        WebApplicationsComponent
      ],
      providers: [
        {
          provide: WebApplicationsService,
          useValue: {
            schema: OpsupportWebapplications.GetEntitySchema(),
            get: jasmine.createSpy('get').and.returnValue(Promise.resolve({Data: [], TotalCount: 0}))
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
          provide: SettingsService,
          useValue:{DefaultPageSize: 25}
        }
      ],
      schemas: [
        NO_ERRORS_SCHEMA
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WebApplicationsComponent);
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
