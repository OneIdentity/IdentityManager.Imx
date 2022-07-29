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


import { Component, Input, Output } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { EuiCoreModule, EuiLoadingService } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';
import { Subject } from 'rxjs';

import { AutoCompleteModule, clearStylesFromDOM } from 'qbm';
import { PortalApplication } from 'imx-api-aob';

import { ApplicationNavigationComponent } from './application-navigation.component';
import { ApplicationsService } from '../applications.service';
import { UserModelService } from 'qer';

@Component({
  selector: 'imx-data-source-toolbar',
  template: '<p>MockDataSourceToolbarComponent</p>'
})
class MockDataSourceToolbarComponent {
  @Input() public entitySchema: any;
  @Input() public settings: any;
  @Input() public hiddenElements: any;
  @Input() public hideCustomToolbar: any;
  @Input() itemStatus: any;
}

@Component({
  selector: 'imx-data-tiles',
  template: '<p>MockDataTilesComponent</p>'
})
class MockDataTilesComponent {
  @Input() public dst: any;
  @Input() public selectable: any;
  @Input() public titleObject: any;
  @Input() public subtitleObject: any;
  @Input() public contentTemplate: any;
  @Input() public status: any;
  @Input() public multiSelect: any;
  @Input() public image: any;
  @Input() public actions: any;
  @Output() public actionSelected: any;
}

@Component({
  selector: 'imx-data-source-paginator',
  template: '<p>MockDataSourcePaginatorComponent</p>'
})
class MockDataSourcePaginatorComponent {
  @Input() public dst: any;
}

describe('ApplicationNavigationComponent', () => {
  let component: ApplicationNavigationComponent;
  let fixture: ComponentFixture<ApplicationNavigationComponent>;
  const mockAppService = {
    get: jasmine.createSpy('get'),
    onStateChanged: new Subject<any>()
  };

  const euiLoadingServiceStub = {
    hide: jasmine.createSpy('hide'),
    show: jasmine.createSpy('show')
  };

  const mockRouter = {
    navigate: jasmine.createSpy('navigate')
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [
        AutoCompleteModule,
        EuiCoreModule,
        FormsModule,
        LoggerTestingModule,
        MatAutocompleteModule,
        MatCheckboxModule,
        MatInputModule,
        OverlayModule,
        PortalModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateFakeLoader
          }
        })
      ],
      declarations: [
        ApplicationNavigationComponent,
        MockDataTilesComponent,
        MockDataSourceToolbarComponent,
        MockDataSourcePaginatorComponent
      ],
      providers: [
        {
          provide: UserModelService,
          useValue: {
            getGroups: ()=>[{Name:'AOB_4_AOB_Admin'}]
          }
        },
        {
          provide: Router,
          useValue: mockRouter
        },
        {
          provide: ApplicationsService,
          useValue: mockAppService
        },
        {
          provide: EuiLoadingService,
          useValue: euiLoadingServiceStub
        }
      ]
    });
  });

  beforeEach(waitForAsync(() => {
    mockAppService.get.calls.reset();
    euiLoadingServiceStub.hide.calls.reset();
    euiLoadingServiceStub.show.calls.reset();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationNavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  function BuildAobApplication(display: string, hasKpi?:boolean): PortalApplication {
      return {
        Description: {
          value: "entitlement Description",
          Column: { GetDisplayValue: (_) => 'some other description' }
        },
        UID_AERoleOwner: {
          value: "uid",
          Column: { GetDisplayValue: (_) => 'AERoleOwner' }
        },
        HasKpiIssues: {
          value: hasKpi,
          Column: { GetDisplayValue: (_) => 'HasKpiIssues' }
        },
        GetEntity: () => ({ GetDisplay: () => display })
      } as PortalApplication;
  }

});
