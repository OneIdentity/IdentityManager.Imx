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

import { Input, Component, Pipe, PipeTransform, ErrorHandler } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { EuiCoreModule, EuiLoadingService, EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';

import { IEntity, LimitedValueData, IForeignKeyInfo, EntityCollectionData } from 'imx-qbm-dbts';
import { PortalApplication, PortalShops } from 'imx-api-aob';
import { EditApplicationComponent } from './edit-application.component';
import { ShopsService } from '../../shops/shops.service';
import { Base64ImageService, SnackBarService, clearStylesFromDOM } from 'qbm';
import { AccountsService } from '../../accounts/accounts.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'imx-cdr-editor',
  template: '<p>MockCdrEditorComponent</p>'
})
class MockCdrEditorComponent {
  @Input() cdr: any;
}

@Component({
  selector: 'imx-select',
  template: '<p>MockSelectComponent</p>'
})
class MockSelectComponent {
  @Input() public itemIcon: string;
  @Input() public items: any;
  @Input() public itemsSelected: any;
  @Input() public placeholder: string;
  @Input() public label: string;
  @Input() public formCtrl: any;
  @Input() public contentProvider: any;
  @Input() public errorMessage: any;
  @Input() public pageSize = 20;
  @Input() public loading = false;
  @Input() public isLocalDatasource = false;
  @Input() public multi: any;
  @Input() public disabled: any;
  @Input() public totalCount: any;
  @Input() labelAutoComplete: any;
}

@Component({
  selector: 'imx-application-image-select',
  template: '<p>MockAppImageSelect</p>'
})
class MockAppImageSelect {
  @Input() column: any;
}

@Component({
  selector: 'imx-entity-column-editor',
  template: '<p>MockEntityColumnEditorComponent</p>'
})
class MockEntityColumnEditorComponent {
  @Input() column: any;
}

@Component({
  selector: 'imx-authentication-root',
  template: '<p>MockAuthenticationRootComponent</p>'
})
class MockAuthenticationRootComponent {
  @Input() application: any;
}

@Pipe({ name: 'ldsReplace' })
class MockLdsReplacePipe implements PipeTransform {
  transform(value: any, ..._: any[]): any { return value; }
}

