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
 * Copyright 2021 One Identity LLC.
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

import { Input, Output, EventEmitter, Component } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';

import { OwnershipInformation, PortalPersonReportsInteractive } from 'imx-api-qer';
import { clearStylesFromDOM } from 'qbm';
import { BusinessOwnerChartSummaryComponent } from './businessowner-chartsummary.component';
import { UserModelService } from '../../user/user-model.service';
import { QerApiService } from '../../qer-api-client.service';
import { of } from 'rxjs';
import { ProjectConfigurationService } from '../../project-configuration/project-configuration.service';
import { QerPermissionsService } from '../../admin/qer-permissions.service';
import { IdentitiesService } from '../../identities/identities.service';
import { IdentitiesCommonTestData } from '../../identities/test/common-test-mocks.spec';

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

describe('BusinessOwnerChartSummaryComponent', () => {
  let component: BusinessOwnerChartSummaryComponent;
  let fixture: ComponentFixture<BusinessOwnerChartSummaryComponent>;

  const mockData = [{}, {}, {}];

  const mockUserModelService = {
    getDirectReports: jasmine.createSpy('Get').and.returnValue(Promise.resolve(mockData)),
    getUserConfig: jasmine.createSpy('getUserConfig').and.returnValue(Promise.resolve(
      {
        Ownerships: [{}]
      })),
    getGroups: jasmine.createSpy('getGroups').and.returnValue(Promise.resolve([{ Name: 'VI_4_ALLMANAGER' }]))
  };

  const mockRouter = {
    navigate: jasmine.createSpy('navigate')
  };


  const euiLoadingServiceStub = {
    hide: jasmine.createSpy('hide'),
    show: jasmine.createSpy('show')
  };

  const mockConfigService: any = {
    getConfig: () => {
      return Promise.resolve({
        PersonConfig: {
          VI_MyData_WhitePages_ResultAttributes: {
            Columns: ['col1', 'col2']
          },
          VI_MyData_WhitePages_DetailAttributes: {
            Columns: ['col1', 'col2']
          }
        }
      });
    }
  };

  const personReportInteractive = {
    GetEntity: () => IdentitiesCommonTestData.mockEntity,
    DefaultEmailAddress: { Column: IdentitiesCommonTestData.mockEntityColumn },
    UID_PersonHead: { Column: IdentitiesCommonTestData.mockEntityColumn },
    IsInActive: { Column: IdentitiesCommonTestData.mockEntityColumn },
  } as PortalPersonReportsInteractive;

  const sideSheetTestHelper = new class {
    afterClosedResult = false;
    readonly servicestub = {
      open: jasmine.createSpy('open').and.returnValue({
        afterClosed: () => of(this.afterClosedResult)
      })
    };

    reset() {
      this.afterClosedResult = false;
    }
  }();

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        BusinessOwnerChartSummaryComponent,
        MockTileComponent
      ],
      providers: [
        {
          provide: Router,
          useValue: mockRouter
        },
        {
          provide: EuiLoadingService,
          useValue: euiLoadingServiceStub
        },
        {
          provide: ProjectConfigurationService,
          useValue: mockConfigService,
        },
        {
          provide: IdentitiesService,
          useValue: {
            createEmptyEntity: jasmine.createSpy('createEmptyEntity').and.returnValue(Promise.resolve(
              personReportInteractive              
            )),
          }
        },
        {
          provide: QerApiService,
          useValue: {
            typedClient: {
              PortalPersonReports: {
                Get: jasmine.createSpy('Get').and.returnValue(Promise.resolve({
                  totalCount: mockData.length,
                  Data: mockData
                }))
              },
            }
          }
        },
        {
          provide: EuiSidesheetService,
          useValue: sideSheetTestHelper.servicestub
        },
        {
          provide: QerPermissionsService,
          useValue: {
            isPersonManager: jasmine.createSpy('isPersonManager').and.returnValue(Promise.resolve(true))
          }
        },
        {
          provide: UserModelService,
          useValue: mockUserModelService
        }
      ]
    });
  });

  beforeEach(waitForAsync(() => {
    mockRouter.navigate.calls.reset();
    euiLoadingServiceStub.hide.calls.reset();
    euiLoadingServiceStub.show.calls.reset();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BusinessOwnerChartSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  
  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initially correctly', async () => {
    // Arrange
    expect(component.viewReady).toBeFalsy();

    // Act
    await component.ngOnInit();

    // Assert
    expect(component.ownerships.length).toBe(1);
    expect(component.viewReady).toBeTruthy();
  });

  it('should navigate to the ownerShip page for the selected entity', () => {
    expect(() => {
      component.openOwnership({ TableName: 'Person'} as OwnershipInformation);
    }).not.toThrowError();
  });

});
