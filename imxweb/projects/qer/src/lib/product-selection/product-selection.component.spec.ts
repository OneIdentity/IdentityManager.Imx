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

import { Component, Input, ViewChild } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';
import { of } from 'rxjs';

import { AuthenticationService, clearStylesFromDOM, EntityService, imx_SessionService, SnackBarService } from 'qbm';
import { ProductSelectionComponent } from './product-selection.component';
import { ServiceItemsService } from '../service-items/service-items.service';
import { CartItemsService } from '../shopping-cart/cart-items.service';
import { ItshopService } from '../itshop/itshop.service';
import { ProjectConfigurationService } from '../project-configuration/project-configuration.service';
import { UserModelService } from '../user/user-model.service';
import { QerApiService } from '../qer-api-client.service';
import { ProductSelectionService } from './product-selection.service';
import { PortalShopCategories, PortalShopServiceitems } from 'imx-api-qer';
import { ShelfService } from '../itshop/shelf.service';
import { MatMenuModule } from '@angular/material/menu';
import { DependencyService } from './optional-items-sidesheet/dependency.service';
import { EntityValue, IEntityColumn } from 'imx-qbm-dbts';

@Component({
  selector: 'imx-servicecategory-list',
  template: '<p>MockServiceCategoryList</p>',
})
class MockServiceCategoryList {
  @Input() selectedServiceCategory: any;
  @Input() recipients: any;
}

@Component({
  selector: 'imx-serviceitem-list',
  template: '<p>MockServiceItemList</p>',
})
class MockServiceItemList {
  @Input() selectedServiceCategory: any;
  @Input() keywords: any;
  @Input() recipients: any;
  @Input() referenceUserUid: any;
  @Input() uidPersonPeerGroup: any;
  @Input() dataSourceView: any;

  public resetKeywords(): void {}
}

@Component({
  selector: 'imx-cdr-editor',
  template: '<p>MockCdrEditor</p>',
})
class MockCdrEditor {
  @Input() cdr: any;
}

