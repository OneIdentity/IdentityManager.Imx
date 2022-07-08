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

import { Component, Input, Output } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { EuiCoreModule, EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

import { EntitlementsComponent } from './entitlements.component';
import { EntitlementsService } from './entitlements.service';
import { LifecycleAction } from '../lifecycle-actions/lifecycle-action.enum';
import { LifecycleActionComponent } from '../lifecycle-actions/lifecycle-action.component';
import { PortalApplication, PortalEntitlement } from 'imx-api-aob';
import { SnackBarService, DataSourceToolbarModule, DisableControlModule, clearStylesFromDOM, SystemInfoService, MetadataService } from 'qbm';
import { DbVal, IClientProperty, ValType } from 'imx-qbm-dbts';
import { ShopsService } from '../shops/shops.service';
import { ServiceItemsService } from '../service-items/service-items.service';
import { UserModelService } from 'qer';

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

  @Output() public tableStateChanged: any;
}

@Component({
  selector: 'imx-data-table-detail',
  template: '<p>MockDataTableDetailComponent</p>'
})
class MockDataTableDetailComponent {
  @Input() public detailContentTemplate: any;
}

@Component({
  selector: 'imx-data-table-column',
  template: '<p>MockDataTableColumnComponent</p>'
})
class MockDataTableColumnComponent {
  @Input() public entityColumn: any;
  @Input() public entitySchema: any;
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
  selector: 'imx-auto-complete',
  template: '<p>MockAutoCompleteComponent</p>'
})
class MockAutoCompleteComponent {
  @Input() public placeholder: any;
  @Input() public availableOptions: any;

  @Output() public valueChanged: any;
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
  @Input() icon: any;
  @Output() public selectionChanged: any;
  @Input() public actions: any;
  @Output() public actionSelected: any;
}

@Component({
  selector: 'imx-user',
  template: '<p>MockUserComponent</p>'
})
class MockUserComponent {
  @Input() public uid: any;
  @Input() public role: any;
  public imageUrl: any;
}

