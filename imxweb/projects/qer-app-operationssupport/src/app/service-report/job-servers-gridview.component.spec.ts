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
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { configureTestSuite } from 'ng-bullet';

import { JobServersGridviewComponent } from './job-servers-gridview.component';
import { JobServersService } from './job-servers.service';
import { TranslationProviderServiceSpy } from '../test-utilities/imx-translation-provider.service.spy.spec';
import { ImxTranslationProviderService, clearStylesFromDOM } from 'qbm';
import { OpsupportJobservers } from 'imx-api-qbm';
import { EuiLoadingService } from '@elemental-ui/core';

describe('JobServersGridviewComponent', () => {
  let component: JobServersGridviewComponent;
  let fixture: ComponentFixture<JobServersGridviewComponent>;
  const translationProviderSpy = new TranslationProviderServiceSpy();

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        JobServersGridviewComponent
      ],
      providers: [
        {
          provide: ImxTranslationProviderService,
          useValue: translationProviderSpy
        },
        {
          provide: EuiLoadingService,
          useValue: {
            hide: jasmine.createSpy('hide'),
            show: jasmine.createSpy('show')
          }
        },
        {
          provide: JobServersService,
          useValue: {
            OpsupportJobserversSchema: OpsupportJobservers.GetEntitySchema()
          }
        }
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobServersGridviewComponent);
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
