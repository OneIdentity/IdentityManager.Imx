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

import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatTabsModule } from '@angular/material/tabs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { EuiCoreModule } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';
import { LoggerTestingModule } from 'ngx-logger/testing';

import { ApplicationDetailComponent } from './application-detail.component';
import { PortalApplication } from 'imx-api-aob';
import { ShopsService } from '../shops/shops.service';
import { clearStylesFromDOM } from 'qbm';
import { ApplicationsService } from './applications.service';
import { UserModelService } from 'qer';

const entitlementDataSpy = jasmine.createSpy('getData');

@Component({
  selector: 'imx-entitlements',
  template: '<p>Mock Entitlements Component</p>'
})

class MockEntitlementsComponent {
  @Input() public application: any;
  getData = entitlementDataSpy;
}

@Component({
  selector: 'imx-application-hyperview',
  template: '<p>Mock Hyperview component</p>'
})

class MocHyperviewComponent {
  @Input() public uidApplication: any;
}

@Component({
  selector: 'imx-kpi-overview',
  template: '<p>MockKpiComponent</p>'
})
class MockKpiComponent {
  @Input() public application: any;
}

@Component({
  selector: 'imx-application-details',
  template: '<p>MockApplicationDetailsComponent</p>'
})
class MockApplicationDetailsComponent {
  @Input() public application: any;
}

describe('ApplicationDetailComponent', () => {
  let component: ApplicationDetailComponent;
  let fixture: ComponentFixture<ApplicationDetailComponent>;

  function createAobApplicationMock(image: string = ''): PortalApplication {
    return {
      UID_AOBApplication: {
        value: 'abc',
        Column: { GetDisplayValue: (_) => 'UID' }
      },
      Description: {
        value: "entitlement Description",
        Column: { GetDisplayValue: (_) => 'some other description' }
      },
      JPegPhoto: {
        value: image
      },
      UID_PersonHead: {
        value: "uid",
        Column: { GetDisplayValue: (_) => 'UID_PersonHead' }
      },
      IsInActive: {
        value: false
      },
      ActivationDate: {
        value: null,
        GetMetadata: (_) => { return { CanEdit: () => true } }
      },
      GetEntity: () => ({ GetDisplay: () => 'some other' })
    } as PortalApplication;
  }

  const mockShopsService = {
    getApplicationInShop: jasmine.createSpy('getApplicationInShop').and.returnValue(Promise.resolve({ totalCount: 1 }))
  };

  const applicationsServiceStub = {
    reload: jasmine.createSpy('reload').and.callFake(app => app)
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        ApplicationDetailComponent,
        MockApplicationDetailsComponent,
        MockEntitlementsComponent,
        MockKpiComponent,
        MocHyperviewComponent
      ],
      imports: [
        EuiCoreModule,
        LoggerTestingModule,
        MatTabsModule,
        NoopAnimationsModule,
        RouterTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateFakeLoader
          }
        })
      ],
      providers: [
        {
          provide: ShopsService,
          useValue: mockShopsService
        },
        {
          provide: ApplicationsService,
          useValue: applicationsServiceStub
        },
        {
          provide: UserModelService,
          useValue: {
            getGroups: ()=>[{Name:'AOB_4_AOB_Admin'}]
          }
        }
      ]
    });
  });

  beforeEach(waitForAsync(() => {
    mockShopsService.getApplicationInShop.calls.reset();
  }));

  beforeEach(() => {
    const aobApplicationMock = createAobApplicationMock() as PortalApplication;
    fixture = TestBed.createComponent(ApplicationDetailComponent);
    component = fixture.componentInstance;
    component.application = aobApplicationMock;
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  [
    { description: 'empty image', image: '', expect: { hasImage: false, data: '' } },
    { description: 'image', image: '5642', expect: { hasImage: true, data: 'data:image/png;base64,5642' } },
  ].forEach(testcase =>
    it(`can handle an image with ${testcase.description}`, () => {
      const aobApplicationMock = createAobApplicationMock(testcase.image) as PortalApplication;
      expect(component.getImageUrl(aobApplicationMock)).toBe(testcase.expect.data);
    }));
});