describe('EntitlementsComponent', () => {
  let component: EntitlementsComponent;
  let fixture: ComponentFixture<EntitlementsComponent>;

  const mockApplication = {
    UID_AOBApplication: {
      value: 'uid', Column: { GetDisplayValue: () => 'return a' },
    },
    GetEntity: () => ({
      GetKeys: () => ['key1']
    })
  } as PortalApplication;

  const mockEntitlementNotPublished = {
    Ident_AOBEntitlement: { value: 'unpublished' },
    Description: { value: '' },
    ObjectKeyElement: { value: '<Key><T>tableName</T><P>uid</P></Key>' },
    IsInActive: { value: true },
    XTouched: { value: null },
    ActivationDate: {
      value: null, GetMetadata: () => ({
        CanEdit: () => true
      })
    },
    UID_AOBApplication: mockApplication.UID_AOBApplication,
    GetEntity: () => ({
      GetDisplay: () => 'name1'
    }),
    XDateInserted: { Column: { GetDisplayValue: () => 'return a' } },
    UID_AERoleOwner: { Column: { GetDisplayValue: () => 'return a' } }
  };

  const mockEntitlementData = [
    mockEntitlementNotPublished,
    {
      IsInActive: { value: true },
      XTouched: { value: "some date" },
      ObjectKeyElement: { value: '<Key><T>tableName</T><P>uid</P></Key>' },
      ActivationDate: {
        value: null, GetMetadata: () => ({
          CanEdit: () => true
        })
      },
      UID_AOBApplication: mockApplication.UID_AOBApplication,
      GetEntity: () => ({
        GetDisplay: () => 'name2'
      })
    },
    {
      IsInActive: { value: true },
      XTouched: { value: "some date" },
      ObjectKeyElement: { value: '<Key><T>tableName</T><P>uid</P></Key>' },
      ActivationDate: {
        value: null, GetMetadata: () => ({
          CanEdit: () => true
        })
      },
      UID_AOBApplication: mockApplication.UID_AOBApplication,
      GetEntity: () => ({
        GetDisplay: () => 'name3'
      })
    },
    {
      IsInActive: { value: true },
      XTouched: { value: "some date" },
      ObjectKeyElement: { value: '<Key><T>tableName</T><P>uid</P></Key>' },
      ActivationDate: {
        value: null, GetMetadata: () => ({
          CanEdit: () => true
        })
      },
      UID_AOBApplication: mockApplication.UID_AOBApplication,
      GetEntity: () => ({
        GetDisplay: () => 'name4'
      })
    },
    {
      IsInActive: { value: false },
      XTouched: { value: "some date" },
      ObjectKeyElement: { value: '<Key><T>tableName</T><P>uid</P></Key>' },
      ActivationDate: {
        value: null, GetMetadata: () => ({
          CanEdit: () => true
        })
      },
      UID_AOBApplication: mockApplication.UID_AOBApplication,
      GetEntity: () => ({
        GetDisplay: () => 'some other'
      })
    }
  ];

  const mockEntitlementsService = {
    entitlementSchema: PortalEntitlement.GetEntitySchema(),
    get: jasmine.createSpy('get').and.returnValue(Promise.resolve({ Data: mockEntitlementData })),
    getEntitlementsForApplication: jasmine.createSpy('getEntitlementsForApplication').and
      .returnValue(Promise.resolve(Promise.resolve({
        totalCount: mockEntitlementData.length,
        Data: mockEntitlementData
      }))),
    assign: jasmine.createSpy('assign'),
    unassign: jasmine.createSpy('unassign'),
    publish: jasmine.createSpy('publish'),
    unpublish: jasmine.createSpy('unpublish'),
    tryCommit: jasmine.createSpy('tryCommit'),
    getEntitlementBadges: jasmine.createSpy('getEntitlementBadges'),
    reload: jasmine.createSpy('reload').and.callFake(app => app)
  };

  let result: any;
  const mockMatDialog = {
    open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of(result) }),
    closeAll: jasmine.createSpy('closeAll')
  };

  function getDateWithOffset(date: Date, days: number): Date {
    let dateWithOffset = date;
    dateWithOffset.setDate(dateWithOffset.getDate() + days);
    return dateWithOffset;
  }

  const mockShops = [{ GetEntity: () => ({ GetDisplay: () => 'itshop1' }) }];

  const mockShopsService = {
    getApplicationInShop: jasmine.createSpy('getApplicationInShop').and.returnValue({ Data: mockShops })
  };

  const euiLoadingServiceStub = {
    hide: jasmine.createSpy('hide'),
    show: jasmine.createSpy('show')
  };

  const serviceItemsServiceStub = {
    get: jasmine.createSpy('get')
  };

  const sidesheet = {
    open: jasmine.createSpy('open').and.returnValue({
      afterClosed: () => of({})
    })
  };

  const mockSystemInfo = {
    get: jasmine.createSpy('get').and.callFake(() => Promise.resolve({ PreProps: ['ESET'] }))
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        EntitlementsComponent,
        MockAutoCompleteComponent,
        MockDataTableComponent,
        MockDataTableDetailComponent,
        MockDataTableColumnComponent,
        MockDataTableGenericColumnComponent,
        MockDataTilesComponent,
        MockUserComponent
      ],
      imports: [
        DisableControlModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
        LoggerTestingModule,
        MatButtonToggleModule,
        MatCardModule,
        MatDialogModule,
        MatFormFieldModule,
        MatButtonModule,
        MatInputModule,
        EuiCoreModule,
        DataSourceToolbarModule,
        TranslateModule.forRoot()
      ],
      providers: [
        {
          provide: EntitlementsService,
          useValue: mockEntitlementsService
        },
        {
          provide: MatDialog,
          useValue: mockMatDialog
        },
        {
          provide: SnackBarService,
          useValue: {
            open: jasmine.createSpy('open')
          }
        },
        {
          provide: ShopsService,
          useValue: mockShopsService
        },
        {
          provide: EuiLoadingService,
          useValue: euiLoadingServiceStub
        },
        {
          provide: ServiceItemsService,
          useValue: serviceItemsServiceStub
        },
        {
          provide: EuiSidesheetService,
          useValue: sidesheet
        },
        {
          provide: UserModelService,
          useValue: {
            getUserConfig: jasmine.createSpy('getUserConfig').and.returnValue(Promise.resolve(
              { IsStarlingTwoFactorConfigured: true }
            ))
          }
        },
        {
          provide: SystemInfoService,
          useValue: mockSystemInfo,
        },
        {
          provide: MetadataService,
          useValue: {
            update: jasmine.createSpy('update'),
          }
        }
      ]
    });

    serviceItemsServiceStub.get.calls.reset();
  });

  beforeEach(waitForAsync(() => {
    mockEntitlementsService.get.calls.reset();
    mockEntitlementsService.getEntitlementsForApplication.calls.reset();
    mockEntitlementsService.publish.calls.reset();
    mockEntitlementsService.tryCommit.calls.reset();
    mockEntitlementsService.getEntitlementBadges.calls.reset();
    mockEntitlementsService.reload.calls.reset();
    mockMatDialog.open.calls.reset();
    mockShopsService.getApplicationInShop.calls.reset();
    euiLoadingServiceStub.hide.calls.reset();
    euiLoadingServiceStub.show.calls.reset();
    sidesheet.open.calls.reset();
  }));

  beforeEach(() => {
    result = undefined;
    fixture = TestBed.createComponent(EntitlementsComponent);
    component = fixture.componentInstance;
    component.application = mockApplication;
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  [
    { description: 'without resetNavigationState', resetNavigationState: false, newState: undefined },
    { description: 'with resetNavigationState', resetNavigationState: true, newState: undefined },
    { description: 'with a new navigation state', resetNavigationState: false, newState: { PageSize: 50, StartIndex: 1 } }
  ].forEach(testcase => {
    it(`fetches data ${testcase.description}`, async () => {
      // Arrange
      mockEntitlementsService.getEntitlementsForApplication.calls.reset();

      // Act
      await component.getData(testcase.resetNavigationState, testcase.newState);

      // Assert
      if (testcase.resetNavigationState) {
        expect(mockEntitlementsService.getEntitlementsForApplication).toHaveBeenCalledWith(component.application, { PageSize: 20, StartIndex: 0 });
      } else if (testcase.newState) {
        expect(mockEntitlementsService.getEntitlementsForApplication).toHaveBeenCalledWith(component.application, testcase.newState);
      } else {
        expect(mockEntitlementsService.getEntitlementsForApplication).toHaveBeenCalledWith(component.application, undefined);
      }
    });
  });

  [
    { resultOpen: [{ XObjectKey: { value: 'val1' } }, { XObjectKey: { value: 'val2' } }, { XObjectKey: { value: 'val3' } }] },
    { resultOpen: undefined }
  ].forEach(testcase => {
    it('could open addEntitlements-dialog', async () => {
      result = testcase.resultOpen;
      await component.addNewElement();
      expect(sidesheet.open).toHaveBeenCalled();
    });
  });

  [null, {}].forEach(testcase => {
    it('could open publish-dialog', async () => {
      // Act
      await component.publish(testcase as PortalEntitlement);

      // Assert
      expect(mockShopsService.getApplicationInShop).toHaveBeenCalledWith(component.application.UID_AOBApplication.value);
      expect(mockMatDialog.open).toHaveBeenCalledWith(LifecycleActionComponent, {
        data: {
          action: LifecycleAction.Publish,
          elements: testcase == null ? component.selections : [testcase],
          shops: mockShops,
          type: 'AobEntitlement'
        }, height: 'auto'
      });
    });
  });

  it('can edit an entitlement', async () => {
    await component.editEntitlement(mockEntitlementNotPublished as PortalEntitlement);

    expect(mockEntitlementsService.reload).toHaveBeenCalledWith(mockEntitlementNotPublished);
    expect(serviceItemsServiceStub.get).toHaveBeenCalledWith(mockEntitlementNotPublished);

    expect(sidesheet.open).toHaveBeenCalled();
  });

  [
    { action: LifecycleAction.Unassign, mode: 'unassign', resultOpen: false },
    { action: LifecycleAction.Unassign, mode: 'unassign', resultOpen: true },
    { action: LifecycleAction.Unpublish, mode: 'unpublish', resultOpen: false },
    { action: LifecycleAction.Unpublish, mode: 'unpublish', resultOpen: true },
    { action: LifecycleAction.Publish, mode: 'publish', resultOpen: false },
    { action: LifecycleAction.Publish, mode: 'publish', resultOpen: true }
  ].forEach(testcase => {
    it(`could open ${testcase.mode}-dialog`, async () => {
      // Arrange
      result = testcase.resultOpen;

      // Act
      if (testcase.action == LifecycleAction.Unassign) {
        await component.unassign();
      } else if (testcase.action == LifecycleAction.Unpublish) {
        await component.unpublish();
      } else {
        await component.publish();
      }

      // Assert
      if (testcase.action == LifecycleAction.Publish) {
        expect(mockMatDialog.open).toHaveBeenCalledWith(LifecycleActionComponent, {
          data: {
            action: testcase.action,
            elements: [],
            shops: [jasmine.any(Object)],
            type: 'AobEntitlement'
          },
          height: 'auto'
        });
      } else {
        expect(mockMatDialog.open).toHaveBeenCalledWith(LifecycleActionComponent, {
          data: {
            action: testcase.action,
            elements: [],
            type: 'AobEntitlement'
          },
          width: '800px',
          height: '500px'
        });
      }
    });
  });

  [
    { action: LifecycleAction.Unassign, mode: 'unassign', resultOpen: false },
    { action: LifecycleAction.Unassign, mode: 'unassign', resultOpen: true },
    { action: LifecycleAction.Unpublish, mode: 'unpublish', resultOpen: false },
    { action: LifecycleAction.Unpublish, mode: 'unpublish', resultOpen: true },
    { action: LifecycleAction.Publish, mode: 'publish', resultOpen: false },
    { action: LifecycleAction.Publish, mode: 'publish', resultOpen: true }
  ].forEach(testcase => {
    it(`could open ${testcase.mode}-dialog for single element`, async () => {

      // Arrange
      result = testcase.resultOpen;
      const entitlementStub = {
        Ident_AOBEntitlement: { value: 'unpublished' },
        IsInActive: { value: true },
        ActivationDate: { value: null },
        UID_AOBApplication: mockApplication.UID_AOBApplication,
        GetEntity: () => ({
          GetDisplay: () => 'name1'
        })
      };

      // Act
      if (testcase.action == LifecycleAction.Unassign) {
        await component.unassign(entitlementStub as PortalEntitlement);
      } else if (testcase.action == LifecycleAction.Unpublish) {
        await component.unpublish(entitlementStub as PortalEntitlement);
      } else {
        await component.publish(entitlementStub as PortalEntitlement);
      }

      // Assert
      if (testcase.action == LifecycleAction.Publish) {
        expect(mockMatDialog.open).toHaveBeenCalledWith(LifecycleActionComponent, {
          data: {
            action: testcase.action,
            elements: [jasmine.any(Object)],
            shops: [jasmine.any(Object)],
            type: 'AobEntitlement'
          },
          height: 'auto'
        });
      } else {
        expect(mockMatDialog.open).toHaveBeenCalledWith(LifecycleActionComponent, {
          data: {
            action: testcase.action,
            elements: [jasmine.any(Object)],
            type: 'AobEntitlement'
          },
          width: '800px',
          height: '500px'
        });
      }
    });
  });

  [
    {
      description: 'selection undefined',
      state: { unassignedDisabled: true, publishDisabled: true, unpublishDisabled: true }
    },
    {
      description: 'selection emtpy',
      selection: [],
      state: { unassignedDisabled: true, publishDisabled: true, unpublishDisabled: true }
    },
    {
      description: 'notPublished',
      selection: [
        { IsInActive: { value: true }, ActivationDate: { value: null }, Ident_AOBEntitlement: { GetMetadata: () => ({ CanEdit: () => true }) } }
      ],
      state: { unassignedDisabled: false, publishDisabled: false, unpublishDisabled: true }
    },
    {
      description: 'willBePublished',
      selection: [
        { IsInActive: { value: true }, ActivationDate: { value: getDateWithOffset(DbVal.MinDate, 1) }, Ident_AOBEntitlement: { GetMetadata: () => ({ CanEdit: () => true }) } }
      ],
      state: { unassignedDisabled: false, publishDisabled: false, unpublishDisabled: false }
    },
    {
      description: 'published',
      selection: [
        { IsInActive: { value: false }, ActivationDate: { value: null }, Ident_AOBEntitlement: { GetMetadata: () => ({ CanEdit: () => true }) } }
      ],
      state: { unassignedDisabled: false, publishDisabled: true, unpublishDisabled: false }
    },
    {
      description: 'notPublished, willBePublished',
      selection: [
        { IsInActive: { value: true }, ActivationDate: { value: null }, Ident_AOBEntitlement: { GetMetadata: () => ({ CanEdit: () => true }) } },
        { IsInActive: { value: true }, ActivationDate: { value: getDateWithOffset(DbVal.MinDate, 1) }, Ident_AOBEntitlement: { GetMetadata: () => ({ CanEdit: () => true }) } }
      ],
      state: { unassignedDisabled: false, publishDisabled: false, unpublishDisabled: true }
    },
    {
      description: 'notPublished, published',
      selection: [
        { IsInActive: { value: true }, ActivationDate: { value: null }, Ident_AOBEntitlement: { GetMetadata: () => ({ CanEdit: () => true }) } },
        { IsInActive: { value: false }, ActivationDate: { value: null }, Ident_AOBEntitlement: { GetMetadata: () => ({ CanEdit: () => true }) } }
      ],
      state: { unassignedDisabled: false, publishDisabled: true, unpublishDisabled: true }
    },
    {
      description: 'notPublished, willBePublished, published',
      selection: [
        { IsInActive: { value: true }, ActivationDate: { value: null }, Ident_AOBEntitlement: { GetMetadata: () => ({ CanEdit: () => true }) } },
        { IsInActive: { value: true }, ActivationDate: { value: getDateWithOffset(DbVal.MinDate, 1) }, Ident_AOBEntitlement: { GetMetadata: () => ({ CanEdit: () => true }) } },
        { IsInActive: { value: false }, ActivationDate: { value: null }, Ident_AOBEntitlement: { GetMetadata: () => ({ CanEdit: () => true }) } }
      ],
      state: { unassignedDisabled: false, publishDisabled: true, unpublishDisabled: true }
    }
  ].forEach(testcase => {
    it('onSelectionChanged (' + testcase.description + ')', () => {
      component.onSelectionChanged(testcase.selection as PortalEntitlement[]);
      expect(component.unassignedDisabled).toEqual(testcase.state.unassignedDisabled);
      expect(component.publishDisabled).toEqual(testcase.state.publishDisabled);
      expect(component.unpublishDisabled).toEqual(testcase.state.unpublishDisabled);
    });
  });

  it('provides an entitlementBadge', () => {
    component.status.getBadges({} as PortalEntitlement);
    expect(mockEntitlementsService.getEntitlementBadges).toHaveBeenCalled();
  });

  it('provides grouping', () => {
    expect(() => {
      const clientProperties: IClientProperty = {
        Type: ValType.String,
        ColumnName: 'Dummy',
        IsValidColumnForFiltering: true,
      };
      component.onGroupingChanged(clientProperties);
    }).not.toThrowError();
  });

  [
    {
      description: 'Ident_AOBEntitlement can be edited',
      entitlement: {
        Ident_AOBEntitlement: { value: 'identifier', GetMetadata: () => ({ CanEdit: () => true }) },
        Description: { value: 'identifier', GetMetadata: () => ({ CanEdit: () => true }) }
      },
      expected: true
    },
    {
      description: 'Description can be edited',
      entitlement: {
        Ident_AOBEntitlement: { value: 'identifier', GetMetadata: () => ({ CanEdit: () => false }) },
        Description: { value: 'identifier', GetMetadata: () => ({ CanEdit: () => true }) }
      },
      expected: true
    },
    {
      description: 'bouth could not be edited',
      entitlement: {
        Ident_AOBEntitlement: { value: 'identifier', GetMetadata: () => ({ CanEdit: () => false }) },
        Description: { value: 'identifier', GetMetadata: () => ({ CanEdit: () => false }) }
      },
      expected: false
    }
  ].forEach(testcase => {
    it(`can determine, if an entitlement should be shown as editable or not (${testcase.description})`, () => {
      expect(component.canEdit(testcase.entitlement as PortalEntitlement)).toEqual(testcase.expected);
    })
  });

});
