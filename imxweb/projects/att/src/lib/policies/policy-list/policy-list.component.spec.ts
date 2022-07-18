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
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Router } from '@angular/router';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';
import { Subject } from 'rxjs';
import { LoggerTestingModule } from 'ngx-logger/testing';

import { UserModelService } from 'qer';
import { PortalAttestationPolicy } from 'imx-api-att';
import { AuthenticationService, clearStylesFromDOM, ConfirmationService, ISessionState, SnackBarService, SystemInfoService } from 'qbm';
import { PolicyListComponent } from './policy-list.component';
import { PolicyService } from '../policy.service';

@Component({
  selector: 'imx-data-table',
  template: '<p>MockDataTableComponent</p>'
})
class MockDataTableComponent {
  @Input() public dst: any;
  @Input() public dataSource: any;
  @Input() public navigationState: any;
  @Input() public displayedColumns: any;
  @Input() public entitySchema: any;
  @Input() public mode: 'auto' | 'manual' = 'auto';
  @Input() public selectable = false;
  @Input() public detailViewTitle: string;
  @Input() public groupData: any;

  @Output() public tableStateChanged: any;
}

@Component({
  selector: 'imx-data-table-column',
  template: '<p>MockDataTableColumnComponent</p>'
})
class MockDataTableColumnComponent {
  @Input() public entityColumn: any;
  @Input() public entitySchema: any;
  @Input() public columnLabel: any;
}

@Component({
  selector: 'imx-data-table-generic-column',
  template: '<p>MockDataTableGenericColumnComponent</p>'
})
class MockDataTableGenericColumnComponent {
  @Input() public columnLabel: any;
  @Input() public columnName: any;
}

@Component({
  selector: 'imx-data-source-paginator',
  template: '<p>MockDataSourcePaginatorComponent</p>'
})
class MockDataSourcePaginatorComponent {
  @Input() public dst: any;
}

@Component({
  selector: 'imx-data-source-toolbar',
  template: '<p>MockDataSourceToolbarComponent</p>'
})
class MockDataSourceToolbarComponent {
  @Input() public dst: any;
  @Input() public hiddenElements: any;
  @Input() public settings: any;
}

