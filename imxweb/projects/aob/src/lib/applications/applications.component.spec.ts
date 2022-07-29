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

import { ErrorHandler, EventEmitter } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { EuiCoreModule, EuiLoadingService } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { TranslateModule } from '@ngx-translate/core';
import { RouterTestingModule } from '@angular/router/testing';
import { Subject } from 'rxjs';

import { ApplicationsComponent } from './applications.component';
import { ApplicationsService } from './applications.service';
import { AutoCompleteModule, clearStylesFromDOM } from 'qbm';
import { PortalApplicationNew, PortalApplication } from 'imx-api-aob';
import { TypedEntityCollectionData } from 'imx-qbm-dbts';
import { ApplicationDetailComponent } from './application-detail.component';
import { EditApplicationComponent } from './edit-application/edit-application.component';
import { ApplicationNavigationComponent } from './application-navigation/application-navigation.component';
import { UserModelService } from 'qer';

describe('ApplicationsComponent', () => {
  let component: ApplicationsComponent;
  let fixture: ComponentFixture<ApplicationsComponent>;

  const mockRouter = {
    navigate: jasmine.createSpy('navigate')
  };

  const activatedRouteStub = {
    queryParams: new Subject<Params>()
  };

  const findApplicationResult = {
    UID_AOBApplication: { value: '0' }
  };

  const mockApplicationsService = {
    reload: jasmine.createSpy('reload').and.callFake((id) => Promise.resolve(
      id === findApplicationResult.UID_AOBApplication.value ? findApplicationResult : undefined
    )),
    onApplicationCreated: new Subject<PortalApplicationNew>(),
    onApplicationDeleted: new Subject<PortalApplicationNew>()
  };

  const euiLoadingServiceStub = {
    hide: jasmine.createSpy('hide'),
    show: jasmine.createSpy('show')
  };

  function getAppNav() {
    return {
      clearSelection: (_) => { },
      applicationSelected: new EventEmitter<string>(),
      dataSourceChanged: new EventEmitter<any>()
    } as ApplicationNavigationComponent;
  }

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [
        AutoCompleteModule,
        EuiCoreModule,
        LoggerTestingModule,
        MatAutocompleteModule,
        MatCardModule,
        MatBadgeModule,
        ReactiveFormsModule,
        RouterTestingModule.withRoutes([
          {
            path: 'edit',
            component: class { application: any },
            outlet: 'content'
          },
        ]),
        TranslateModule.forRoot()
      ],
      declarations: [
        ApplicationsComponent
      ],
      providers: [
        {
          provide: Router,
          useValue: mockRouter
        },
        {
          provide: ApplicationsService,
          useValue: mockApplicationsService
        },
        {
          provide: ActivatedRoute,
          useValue: activatedRouteStub
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
          provide: ErrorHandler,
          useValue: { handleError: _ => { } } // Don't litter the test log with error messages
        }
      ]
    });
  });

  beforeEach(waitForAsync(() => {
    mockRouter.navigate.calls.reset();
    mockApplicationsService.reload.calls.reset();
    euiLoadingServiceStub.hide.calls.reset();
    euiLoadingServiceStub.show.calls.reset();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationsComponent);
    component = fixture.componentInstance;
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  [
    { applicationContent: {} as ApplicationDetailComponent, id: findApplicationResult.UID_AOBApplication.value, expectedApp: findApplicationResult },
    { applicationContent: {} as ApplicationDetailComponent, id: undefined, expectedApp: undefined },
    { applicationContent: {} as EditApplicationComponent, id: findApplicationResult.UID_AOBApplication.value, expectedApp: findApplicationResult },
    { applicationContent: {} as EditApplicationComponent, id: undefined, expectedApp: undefined }
  ].forEach(testcase =>
    xit('should load the application with queryParams.id', fakeAsync(() => {

      component.onActivateNavigationOutlet(getAppNav());

      component.onActivateContentOutlet(testcase.applicationContent);

      activatedRouteStub.queryParams.next({ id: testcase.id });
      tick();

      expect(mockApplicationsService.reload).toHaveBeenCalledWith(
        testcase.id
      );

      expect(component['selectedApplication']).toEqual(testcase.expectedApp as PortalApplication);
    })));

  it('onActivateContentOutlet does not set the dataSource', fakeAsync(() => {
    component.onActivateNavigationOutlet(getAppNav());

    component.onActivateContentOutlet({} as ApplicationDetailComponent);

    activatedRouteStub.queryParams.next({});
    tick();

    expect(component['dataSource']).toBeUndefined();
  }));

  [
    { appSelected: '0' },
    { appSelected: undefined }
  ].forEach(testcase =>
    it('onActivateNavigationOutlet applicationSelected', fakeAsync(() => {
      component.onActivateContentOutlet({} as ApplicationDetailComponent);

      const appNav = getAppNav();
      component.onActivateNavigationOutlet(appNav);
      appNav.applicationSelected.next(testcase.appSelected);

      tick();

      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['applications', { outlets: { content: ['detail'] } }],
        testcase.appSelected ? { queryParams: { id: testcase.appSelected } } : undefined
      );
    })));

  [
    { data: { totalCount: 1, Data: [{}] } },
    { data: { totalCount: 0, Data: [] } },
    { data: undefined }
  ].forEach(testcase =>
    it('onActivateNavigationOutlet onDataChange', fakeAsync(() => {
      component.onActivateContentOutlet({} as ApplicationDetailComponent);

      const appNav = getAppNav();
      component.onActivateNavigationOutlet(appNav);

      appNav.dataSourceChanged.emit({ dataSource: testcase.data as TypedEntityCollectionData<PortalApplication> });

      tick();

      if (testcase.data) {
        expect(component['dataSource'].totalCount).toEqual(testcase.data.totalCount);
      } else {
        expect(component['dataSource']).toBeUndefined();
      }
    })));

  // TODO: Create Unit test for creating new application
  // it('should create a new application', async () => {
  // });
});
