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

import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { configureTestSuite } from 'ng-bullet';

import { clearStylesFromDOM } from 'qbm';
import { UserService } from '../user/user.service';
import { DashboardComponent } from './dashboard.component';

@Component({
  selector: 'imx-object-search',
  template: '<p>MockObjectSearchComponent</p>'
})
class MockObjectSearchComponent {}

@Component({
  selector: 'imx-notifications',
  template: '<p>MockNotificationsComponent</p>'
})
class MockNotificationsComponent {}

@Component({
  selector: 'imx-service-issues',
  template: '<p>MockServiceIssuesComponent</p>'
})
class MockServiceIssuesComponent {}

@Component({
  selector: 'imx-service-report',
  template: '<p>MockServiceReportComponent</p>'
})
class MockServiceReportComponent {}

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        DashboardComponent,
        MockObjectSearchComponent,
        MockNotificationsComponent,
        MockServiceIssuesComponent,
        MockServiceReportComponent
      ],
      providers: [
        {
          provide: UserService,
          useValue: {
            getGroups: jasmine.createSpy('getGroups').and.returnValue({
              Uid: 'QER_4_OperationsSupport',
              Name: 'QER_4_OperationsSupport'
            })
          }
        }
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardComponent);
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