describe('EditApplicationComponent', () => {
  function createColumn(value?) {
    return {
      GetValue: () => value,
      PutValue: _ => { },
      GetMetadata: () => ({
        CanEdit: () => undefined,
        GetFkRelations: () => undefined,
        GetLimitedValues: () => [] as ReadonlyArray<LimitedValueData>
      }),
      GetDisplayValue: () => undefined
    };
  }

  function createEntity(keys?: string[]): IEntity {
    return {
      Commit: () => Promise.resolve(),
      GetColumn: _ => createColumn(),
      GetKeys: () => keys
    } as IEntity;
  }

  function createShop(uid: number): PortalShops {
    return { UID_ITShopOrg: { value: uid.toString() } } as PortalShops;
  }

  function createDbKey(key: number): string {
    return '<Key><T>table0</T><P>' + key + '</P></Key>';
  }

  const mockAccountsAll = [1, 2];
  const mockAccountsAssigned = [1];

  const mockAccountsEntityCollection = {
    TotalCount: mockAccountsAll.length,
    Entities: mockAccountsAll.map(key => ({
      Display: 'display' + key,
      Columns: {
        XObjectKey: { Value: createDbKey(key) }
      }
    }))
  } as EntityCollectionData;

  class MockCollectionWithAssignment<T> {
    readonly all: { totalCount: number; Data: T[] };
    readonly assigned: T[];

    constructor(uids: number[], uidsAssigned: number[], createItem: (uid: number) => T) {
      this.all = { totalCount: uids.length, Data: uids.map(createItem) };
      this.assigned = uidsAssigned.map(createItem);
    }
  }

  const mockAccounts = new MockCollectionWithAssignment(mockAccountsAll, mockAccountsAssigned, key => ({
    GetEntity: () => ({
      GetKeys: () => [key],
      GetColumn: name => ({
        XObjectKey: createColumn(createDbKey(key))
      }[name])
    })
  }));
  const mockShops = new MockCollectionWithAssignment([1, 2], [1], createShop);

  let component: EditApplicationComponent;
  let fixture: ComponentFixture<EditApplicationComponent>;
  const mockRouter = {
    navigate: jasmine.createSpy('navigate')
  };

  const mockShopsService = {
    get: jasmine.createSpy('get').and.returnValue(Promise.resolve({
      totalCount: mockShops.all.totalCount,
      Data: mockShops.all.Data
    })),
    getApplicationInShop: jasmine.createSpy('getApplicationInShop').and.returnValue(Promise.resolve({
      totalCount: mockShops.assigned.length,
      Data: mockShops.assigned
    })),
    updateApplicationInShops: jasmine.createSpy('updateApplicationInShops')
  };

  const snackBarServiceStub = {
    open: jasmine.createSpy('open')
  };

  const euiLoadingServiceStub = {
    hide: jasmine.createSpy('hide'),
    show: jasmine.createSpy('show')
  };

  const mockSidesheetRef = {
    closeClicked: () => new Subject(),
    close: __ => { }
  }

  const accountsServiceStub = {
    getAssigned: jasmine.createSpy('getAssigned').and.returnValue(Promise.resolve(mockAccounts.assigned)),
    updateApplicationUsesAccounts: jasmine.createSpy('updateApplicationUsesAccounts'),
    getCandidateTables: jasmine.createSpy('getCandidateTables').and.returnValue([
      { Get: _ => Promise.resolve(mockAccountsEntityCollection) } as IForeignKeyInfo
    ])
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        LoggerTestingModule,
        MatCardModule,
        MatAutocompleteModule,
        MatFormFieldModule,
        MatInputModule,
        EuiCoreModule,
        ReactiveFormsModule,
        TranslateModule.forRoot()
      ],
      declarations: [
        EditApplicationComponent,
        MockAppImageSelect,
        MockSelectComponent,
        MockLdsReplacePipe,
        MockCdrEditorComponent,
        MockAuthenticationRootComponent,
        MockEntityColumnEditorComponent
      ],
      providers: [
        {
          provide: Router,
          useValue: mockRouter
        },
        {
          provide: ShopsService,
          useValue: mockShopsService
        },
        {
          provide: SnackBarService,
          useValue: snackBarServiceStub
        },
        {
          provide: Base64ImageService,
          useValue: {
            getImageData: jasmine.createSpy('getImageData').and.callFake(data => data),
            getImageUrl: jasmine.createSpy('getImageUrl')
          }
        },
        {
          provide: EuiLoadingService,
          useValue: euiLoadingServiceStub
        },
        {
          provide: AccountsService,
          useValue: accountsServiceStub
        },
        {
          provide: EuiSidesheetRef,
          useValue: mockSidesheetRef
        },
        {
          provide: EUI_SIDESHEET_DATA,
          useValue: {
            GetEntity: () => ({})
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
    mockShopsService.get.calls.reset();
    mockShopsService.getApplicationInShop.calls.reset();
    mockShopsService.updateApplicationInShops.calls.reset();
    snackBarServiceStub.open.calls.reset();
    euiLoadingServiceStub.hide.calls.reset();
    euiLoadingServiceStub.show.calls.reset();
    accountsServiceStub.getAssigned.calls.reset();
    accountsServiceStub.updateApplicationUsesAccounts.calls.reset();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditApplicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('inits shops', async () => {
    const mockAobApplication = {
      UID_AOBApplication: { value: '' }
    } as unknown as PortalApplication;

    component.application = mockAobApplication;

    expect(component.shopsData).toBeDefined();

    const assignedShops = await component.shopsData.getSelected();

    expect(assignedShops.length).toEqual(mockShops.assigned.length);
  });

  it('inits accounts', async () => {
    const mockAobApplication = {
      UID_AOBApplication: { value: '' }
    } as unknown as PortalApplication;

    component.application = mockAobApplication;

    expect(component.accountsData).toBeDefined();

    const assignedAccounts = await component.accountsData.getSelected();

    expect(assignedAccounts.length).toEqual(mockAccounts.assigned.length);
  });

  it('can submit if there are changes', () => {
    const mockAobApplication = {
      UID_AOBApplication: { value: '' }
    } as unknown as PortalApplication;

    component.application = mockAobApplication;


    // simulate dirty:
    component.applicationForm.markAsDirty();

    expect(component.canSubmit()).toBeTruthy();
  });

  it('submits AobApplication', async () => {
    const entity = createEntity();
    const commitSpy = spyOn(entity, 'Commit');

    const mockApp = {
      UID_AOBApplication: { value: '' },
      GetEntity: () => entity
    } as unknown as PortalApplication;

    const spy = spyOn(component.close, 'emit');

    component.application = mockApp;


    component.applicationForm.markAsDirty();

    expect(component.applicationForm.dirty).toBeTruthy();

    await component.submitData();

    expect(commitSpy).toHaveBeenCalledTimes(1);
    expect(component.applicationForm.dirty).toBeFalsy();
    expect(spy).toHaveBeenCalled();

    expect(euiLoadingServiceStub.show).toHaveBeenCalled();
    expect(snackBarServiceStub.open).toHaveBeenCalled();
  });

  it(`emits cancel event`, async () => {
    const spy = spyOn(component.close, 'emit');
    await component.cancelProcess();
    expect(spy).toHaveBeenCalled();
  });
});
