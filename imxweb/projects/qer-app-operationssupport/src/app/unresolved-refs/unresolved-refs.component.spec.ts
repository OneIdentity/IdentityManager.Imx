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

import { clearStylesFromDOM } from 'qbm';
import { UnresolvedRefsComponent } from './unresolved-refs.component';
import { UnresolvedRefsService } from './unresolved-refs.service';
import { EuiLoadingService } from '@elemental-ui/core';
import { OpsupportSyncDatastore } from 'imx-api-dpr';


describe('UnresolvedRefsComponent', () => {
  let component: UnresolvedRefsComponent;
  let fixture: ComponentFixture<UnresolvedRefsComponent>;

  const itemProviderSpy = jasmine.createSpy('get').and.returnValue(Promise.resolve({data: [], totalCount:0}));

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        UnresolvedRefsComponent
      ],
      providers: [
        {
          provide: UnresolvedRefsService, useValue: {
            schema: OpsupportSyncDatastore.GetEntitySchema(),
            get: itemProviderSpy
          }
        },
        {
          provide: EuiLoadingService,
          useValue: {
            hide: jasmine.createSpy('hide'),
            show: jasmine.createSpy('show')
          }
        }
      ],
      schemas: [
        NO_ERRORS_SCHEMA
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UnresolvedRefsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('could be initialized by angular', () => {
    expect(() => {
      component.ngOnInit();
    }).not.toThrowError();
  });

  it('could refresh', async () => {
    await component.refresh();
    expect(itemProviderSpy).toHaveBeenCalled();
  });
});
