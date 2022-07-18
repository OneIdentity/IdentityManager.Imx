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

import { Pipe, PipeTransform, Component, Input } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { EuiCoreModule, EuiLoadingService } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { TranslateModule } from '@ngx-translate/core';

import { StartPageComponent } from './start-page.component';
import { ApplicationsService } from '../applications/applications.service';
import { UserModelService } from 'qer';
import { AuthenticationService } from 'qbm';
import { of } from 'rxjs';
import { ImageService } from '../images/image.service';

@Pipe({ name: 'ldsReplace' })
class MockLdsReplacePipe implements PipeTransform {
  transform(value: any, ..._: any[]): any { return value; }
}

@Component({
  selector: 'imx-global-kpi',
  template: '<p>MockGlobalKpiComponent</p>'
})
class MockGlobalKpiComponent {
  @Input() public application: any;
}

describe('StartPageComponent', () => {
  let component: StartPageComponent;
  let fixture: ComponentFixture<StartPageComponent>;

  let applications = [];
  const mockRouter = {
    navigate: jasmine.createSpy('navigate')
  };

  const euiLoadingServiceStub = {
    hide: jasmine.createSpy('hide'),
    show: jasmine.createSpy('show')
  };

  const mockAuthService = {
    onSessionResponse: of({Username: 'userName'})
  }

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        MockLdsReplacePipe,
        MockGlobalKpiComponent,
        StartPageComponent
      ],
      imports: [
        EuiCoreModule,
        LoggerTestingModule,
        TranslateModule.forRoot({}),
        MatCardModule,
        MatIconModule,
        RouterModule
      ],
      providers: [
        {
          provide: ApplicationsService,
          useValue: {
            get: jasmine.createSpy('Get').and.callFake(() => Promise.resolve({ totalCount: applications.length }))
          }
        },
        {
          provide: Router,
          useValue: mockRouter
        },
        {
          provide: EuiLoadingService,
          useValue: euiLoadingServiceStub
        },
        {
          provide: UserModelService,
          useValue: {
            getGroups: ()=>[{Name:'AOB_4_AOB_Admin'}]
          }
        },
        {
          provide: AuthenticationService,
          useValue: mockAuthService
        },
        {
          provide: ImageService,
          useValue: {
            getPersonImageUrl:jasmine.createSpy('getPersonImageUrl').and.returnValue(Promise.resolve(null))
          }
        }
      ]
    });
  });

  beforeEach(waitForAsync(() => {
    applications = [];
    mockRouter.navigate.calls.reset();
    euiLoadingServiceStub.hide.calls.reset();
    euiLoadingServiceStub.show.calls.reset();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StartPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  [
    { description: 'without applications', applications: [] },
    { description: '', applications: [{}, {}, {}, {}] }
  ].forEach(testcase => {
    // TODO #227277 fix unittests after update on Angular V9
    xit(`inits application values ${testcase.description}`, fakeAsync(() => {
      applications = testcase.applications;
      fixture.detectChanges();
      tick();
      expect(component.numberOfApplications).toBe(testcase.applications.length);
    }));
  });
});
