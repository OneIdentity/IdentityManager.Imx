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
 * Copyright 2023 One Identity LLC.
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

import { SimpleChange } from '@angular/core';
import { fakeAsync, flush, tick } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { EuiSidesheetService } from '@elemental-ui/core';
import { MockBuilder, MockedComponentFixture, MockRender, ngMocks } from 'ng-mocks';

import { ExtendedTypedEntityCollection } from 'imx-qbm-dbts';
import { clearStylesFromDOM } from 'qbm';
import { CartItemsComponent } from './cart-items.component';
import { CartItemsService } from '../cart-items.service';
import { PortalCartitem, CartItemDataRead } from 'imx-api-qer';
import { ShoppingCart } from '../shopping-cart';
import { CartItemCheckStatus } from './cart-item-check-status.enum';
import { CartItemEditComponent } from '../cart-item-edit/cart-item-edit.component';
import { CartItemCloneService } from '../cart-item-edit/cart-item-clone.service';
import { ShoppingCartModule } from '../shopping-cart.module';
import { QerDefaultMocks } from '../../../default-mocks.spec';

describe('CartItemsComponent', () => {
  let component: CartItemsComponent;
  let fixture: MockedComponentFixture<CartItemsComponent>;

  const getInteractiveCartitem = new (class {
    readonly cartItemKey = 'some key';

    readonly cartItem = {
      OrderReason: { Column: { ColumnName: 'OrderReason' } },
      PWOPriority: { Column: { ColumnName: 'PWOPriority' } },
      CanCopy: { value: true },
      UID_ShoppingCartItemParent: { value: '' },
      Assignment: { value: '' },
      UID_PersonWantsOrg: { value: '' },
      UID_PersonOrdered: {
        GetMetadata: () => ({ GetFkRelations: () => undefined }),
        Column: { GetDisplayValue: () => 'personOrdered' },
      },
      UID_AccProduct: { Column: { GetDisplayValue: () => 'myProduct' } },
      UID_ITShopOrg: {},
      GetEntity: () => ({
        GetDisplay: () => 'myEntity',
        GetKeys: () => [this.cartItemKey],
      }),
    } as PortalCartitem;

    readonly method = jasmine.createSpy('getInteractiveCartitem').and.returnValue(
      Promise.resolve({
        typedEntity: this.cartItem,
        Parameters: {},
        index: 0,
      })
    );
  })();

  const cartItemsServiceStub = {
    PortalCartitemSchema: PortalCartitem.GetEntitySchema(),
    moveToCart: jasmine.createSpy(),
    moveToLater: jasmine.createSpy(),
    save: jasmine.createSpy(),
    getInteractiveCartitem: getInteractiveCartitem.method,
  };

  const cartitemCloneService = {
    cloneItemForPersons: jasmine.createSpy(),
  };

  beforeEach(() => {
    return MockBuilder(
      [
        CartItemsComponent,
        RouterModule,
        RouterTestingModule.withRoutes([]),
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateFakeLoader,
          },
        }),
      ],
      ShoppingCartModule
    )
      .mock(Router, { export: true })
      .mock(EuiSidesheetService)
      .mock(CartItemCloneService, cartitemCloneService)
      .mock(CartItemsService, cartItemsServiceStub);
  });

  beforeEach(() => {
    fixture = MockRender(CartItemsComponent);
    component = fixture.point.componentInstance;
    cartItemsServiceStub.moveToCart.calls.reset();
    cartItemsServiceStub.moveToLater.calls.reset();
    cartItemsServiceStub.save.calls.reset();
    QerDefaultMocks.sidesheetServiceStub.open.calls.reset();
    cartitemCloneService.cloneItemForPersons.calls.reset();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toEqual(jasmine.any(CartItemsComponent));
  });

  [
    { isForLater: false, expectCheckResult: true },
    { isForLater: true, expectCheckResult: false },
  ].forEach((element) => {
    it('initialized its data and add checkResultColumn, to shoppingcart', async () => {
      ngMocks.flushTestBed();
      component = MockRender(CartItemsComponent, { ...{ forLater: element.isForLater, shoppingCart: null } }).point.componentInstance;

      if (element.expectCheckResult) {
        expect(component.displayedColumns[2]).toEqual(component.entitySchema.Columns.CheckResult);
      } else {
        expect(component.displayedColumns[2]).not.toEqual(component.entitySchema.Columns.CheckResult);
      }
    });
  });

  for (const testcase of [
    { isForLater: false, expected: 'check' },
    { isForLater: true, expected: 'check' },
  ]) {
    it('removes selected cartItems', async () => {
      component.forLater = testcase.isForLater;

      const Data = [] as PortalCartitem[];

      component.shoppingCart = new ShoppingCart({
        totalCount: Data.length,
        Data,
      });

      spyOn(component.dataChange, 'emit');
      spyOn<any>(component, 'removeRequests');

      const items = [{ UID_ShoppingCartItemParent: {} } as PortalCartitem];

      component.onSelectionChanged(items);

      await component.removeSelectedItems();

      expect(component['removeRequests']).toHaveBeenCalledWith(items, false);
    });
  }

  function createCartItem(key: string, parent?: string, optionalChild?: boolean): PortalCartitem {
    return {
      UID_ShoppingCartItemParent: { value: parent },
      IsOptionalChild: { value: optionalChild },
      GetEntity: () => ({
        GetKeys: () => [key],
        DiscardChanges: () => Promise.resolve(),
      }),
    } as PortalCartitem;
  }

  const items = {
    independent: {
      UID_ShoppingCartItemParent: { value: undefined },
      GetEntity: () => ({ GetKeys: () => ['key0'] }),
    } as PortalCartitem,
    orphan: {
      UID_ShoppingCartItemParent: { value: 'keyparent2' },
      GetEntity: () => ({ GetKeys: () => ['key3'] }),
    } as PortalCartitem,
    child: {
      UID_ShoppingCartItemParent: { value: 'keyParent1' },
      IsOptionalChild: { value: false },
      GetEntity: () => ({ GetKeys: () => ['key1'] }),
    } as PortalCartitem,
    childOptional: {
      UID_ShoppingCartItemParent: { value: 'keyParent1' },
      IsOptionalChild: { value: true },
      GetEntity: () => ({ GetKeys: () => ['key2'] }),
    } as PortalCartitem,
    parent: createCartItem('keyParent1'),
    keyUndefined: {
      UID_ShoppingCartItemParent: { value: undefined },
      GetEntity: () => ({ GetKeys: () => [undefined] }),
    } as PortalCartitem,
    keyZeroLength: {
      UID_ShoppingCartItemParent: { value: undefined },
      GetEntity: () => ({ GetKeys: () => [''] }),
    } as PortalCartitem,
  };

  [
    {
      itemsSelected: undefined,
      canBeDeleted: false,
    },
    {
      itemsSelected: [],
      canBeDeleted: false,
    },
    {
      itemsSelected: [items.child],
      canBeDeleted: false,
    },
    {
      itemsSelected: [items.childOptional],
      canBeDeleted: true,
    },
    {
      itemsSelected: [items.independent],
      canBeDeleted: true,
    },
    {
      itemsSelected: [items.orphan],
      canBeDeleted: true,
    },
    {
      itemsSelected: [items.keyUndefined],
      canBeDeleted: false,
    },
    {
      itemsSelected: [items.keyZeroLength],
      canBeDeleted: true,
    },
  ].forEach((testcase) =>
    it(
      'has a method that verifies if the selected cartItems can be deleted, itemsSelected=' +
        (testcase.itemsSelected && testcase.itemsSelected.length > 0
          ? testcase.itemsSelected.map((item) => item.GetEntity().GetKeys()[0])
          : ''),
      () => {
        const Data = [items.child, items.childOptional, items.parent] as PortalCartitem[];
        component.shoppingCart = new ShoppingCart({
          totalCount: Data.length,
          Data,
        });
        component.onSelectionChanged(testcase.itemsSelected);
        expect(component.itemsCanBeDeleted()).toEqual(testcase.canBeDeleted);
      }
    )
  );

  [
    { shoppingCartData: undefined, errors: false, warnings: false },
    {
      shoppingCartData: {
        totalCount: 1,
        Data: [items.independent],
        extendedData: {
          CheckResults: [{ UidShoppingCartItem: 'key0', HasErrors: true, HasWarnings: true }],
        },
      },
      errors: true,
      warnings: true,
    },
    {
      shoppingCartData: {
        totalCount: 2,
        Data: [items.parent, items.child, items.childOptional],
        extendedData: {
          CheckResults: [
            { UidShoppingCartItem: 'keyParent1', HasErrors: false, HasWarnings: false },
            { UidShoppingCartItem: 'key1', HasErrors: false, HasWarnings: false },
            { UidShoppingCartItem: 'key2', HasErrors: false, HasWarnings: false },
          ],
        },
      },
      errors: false,
      warnings: false,
    },
  ].forEach((testcase) => {
    it('ngOnChanges updates cart', () => {
      component.shoppingCart = testcase.shoppingCartData
        ? new ShoppingCart(testcase.shoppingCartData as ExtendedTypedEntityCollection<PortalCartitem, CartItemDataRead>)
        : undefined;

      component.ngOnChanges({
        shoppingCart: new SimpleChange(null, 'gesetzt', false),
      });

      fixture.detectChanges();
      if (testcase.shoppingCartData != null) {
        expect(component.dstSettings.dataSource.totalCount).toEqual(testcase.shoppingCartData.totalCount);
      } else {
        expect(component.dstSettings).toBeUndefined();
      }
    });
  });

  it('ngOnChanges should do nothing, when there is no shoppingcart-change', () => {
    component.ngOnChanges({});

    expect(component.dstSettings).toBeUndefined();
  });

  for (const testcase of [
    {
      description: 'close the CartItemEditComponent sidesheet with true',
      doSaveCartItem: true,
      isForLater: true,
    },
    {
      description: 'close the CartItemEditComponent sidesheet with true',
      doSaveCartItem: true,
      isForLater: false,
    },
    {
      description: 'close the CartItemEditComponent sidesheet with false',
      doSaveCartItem: false,
      isForLater: true,
    },
    {
      description: 'close the CartItemEditComponent sidesheet with false',
      doSaveCartItem: false,
      isForLater: false,
    },
  ]) {
    it(`opens the CartItemEditComponent sidesheet with the correct data (forLater:${testcase.isForLater}) and ${testcase.description}`, fakeAsync(() => {
      ngMocks.flushTestBed();
      component = MockRender(CartItemsComponent, { ...{ forLater: testcase.isForLater, shoppingCart: null } }).point.componentInstance;

      // Arrange
      const dataChangeEmitSpy = spyOn(component.dataChange, 'emit');

      const cartitemInteractive = getInteractiveCartitem.cartItem;

      // Act

      // to edit the cartitem open the dialog
      component.editCartItem(cartitemInteractive);
      tick();

      // verify open call to CartItemEditComponent dialog
      expect(QerDefaultMocks.sidesheetServiceStub.open).toHaveBeenCalledWith(
        CartItemEditComponent,
        jasmine.objectContaining({
          subTitle: `${cartitemInteractive.GetEntity().GetDisplay()} - ${cartitemInteractive.UID_PersonOrdered.Column.GetDisplayValue()}`,
          data: jasmine.objectContaining({ cloneItem: testcase.isForLater ? undefined : jasmine.any(Function) }),
        })
      );

      const cloneItemFunction = QerDefaultMocks.sidesheetServiceStub.open.calls.mostRecent().args[1].data.cloneItem;
      if (cloneItemFunction) {
        // if the item can be clone, call it to test cloning
        cloneItemFunction();
      }

      // and now close the dialog
      QerDefaultMocks.afterClosedSubject.next(testcase.doSaveCartItem);

      if (testcase.doSaveCartItem) {
        expect(cartItemsServiceStub.save).toHaveBeenCalled();
      } else if (!testcase.isForLater) {
        expect(cartitemCloneService.cloneItemForPersons).toHaveBeenCalled();

        expect(dataChangeEmitSpy).toHaveBeenCalledWith(false);
      }

      // to terminate the two timeouts
      flush();
    }));
  }

  it('moves selected cartItems to cart', async () => {
    spyOn(component.dataChange, 'emit');

    const items = [{} as PortalCartitem];

    component.onSelectionChanged(items);

    await component.moveSelectedToCart();

    expect(cartItemsServiceStub.moveToCart).toHaveBeenCalledWith(items);
    expect(cartItemsServiceStub.moveToLater).not.toHaveBeenCalled();
  });

  it('moves selected cartItems to later', async () => {
    spyOn(component.dataChange, 'emit');

    const items = [{} as PortalCartitem];

    component.onSelectionChanged(items);

    await component.moveSelectedToLater();

    expect(cartItemsServiceStub.moveToLater).toHaveBeenCalledWith(items);
    expect(cartItemsServiceStub.moveToCart).not.toHaveBeenCalled();

    expect(component.dataChange.emit).toHaveBeenCalled();
  });

  [
    {
      items: undefined,
      itemsNotSelected: [],
      canBeMoved: false,
    },
    {
      items: [],
      itemsNotSelected: [],
      canBeMoved: false,
    },
    {
      items: [createCartItem('uid for item with parent that does not exist', 'some parent uid')],
      itemsNotSelected: [],
      canBeMoved: true,
    },
    {
      items: [
        createCartItem('some parent uid'),
        createCartItem('uid for another item with selected parent', 'uid for item with selected parent'),
        createCartItem('uid for item with selected parent', 'some parent uid'),
      ],
      itemsNotSelected: [],
      canBeMoved: true,
    },
    {
      items: [
        createCartItem('some parent uid'),
        createCartItem('uid for another item with non-selected parent', 'uid for item with selected parent'),
      ],
      itemsNotSelected: [createCartItem('uid for item with selected parent', 'some parent uid')],
      canBeMoved: true,
    },
    {
      items: [createCartItem('uid for item with non-selected parent', 'some parent uid')],
      itemsNotSelected: [createCartItem('some parent uid')],
      canBeMoved: false,
    },
    {
      items: [createCartItem('uid for item without parent')],
      itemsNotSelected: [],
      canBeMoved: true,
    },
    {
      items: [createCartItem('')],
      itemsNotSelected: [],
      canBeMoved: true,
    },
    {
      items: [createCartItem(undefined)],
      itemsNotSelected: [],
      canBeMoved: false,
    },
  ].forEach((testcase) =>
    it(
      'has a method that verifies if the selected cartItems can be moved ' +
        (testcase.items
          ? ' numberOfItems=' + testcase.items.length + ', items: ' + testcase.items.map((item) => item.GetEntity().GetKeys()[0])
          : ''),
      () => {
        const Data = testcase.itemsNotSelected.concat(testcase.items);
        component.shoppingCart = new ShoppingCart({
          totalCount: Data.length,
          Data,
        });
        component.onSelectionChanged(testcase.items);
        expect(component.itemsCanBeMoved()).toEqual(testcase.canBeMoved);
      }
    )
  );

  [
    { description: 'is parent item', item: items.parent, expected: true },
    { description: 'is mandatory child', item: items.child, expected: false },
    { description: 'is optional child', item: items.childOptional, expected: true },
  ].forEach((testcase) =>
    it(`checks if items are selectable with condition: ${testcase.description}`, () => {
      var evt = { item: testcase.item, selectableRows: [] };
      component.itemSelectable(evt);
      expect(evt.selectableRows[0]).toEqual(testcase.expected);
    })
  );

  [
    { description: 'ok', cartItem: { CheckResult: { value: CartItemCheckStatus.ok } } as PortalCartitem, expected: 'check' },
    {
      description: 'not checked',
      cartItem: { CheckResult: { value: CartItemCheckStatus.notChecked } } as PortalCartitem,
      expected: 'question',
    },
    { description: 'error', cartItem: { CheckResult: { value: CartItemCheckStatus.error } } as PortalCartitem, expected: 'error' },
    { description: 'warning', cartItem: { CheckResult: { value: CartItemCheckStatus.warning } } as PortalCartitem, expected: 'warning' },
  ].forEach((testcase) => {
    it(`get the right icon for status: ${testcase.description}`, () => {
      expect(component.getCheckStatusIcon(testcase.cartItem)).toEqual(testcase.expected);
    });
  });
});