describe('PolicyListComponent', () => {
  let component: PolicyListComponent;
  let fixture: ComponentFixture<PolicyListComponent>;

  const mockPolicyService = {
    AttestationPolicySchema: PortalAttestationPolicy.GetEntitySchema(),
    canSeeAttestations: jasmine.createSpy('canSeeAttestations').and.returnValue(Promise.resolve(false)),
    getDataModel: jasmine.createSpy('getDataModel').and.returnValue(Promise.resolve({
      Properties: [],
      Filters: [],
      GroupInfo: []
    })),
    getGroupInfo: jasmine.createSpy('getGroupInfo').and.returnValue(Promise.resolve([])),
    getPolicyEditInteractive: jasmine.createSpy('getPolicyEditInteractive').and.returnValue(Promise.resolve({
      Data: [{
        UID_AttestationObject: { value: '' },
        UID_QERPickCategory: { value: '' },
        GetEntity: () => ({
          GetKeys: () => ['uid'],
          GetDisplay: () => ''
        })
      }],
      extendedData: [{
        IsReadOnly: false,
        Filter: { Elements: [], ConcatenationType: 'AND' },
        InfoDisplay: []
      }]
    })),
    buildNewEntity: jasmine.createSpy('buildNewEntity').and.returnValue(Promise.resolve({
      Data: [{
        GetEntity: () => ({
          GetKeys: () => ['uid'],
          GetDisplay: () => ''
        })
      }],
      extendedData: [{}]
    })),
    deleteAttestationPolicy: jasmine.createSpy('deleteAttestationPolicy'),
    getPolicies: jasmine.createSpy('getPolicies'),
    getRunCountForPolicy: jasmine.createSpy('getRunCountForPolicy').and.returnValue(Promise.resolve(0))
  }

  let confirm = true;
  const mockConfirmationService = {
    confirm: jasmine.createSpy('confirm')
      .and.callFake(() => Promise.resolve(confirm))
  }

  const euiLoadingServiceStub = {
    hide: jasmine.createSpy('hide'),
    show: jasmine.createSpy('show')
  };

  const snackBarServiceStub = {
    open: jasmine.createSpy('open')
  };

  let sideSheetResult = null;
  const matSidesheetStub = {
    open: jasmine.createSpy('open').and.returnValue(
      {
        afterClosed: () => ({
          toPromise: () => Promise.resolve(sideSheetResult)
        })
      }),
  }

  const mockRouter = {
    navigate: jasmine.createSpy('navigate')
  };

  let userGroups;

  const mockUserProvider = {
    getGroups: jasmine.createSpy('getGroups').and.callFake(() => userGroups)
  }

  let sytsmeInfo = { PreProps: ['ATTESTATION'] };
  const mockSystemInfo = {
    get: jasmine.createSpy('get').and.callFake(() => Promise.resolve(sytsmeInfo))
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [
        MatSlideToggleModule,
        FormsModule,
        LoggerTestingModule
      ],
      declarations: [
        MockDataTableComponent,
        MockDataTableColumnComponent,
        MockDataTableGenericColumnComponent,
        MockDataSourceToolbarComponent,
        MockDataSourcePaginatorComponent,
        PolicyListComponent
      ],
      providers: [
        {
          provide: Router,
          useValue: mockRouter
        },
        {
          provide: PolicyService,
          useValue: mockPolicyService
        },
        {
          provide: EuiLoadingService,
          useValue: euiLoadingServiceStub
        },
        {
          provide: SnackBarService,
          useValue: snackBarServiceStub
        },
        {
          provide: EuiSidesheetService,
          useValue: matSidesheetStub
        },
        {
          provide: ConfirmationService,
          useValue: mockConfirmationService
        },
        {
          provide: AuthenticationService,
          useValue: {
            onSessionResponse: new Subject<ISessionState>(),
            update: jasmine.createSpy('update'),
            logout: jasmine.createSpy('logout'),
          }
        },
        {
          provide: UserModelService,
          useValue: mockUserProvider
        },
        {
          provide: SystemInfoService,
          useValue: mockSystemInfo
        }
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PolicyListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    mockPolicyService.buildNewEntity.calls.reset();
    mockPolicyService.deleteAttestationPolicy.calls.reset();
    mockPolicyService.getPolicies.calls.reset();
    mockPolicyService.getPolicyEditInteractive.calls.reset();
    mockPolicyService.canSeeAttestations.calls.reset();
    mockRouter.navigate.calls.reset();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('can update navigation', async () => {
    await component.onNavigationStateChanged({ PageSize: 20, StartIndex: 21, withProperties:undefined });

    expect(mockPolicyService.getPolicies).toHaveBeenCalledWith({ PageSize: 20, StartIndex: 21, withProperties:undefined });
  });

  xit('can trigger search', async () => {
    await component.onSearch('neuer Wert');

    expect(mockPolicyService.getPolicies).toHaveBeenCalledWith({ PageSize: 20, StartIndex: 0, search: 'neuer Wert'});
  });

  for (const testcase of [
    { result: true, description: 'with reload' },
    { result: false, description: 'without reload' }
  ]) {
    it(`can edit a policy ${testcase.description}`, async () => {
      sideSheetResult = testcase.result;
      const policy = {
        GetEntity: () => ({
          GetKeys: () => ['uid'],
          GetDisplay: () => ''
        })
      } as PortalAttestationPolicy

      await component.editPolicy(policy);

      expect(mockPolicyService.getPolicyEditInteractive).toHaveBeenCalled();
      if (testcase.result) {
        expect(mockPolicyService.getPolicies).toHaveBeenCalled();
      } else {
        expect(mockPolicyService.getPolicies).not.toHaveBeenCalled();
      }
    });
  }

  for (const testcase of [
    { result: true, description: 'with reload' },
    { result: false, description: 'without reload' }
  ]) {
    it(`can create new policy ${testcase.description}`, async () => {
      sideSheetResult = testcase.result;

      await component.newPolicy();

      expect(mockPolicyService.buildNewEntity).toHaveBeenCalled();

      if (testcase.result) {
        expect(mockPolicyService.getPolicies).toHaveBeenCalled();
      } else {
        expect(mockPolicyService.getPolicies).not.toHaveBeenCalled();
      }
    });
  }


  it('can copy a policy', async () => {
    sideSheetResult = false;

    const policy = {
      GetEntity: () => ({
        GetKeys: () => ['uid'],
        GetDisplay: () => ''
      })
    } as PortalAttestationPolicy;

    await component.copy(policy);

    expect(mockPolicyService.buildNewEntity).toHaveBeenCalled();
  });


  for (const testcase of [
    { confirm: true, description: 'can delete a policy' },
    { confirm: true, description: 'can cancel delete for a policy' }
  ]) {
    it(testcase.description, async () => {
      confirm = testcase.confirm

      const policy = {
        GetEntity: () => ({
          GetKeys: () => ['uid'],
          GetDisplay: () => ''
        })
      } as PortalAttestationPolicy;

      await component.delete(policy);

      if (testcase.confirm) {
        expect(mockPolicyService.deleteAttestationPolicy).toHaveBeenCalled();
      } else {
        expect(mockPolicyService.deleteAttestationPolicy).not.toHaveBeenCalled();
      }
    });
  }

  it('can create attestation run', async () => {
    sideSheetResult = false;

    const policy = {
      GetEntity: () => ({
        GetKeys: () => ['uid'],
        GetDisplay: () => ''
      })
    } as PortalAttestationPolicy;

    await component.run(policy);

    expect(mockPolicyService.getPolicyEditInteractive).toHaveBeenCalled();
  });
});