describe('ProductSelectionComponent', () => {
  @Component({
    selector: `host-component`,
    template: `<imx-product-selection></imx-product-selection>`,
  })
  class TestHostComponent {
    @ViewChild(ProductSelectionComponent)
    public componentUnderTestComponent: ProductSelectionComponent;
  }

  function createColumn(name: string): IEntityColumn {
    let value: any;
    return {
      ColumnName: name,
      GetValue: () => value,
      PutValue: (newValue) => (value = newValue),
      GetDisplayValue: () => name,
    } as IEntityColumn;
  }

  let testHostComponent: TestHostComponent;
  let testHostFixture: ComponentFixture<TestHostComponent>;

  const dependencyServiceStub = {
    checkForOptionalTree: jasmine.createSpy('checkForOptionalTree').and.returnValue(
      Promise.resolve({
        trees: [],
        totalOptional: 1,
      })
    ),
  };

  const sideSheetHelper = new (class {
    result = undefined;
    readonly sideSheetStub = {
      open: jasmine.createSpy('open').and.returnValue({
        afterClosed: () => of(this.result),
      }),
    };
  })();

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [ProductSelectionComponent, MockCdrEditor, MockServiceCategoryList, MockServiceItemList, TestHostComponent],
      imports: [MatMenuModule, MatCardModule],
      providers: [
        {
          provide: ServiceItemsService,
          useValue: {
            get: jasmine.createSpy('get').and.returnValue(Promise.resolve()),
            getServiceItemsForPersons: jasmine.createSpy('getServiceItemsForPersons').and.returnValue({}),
          },
        },
        {
          provide: ProductSelectionService,
          useValue: {},
        },
        {
          provide: DependencyService,
          useValue: dependencyServiceStub,
        },
        {
          provide: CartItemsService,
          useValue: {
            addItems: jasmine.createSpy('addItems').and.returnValue(Promise.resolve()),
          },
        },
        {
          provide: ItshopService,
          useValue: {},
        },
        {
          provide: ShelfService,
          useValue: {},
        },
        {
          provide: MatDialog,
          useValue: {
            open: jasmine.createSpy('open'),
          },
        },
        {
          provide: EuiSidesheetService,
          useValue: sideSheetHelper.sideSheetStub,
        },
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate'),
          },
        },
        {
          provide: EuiLoadingService,
          useValue: {
            show: jasmine.createSpy('show'),
            hide: jasmine.createSpy('hide'),
          },
        },
        {
          provide: ProjectConfigurationService,
          useValue: {
            getConfig: () => ({
              ITShopConfig: {
                VI_ITShop_AddOptionalProductsOnInsert: false,
              },
              RiskThresholdHigh: 0,
            }),
          },
        },
        {
          provide: EntityService,
          useValue: {
            createLocalEntityColumn: (__0, __1, __2) => ({
              GetValue: () => undefined,
              PutValueStruct: (_) => {},
            }),
          },
        },
        {
          provide: QerApiService,
          useValue: {
            client: {
              getFkProviderItems: (_) => [],
            },
            typedClient: {
              PortalCartitem: {
                createEntity: () => ({
                  UID_PersonOrdered: {
                    GetMetadata: () => ({
                      GetFkRelations: () => undefined,
                    }),
                  },
                  GetEntity: () => ({}),
                }),
                GetSchema: () => ({ Columns: { UID_PersonOrdered: { FkRelation: {} } } }),
              },
              PortalPersonUid: {
                Get: (__) => ({ Data: [] }),
              },
            },
          },
        },
        {
          provide: UserModelService,
          useValue: {
            getUserConfig: () => ({}),
          },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: (__) => undefined } },
          },
        },
        {
          provide: imx_SessionService,
          useValue: {
            getSessionState: () => ({}),
          },
        },
        {
          provide: AuthenticationService,
          useValue: {
            onSessionResponse: of({ UserUid: 'userUid' }),
          },
        },
        {
          provide: SnackBarService,
          useValue: {},
        },
      ],
    });
  });

  beforeEach(() => {
    testHostFixture = TestBed.createComponent(TestHostComponent);
    testHostComponent = testHostFixture.componentInstance;

    // Reset
    sideSheetHelper.sideSheetStub.open.calls.reset();
    dependencyServiceStub.checkForOptionalTree.calls.reset();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', fakeAsync(() => {
    testHostFixture.detectChanges();
    expect(testHostComponent.componentUnderTestComponent).toBeTruthy();
  }));

  describe('reference user', () => {
    const someCategory = {} as PortalShopCategories;
    const someReferenceUser = {
      DataValue: 'some uid',
      DisplayValue: 'some display',
    };

    for (const testcase of [
      { expected: { selectedCategory: someCategory } },
      { selection: {}, expected: { selectedCategory: someCategory } },
      { selection: { candidates: [] }, expected: { selectedCategory: someCategory } },
      {
        selection: {
          candidates: [someReferenceUser],
        },
        expected: {
          referenceUser: someReferenceUser,
          selectedCategory: undefined,
        },
      },
    ]) {
      it('can select reference user', async () => {
        sideSheetHelper.result = testcase.selection;

        testHostFixture.detectChanges();

        const component = testHostComponent.componentUnderTestComponent;

        component.selectedCategory = someCategory;
        component.recipients = new EntityValue(createColumn(''));

        await component.selectReferenceUser();

        expect(component.referenceUser).toEqual(testcase.expected.referenceUser);
        expect(component.selectedCategory).toEqual(testcase.expected.selectedCategory);
      });
    }
  });

  describe('service category', () => {
    const someCategory = {} as PortalShopCategories;

    // it('can select service category', () => {
    //   testHostFixture.detectChanges();

    //   const component = testHostComponent.componentUnderTestComponent;

    //   component.onServiceCategorySelected(someCategory);

    //   expect(component.selectedCategory).toEqual(someCategory);
    // });

    // it('can remove selected service category', () => {
    //   testHostFixture.detectChanges();

    //   const component = testHostComponent.componentUnderTestComponent;

    //   component.serviceCategoryListComponent = {
    //     resetCategory: () => {}
    //   } as ServiceCategoryListComponent;

    //   const resetCategorySpy = spyOn(component.serviceCategoryListComponent, 'resetCategory');

    //   component.selectedCategory = someCategory;

    //   component.onServiceCategorySelected(undefined);

    //   expect(component.selectedCategory).toBeUndefined();

    //   expect(resetCategorySpy).toHaveBeenCalled();
    // });
  });

  describe('selecting optional', () => {
    it('should not open sidesheet', async () => {
      testHostFixture.detectChanges();
      const component = testHostComponent.componentUnderTestComponent;
      component.projectConfig = await component.projectConfigService.getConfig();
      component.recipients = new EntityValue(createColumn(''));

      const serviceItem: PortalShopServiceitems = jasmine.createSpyObj('serviceItem', ['']);
      await component.addItemToCart(serviceItem);
      expect(dependencyServiceStub.checkForOptionalTree).toHaveBeenCalledTimes(0);
      expect(sideSheetHelper.sideSheetStub.open).toHaveBeenCalledTimes(0);
    });

    it('should open sidesheet', async () => {
      // Setup values
      testHostFixture.detectChanges();
      const component = testHostComponent.componentUnderTestComponent;
      component.projectConfig = await component.projectConfigService.getConfig();
      component.projectConfig.ITShopConfig.VI_ITShop_AddOptionalProductsOnInsert = true;

      component.recipients = new EntityValue(createColumn(''));

      const serviceItem: PortalShopServiceitems = jasmine.createSpyObj('serviceItem', ['']);
      await component.addItemToCart(serviceItem);
      expect(dependencyServiceStub.checkForOptionalTree).toHaveBeenCalled();
      expect(sideSheetHelper.sideSheetStub.open).toHaveBeenCalledTimes(1);
    });
  });
});
