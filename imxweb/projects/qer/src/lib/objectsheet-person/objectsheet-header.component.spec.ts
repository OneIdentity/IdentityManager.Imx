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
import { ActivatedRoute } from '@angular/router';
import { EuiCoreModule, EuiLoadingService } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';

import { ObjectsheetHeaderComponent } from './objectsheet-header.component';
import { ObjectsheetPersonService } from './objectsheet-person.service';

describe('ObjectsheetHeaderComponent', () => {
  let component: ObjectsheetHeaderComponent;
  let fixture: ComponentFixture<ObjectsheetHeaderComponent>;

  const activatedRouteStub = {
    snapshot: {
      params: jasmine.createSpy('params').and.callFake((key: string) => key)
    }
  };
  
  const euiLoadingServiceStub = {
    hide: jasmine.createSpy('hide'),
    show: jasmine.createSpy('show')
  };

  const goBackToObjectSheetSpy = jasmine.createSpy('goBackToObjectSheet');

  const objectsheetPersonServiceStub = {
    getPerson: jasmine.createSpy('getPerson'),
    goBackToObjectSheet: goBackToObjectSheetSpy
  }

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        ObjectsheetHeaderComponent
      ],
      imports: [
        EuiCoreModule
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: activatedRouteStub
        },
        {
          provide: EuiLoadingService,
          useValue: euiLoadingServiceStub
        },
        {
          provide: ObjectsheetPersonService,
          useValue: objectsheetPersonServiceStub
        }
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ObjectsheetHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
