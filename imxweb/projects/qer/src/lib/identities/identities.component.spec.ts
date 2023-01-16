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

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { of, Subject } from 'rxjs';
import { EuiSidesheetService } from '@elemental-ui/core';
import { ActivatedRoute } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { AppConfigService, AuthenticationService, CdrModule, clearStylesFromDOM, ElementalUiConfigService, ExtService, ISessionState } from 'qbm';
import { DataExplorerIdentitiesComponent } from './identities.component';
import { IdentitiesService } from './identities.service';
import { ProjectConfigurationService } from '../project-configuration/project-configuration.service';
import { TypedEntityCollectionData, CollectionLoadParameters } from 'imx-qbm-dbts';
import { PortalPersonAll, PortalAdminPerson, PortalPersonReports, PortalPersonReportsInteractive } from 'imx-api-qer';
import { IdentitesTestBed } from './test/identities-test-bed.spec';
import { IdentitiesCommonTestData } from './test/common-test-mocks.spec';
import { QerPermissionsService } from '../admin/qer-permissions.service';
import { IdentitiesReportsService } from './identities-reports.service';



function mockGetAllPerson(): TypedEntityCollectionData<any> {
  return { totalCount: 100, Data: ['1', '2', '3'] };
}

describe('DataExplorerIdentitiesComponent', () => {
  let component: DataExplorerIdentitiesComponent;
  let fixture: ComponentFixture<DataExplorerIdentitiesComponent>;
  const navigationState: CollectionLoadParameters = { StartIndex: 1, PageSize: 50 };
  const keyword = 'test1';


  const activatedRouteStub = {
    snapshot: { url: [{ path: 'admin' }] },
  };

  const person = {
    GetEntity: () => IdentitiesCommonTestData.mockEntity,
  } as PortalPersonAll;

  const adminPerson = {
    GetEntity: () => IdentitiesCommonTestData.mockEntity,
    DefaultEmailAddress: { Column: IdentitiesCommonTestData.mockEntityColumn },
    UID_PersonHead: { Column: IdentitiesCommonTestData.mockEntityColumn },
    IsInActive: { Column: IdentitiesCommonTestData.mockEntityColumn },
  } as PortalAdminPerson;

  const personReport = {
    GetEntity: () => IdentitiesCommonTestData.mockEntity,
    DefaultEmailAddress: { Column: IdentitiesCommonTestData.mockEntityColumn },
    UID_PersonHead: { Column: IdentitiesCommonTestData.mockEntityColumn },
    IsInActive: { Column: IdentitiesCommonTestData.mockEntityColumn },
  } as PortalPersonReports;

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



  IdentitesTestBed.configureTestingModule({
    declarations: [DataExplorerIdentitiesComponent],
    imports: [FormsModule, ReactiveFormsModule, CdrModule, NoopAnimationsModule],
    providers: [
      {
        provide: AppConfigService,
        useValue: IdentitiesCommonTestData.mockAppConfigService,
      },
      {
        provide: EuiSidesheetService,
        useValue: sideSheetTestHelper.servicestub
      },
      {
        provide: ProjectConfigurationService,
        useValue: IdentitiesCommonTestData.mockConfigService,
      },
      {
        provide: ActivatedRoute,
        useValue: activatedRouteStub
      },
      {
        provide: IdentitiesService,
        useValue: {
          personReportsSchema: PortalPersonReports.GetEntitySchema(),
          getDataModel: jasmine.createSpy('getDataModel').and.returnValue(Promise.resolve(
            {
              Properties: [],
              Filters: []
            }
          )),
          getDataModelAdmin: jasmine.createSpy('getDataModelAdmin').and.returnValue(Promise.resolve(
            {
              Properties: [],
              Filters: []
            }
          )),
          getDataModelReport: jasmine.createSpy('getDataModelReport').and.returnValue(Promise.resolve(
            {
              Properties: [],
              Filters: []
            }
          )),
          getAllPerson: jasmine.createSpy('getAllPerson').and.returnValue(Promise.resolve(mockGetAllPerson())),
          getAllPersonAdmin: jasmine.createSpy('getAllPersonAdmin').and.returnValue(Promise.resolve(mockGetAllPerson())),
          getAdminPerson: jasmine.createSpy('getAdminPerson').and.returnValue(Promise.resolve(adminPerson)),
          getPersonInteractive: jasmine.createSpy('getPersonInteractive').and.returnValue(Promise.resolve(personReportInteractive)),
          getGroupedAllPerson: jasmine.createSpy('getGroupedAllPerson').and.returnValue(Promise.resolve([])),
          getReportsOfManager: jasmine.createSpy('getReportsOfManager').and.returnValue(Promise.resolve(
            {
              totalCount: 1,
              Data: [personReport]
            }
          )),
          authorityDataDeleted: new Subject<string>(),
          userIsAdmin: jasmine.createSpy('userIsAdmin').and.returnValue(Promise.resolve(true))
        }
      },
      {
        provide: AuthenticationService,
        useValue: {
          onSessionResponse: new Subject<ISessionState>(),
        }
      }
      ,
      {
        provide: QerPermissionsService,
        useValue: {
          isPersonManager: jasmine.createSpy('isPersonManager').and.returnValue(Promise.resolve(true))
        }
      }
      ,
      {
        provide: ElementalUiConfigService,
        useValue: {
          Config: { downloadOptions: {url:''} }
        }
      }
      ,
      {
        provide: IdentitiesReportsService,
        useValue: {
          personsManagedReport: jasmine.createSpy('personsManagedReport').and.returnValue('')
        }
      },
      ExtService
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
  });


  beforeEach(() => {
    fixture = TestBed.createComponent(DataExplorerIdentitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    sideSheetTestHelper.reset();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
  it('should change navigation state', async () => {
    await component.onNavigationStateChanged(navigationState);
    expect(component.navigationState).toEqual(navigationState);
  });

  it('should set the selected identity', async () => {
    component.isAdmin = true;
    await component.onIdentityChanged(person);
    expect(component.selectedPerson).toEqual(person);
  });

  it('should search and reset start index ', async () => {
    await component.onSearch(keyword);
    expect(component.navigationState.StartIndex).toEqual(0);
  });

  it('should search for keyword ', async () => {
    await component.onSearch(keyword);
    expect(component.navigationState.search).toEqual(keyword);
  });
});
