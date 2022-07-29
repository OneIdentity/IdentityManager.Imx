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

import { Component, EventEmitter, Input, Output, ContentChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { EuiLoadingService } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';

import { StartComponent } from './start.component';
import { UserModelService } from '../../user/user-model.service';
import { UserConfig } from 'imx-api-qer';
import { SystemInfo } from 'imx-api-qbm';
import { SystemInfoService, clearStylesFromDOM, imx_SessionService, ExtService } from 'qbm';
import { ProjectConfigurationService } from '../../project-configuration/project-configuration.service';

@Component({
  selector: 'imx-ext',
  template: '<p>MockBulkPropertyEditorComponent</p>'
})
class MockExtComponent {
  @Input() public id: any;
  @Input() public referrer: any;
}

@Component({
  selector: 'imx-tile',
  template: '<p>MockTileComponent</p>'
})
class MockTileComponent {
  @Input() public caption: string;
  @Input() public value: string;
  @Input() public imageType: 'Url' | 'IconFont';
  @Input() public identifier: string;
  @Input() public image: String
  @Input() public size: 'Square' | 'Tile' | 'Addon-Tile' | 'Overview' | 'Dashboard' | 'Large-Overview';
  @Input() public highlight: boolean;
  @Input() public contentType: 'Text' | 'Image' | 'Container';
  @Output() public click: any = new EventEmitter<any>();
}

@Component({
  selector: 'imx-chart-tile',
  template: '<p>MockChartTileComponent</p>'
})
class MockChartTileComponent {
  @Input() public caption: string;
  @Input() public identifier: string;
  @Input() public chartType: string;
  @Input() public displayNameDialogDashboardDef: string;
  @Input() public useHistogramStyle: boolean;
  @Output() public click: any = new EventEmitter<any>();
}

@Component({
  selector: 'imx-notification-tile',
  template: '<p>MockNotificationTileComponent</p>'
})
class MockNotificationTileComponent {
}

@Component({
  selector: 'imx-badge-tile',
  template: '<p>MockNotificationTileComponent</p>'
})
class MockBadgeTileComponent {
  @Input() public caption: string;
  @Input() public value: string;
  @Input() public identifier: string;

  @Output() public actionClick: any = new EventEmitter<any>();;

}

@Component({
  selector: 'imx-icon-tile',
  template: '<p>MockNotificationTileComponent</p>'
})
class MockIconTileComponent {
  @Input() public image: string;
  @Input() public caption: string;
  @Input() public subtitle: string;
  @Input() public identifier: string;

  @ContentChild('ActionTemplate', { static: true }) public actionTemplate: any;
}

@Component({
  selector: 'imx-businessowner-chartsummary',
  template: '<p>MockBusinessownerChartsummaryComponent</p>'
})
class MockBusinessownerChartsummaryComponent {
}

describe('StartComponent', () => {
  let component: StartComponent;
  let fixture: ComponentFixture<StartComponent>;

  const navigateSpy = jasmine.createSpy('navigate');

  const mockUserModelService = new class {
    userConfig = {};
    getUserConfig = jasmine.createSpy('getUserConfig').and.callFake(() => Promise.resolve(this.userConfig));
    getPendingItems = jasmine.createSpy('getPendingItems').and.returnValue(Promise.resolve({}));

    reset() {
      this.userConfig = {};
      this.getUserConfig.calls.reset();
      this.getPendingItems.calls.reset();
    }
  }();

  const mockProjectConfigService = {
    getConfig: jasmine.createSpy('getConfig')
      .and
      .returnValue(Promise.resolve({
        GeneralSettings: {
          VI_Common_EnableNotifications: true
        },
        PasswordConfig: {}
      }))
  };

  let mockPreProps = [];

  const euiLoadingServiceStub = {
    hide: jasmine.createSpy('hide'),
    show: jasmine.createSpy('show')
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        StartComponent,
        MockChartTileComponent,
        MockExtComponent,
        MockTileComponent,
        MockNotificationTileComponent,
        MockBusinessownerChartsummaryComponent,
        MockBadgeTileComponent,
        MockIconTileComponent
      ],
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateFakeLoader
          }
        })
      ],
      providers: [
        {
          provide: Router,
          useClass: class {
            navigate = navigateSpy;
          }
        },
        {
          provide: UserModelService,
          useValue: mockUserModelService
        },
        {
          provide: SystemInfoService,
          useValue: {
            get: jasmine.createSpy('get').and.callFake(() => Promise.resolve({ PreProps: mockPreProps }))
          }
        },
        {
          provide: imx_SessionService,
          useValue: {
            getSessionState: jasmine.createSpy('getSessionState').and.callFake(() => Promise.resolve({ UserUid: "the-uid" }))
          }
        },
        {
          provide: ProjectConfigurationService,
          useValue: mockProjectConfigService
        },
        {
          provide: EuiLoadingService,
          useValue: euiLoadingServiceStub
        }, 
        {
          provide: ExtService,
          useValue: {
            register: () => { }
          }
        }
      ]
    });
  });

  beforeEach(() => {
    mockUserModelService.reset();
    euiLoadingServiceStub.hide.calls.reset();
    euiLoadingServiceStub.show.calls.reset();
    navigateSpy.calls.reset();
    mockProjectConfigService.getConfig.calls.reset();
    fixture = TestBed.createComponent(StartComponent);
    component = fixture.componentInstance;
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  [
    { showPasswordTile: false, hasPasswordAnswer: false },
    { showPasswordTile: false, hasPasswordAnswer: true },
    { showPasswordTile: true, hasPasswordAnswer: false },
    { showPasswordTile: true, hasPasswordAnswer: true }
  ].forEach(testcase =>
    it(`should init password tile caption correctly with showPasswordTile=${testcase.showPasswordTile} and hasPasswordAnswer=${testcase.hasPasswordAnswer}`, async () => {
      // Arrange
      mockUserModelService.userConfig = {
        ShowPasswordTile: testcase.showPasswordTile,
        HasPasswordAnswer: testcase.hasPasswordAnswer
      };

      // Act
      await component.ngOnInit();

      // Assert
      expect(component.viewReady).toBeTruthy();
    })
  );

  it('should navigate to DashboardOrganization page', () => {
    expect(() => {
      component.GoToDashboardOrganization();
    }).not.toThrowError();
  });

  it('should navigate to DashboardRequests page', () => {
    expect(() => {
      component.GoToDashboardRequests();
    }).not.toThrowError();
  });

  it('should navigate to ProductSelection page', () => {
    expect(() => {
      // Act
      component.GoToProductSelection();

      // Assert
      expect(navigateSpy).toHaveBeenCalledWith(['productselection']);
    }).not.toThrowError();
  });


  it('should navigate to ItShopApprovals page', () => {
    expect(() => {
      // Act
      component.GoToItshopApprovals();

      // Assert
      expect(navigateSpy).toHaveBeenCalledWith(['itshop', 'approvals']);
    }).not.toThrowError();
  });

  it('should navigate to ApprovalInquiries page', () => {
    expect(() => {
      // Act
      component.GoToItShopApprovalInquiries();

      // Assert
      expect(navigateSpy).toHaveBeenCalledWith(['itshop', 'answerquestions']);
    }).not.toThrowError();
  });

  it('should navigate to MyPassword page', () => {
    expect(() => {
      // Act
      component.GoToMyPassword();

      // Assert
      expect(navigateSpy).toHaveBeenCalledWith(['profile', 'profile-password-questions']);
    }).not.toThrowError();
  });

  it('should navigate to shopping cart', () => {
    expect(() => {
      // Act
      component.GoToShoppingCart();

      // Assert
      expect(navigateSpy).toHaveBeenCalledWith(['shoppingcart']);
    }).not.toThrowError();
  });

  it('should navigate to MyProcesses page', () => {
    expect(() => {
      // Act
      component.GoToMyProcesses();

      // Assert
      expect(navigateSpy).toHaveBeenCalledWith(['/QBM_MyProcesses'], {});
    }).not.toThrowError();
  });


  it('should navigate to DashboardEmployeesByRiskIndex page', () => {
    expect(() => {
      component.GoToDashboardEmployeesByRiskIndex();
    }).not.toThrowError();
  });

  for (const testcase of [
    { description: "", requestsEndingSoon: 42 },
    { description: "or not", requestsEndingSoon: 42 }
  ]) {
    it(`should show ShowRequestsEndingSoon ${testcase.description}`, async () => {
      // Arrange
      mockUserModelService.userConfig = {
        CountRequestsEndingSoon: testcase.requestsEndingSoon,
        IsITShopEnabled: true
      };

      await component.ngOnInit();

      fixture.detectChanges();

      // Assert
      const elements = fixture.debugElement.queryAll(By.css('imx-badge-tile[data-imx-identifier=start-tile-request-ending-soon]'));
      expect(elements.length).toEqual(testcase.requestsEndingSoon > 0 ? 1 : 0);
    });
  }

  it('should show password tile or not', () => {
    // Arrange
    component.userConfig = { ShowPasswordTile: true } as UserConfig;

    // Act & Assert
    expect(component.ShowPasswordTile()).toBeTruthy();
  });

  it('should returned the correct pending items infos', () => {
    // Arrange
    component.pendingItems = {
      CountProductsInShoppingCart: 999,
      OpenPWO: 999,
      OpenInquiries: 999,
      NewProcesses: 999
    };

    // Act & Assert
    expect(component.GetCountProductsinShoppingCart()).toBe(999);
    expect(component.GetCountPendingRequests()).toBe(999);
    expect(component.GetCountRequestInquiries()).toBe(999);
    expect(component.GetCountNewProcesses()).toBe(0); // hidden for now
  });

  it('should check config for the url to the PasswordWeb', () => {

    // Act & Assert
    expect(component.ShowPasswordLink()).toBeTruthy();
  });

  it('should check systeminfo for itshop preprop', () => {

    component.userUid = "the-user";
    component.systemInfo = { PreProps: ['ITSHOP'] } as SystemInfo;
    component.userConfig = { IsITShopEnabled: true } as UserConfig;

    // Act & Assert
    expect(component.ShowNewRequestLink()).toBeTruthy();
  });

});
