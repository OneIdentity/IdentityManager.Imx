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

import { ErrorHandler } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { of } from 'rxjs';

import { CartItemsService } from './cart-items.service';
import { CheckMode, PortalCartitem, RequestableProductForPerson } from 'imx-api-qer';
import { TypedEntity } from 'imx-qbm-dbts';
import { QerApiService } from '../qer-api-client.service';
import { ParameterDataService } from '../parameter-data/parameter-data.service';
import { CartItemInteractiveService } from './cart-item-edit/cart-item-interactive.service';

describe('CartItemsService', () => {
  function createItem(key: string, parent?: string) {
    return {
      GetEntity: () => ({
        GetKeys: () => [key],
        GetDisplay: () => undefined,
        Commit: _ => Promise.resolve()
      }),
      UID_PersonOrdered: {},
      UID_ITShopOrg: {},
      OrderReason: {},
      PWOPriority: {},
      RequestType: {},
      UID_ShoppingCartItemParent: { value: parent },
      UID_AccProduct: { value: key },
      RoleMembership: {}
    } as PortalCartitem;
  }

  let service: CartItemsService;

  let onEditMandatoryPropertiesClose = () => true;

  const errorHandlerStub = {
    handleError: jasmine.createSpy('handleError')
  };

  const mockCheck = {};

  interface fakeItem {
    key: string,
    parent?: string,
    cartKey?: string
  }

  class FakeServer {
    readonly root = { key: 'a', parent: undefined };
    readonly itemWithParentAndChild = { key: 'b', parent: 'a' };
    readonly itemWithParent = { key: 'c', parent: 'b' };

    get numOfItems(): number { return this.items.length; }

    get numOfItemsInCart(): number { return this.items.filter(item => item.cartKey).length; }

    private items: fakeItem[] = [this.root, this.itemWithParentAndChild, this.itemWithParent];;

    private readonly someCartKey = 'someCartKey';

    set(items: fakeItem[]) { this.items = items; }

    setCart() { this.items.forEach(item => item.cartKey = this.someCartKey); }

    delete(key: string): void {
      const itemWithDescendants = this.withDescendants(this.getItem(key));
      this.items = this.items.filter(item => itemWithDescendants.find(child => child.key === item.key) == null);
    }

    move(key: string, opts: { tocart: boolean }): void {
      const itemWithDescendants = this.withDescendants(this.getItem(key));
      this.items.forEach(item => {
        if (itemWithDescendants.find(child => child.key === item.key)) {
          if (opts?.tocart && item.cartKey) {
            throw Error('item with key ' + key + ' already in cart');
          }

          if (!opts?.tocart && item.cartKey == null) {
            throw Error('item with key ' + key + ' already in for later list');
          }

          item.cartKey = opts?.tocart ? this.someCartKey : undefined;
        }
      });
    }

    filter(key: string, selected: fakeItem[]): boolean {
      const fakeItem = this.getItem(key, false);
      return fakeItem && !this.getNextSelectedAncestor(fakeItem, selected);
    }

    private getNextSelectedAncestor(item: fakeItem, selected: fakeItem[]): boolean {
      const parent = this.getItem(item.parent, false);

      if (parent == null) {
        return false;
      }

      if (selected.find(item => item.key === parent.key)) {
        return true;
      }

      return this.getNextSelectedAncestor(parent, selected);
    }

    private getItem(key: string, errorOnNotFound = true): fakeItem {
      const item = this.items.find(child => child.key === key);
      if (errorOnNotFound && item == null) {
        throw Error('item with key ' + key + ' not found');
      }
      return item;
    }

    private withDescendants(item: fakeItem): fakeItem[] {
      const items = [item];
      this.items
        .filter(child => child.parent != null && child.parent === item.key)
        .forEach(child => this.withDescendants(child).forEach(c => items.push(c)));
      return items;
    }
  }

  let fakeServer = new FakeServer();

  const cartItemInteractiveService = {
    getExtendedEntity: jasmine.createSpy('getExtendedEntity'),
    commitExtendedEntity: jasmine.createSpy('commitExtendedEntity')
  };

  const qerApiStub = {
    client: {
      portal_cartitem_delete: jasmine.createSpy('portal_cartitem_delete').and.
        callFake((uid: string) => {
          fakeServer.delete(uid);
          return Promise.resolve();
        }),
      portal_cartitem_move_post: jasmine.createSpy('portal_cartitem_move_post').and.
        callFake((uid: string, opts: { tocart: boolean }) => {
          fakeServer.move(uid, opts);
          return Promise.resolve({});
        }),
      portal_cart_submit_post: jasmine.createSpy('portal_cart_submit_post').and.returnValue(Promise.resolve(mockCheck))
    },
    typedClient: {
      PortalCartitem: {
        Get: jasmine.createSpy('Get').and.returnValue(Promise.resolve({})),
        Post: jasmine.createSpy('Post').and.callFake(typedEntity => Promise.resolve({
          totalCount: 1,
          Data: [typedEntity],
          extendedData: {
            Parameters: {
              someParameterCategory: [
                [
                  {
                    Value: {},
                    Property: { MinLen: 1 }
                  }
                ]
              ]
            }
          }
        })),
        createEntity: jasmine.createSpy('createEntity').and.returnValue(createItem('p1'))
      }
    }
  };

  const parameterDataService = {
    hasParameters: __ => false
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerTestingModule
      ],
      providers: [
        {
          provide: EuiLoadingService,
          useValue: {
            hide: jasmine.createSpy('hide')
          }
        },
        CartItemsService,
        {
          provide: QerApiService,
          useValue: qerApiStub
        },
        {
          provide: EuiSidesheetService,
          useValue: {
            open: jasmine.createSpy('open').and.returnValue({
              afterClosed: () => of(onEditMandatoryPropertiesClose())
            })
          }
        },
        {
          provide: ErrorHandler,
          useValue: errorHandlerStub
        },
        {
          provide: ParameterDataService,
          useValue: parameterDataService
        },
        {
          provide: CartItemInteractiveService,
          useValue: cartItemInteractiveService
        }
      ]
    });
    service = TestBed.inject(CartItemsService);
  });

  beforeEach(() => {
    fakeServer = new FakeServer();

    errorHandlerStub.handleError.calls.reset();

    qerApiStub.client.portal_cartitem_delete.calls.reset();
    qerApiStub.client.portal_cartitem_move_post.calls.reset();
    qerApiStub.client.portal_cart_submit_post.calls.reset();
    qerApiStub.typedClient.PortalCartitem.Get.calls.reset();
    qerApiStub.typedClient.PortalCartitem.Post.calls.reset();
    qerApiStub.typedClient.PortalCartitem.createEntity.calls.reset();

    cartItemInteractiveService.getExtendedEntity.calls.reset();
    cartItemInteractiveService.commitExtendedEntity.calls.reset();

    onEditMandatoryPropertiesClose = () => true;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('gets interactive cart item', async () => {
    const uid = 'some uid';

    await service.getInteractiveCartitem(uid);

    expect(cartItemInteractiveService.getExtendedEntity).toHaveBeenCalledWith(uid);
  });

  it('can addItemsFromRoles', async () => {
    await service.addItemsFromRoles(['some role id'], ['some recipient id']);
    expect(qerApiStub.typedClient.PortalCartitem.Post).toHaveBeenCalled();
  });

  it('has a get method', async () => {
    expect(await service.getItemsForCart(null)).toBeDefined();
    expect(qerApiStub.typedClient.PortalCartitem.Get).toHaveBeenCalled();
  });

  it('has a submit method', async () => {
    expect(await service.submit('', CheckMode.CheckOnly)).toBeDefined();
  });

  it('has an add method', async () => {
    const serviceItem: RequestableProductForPerson = {
      UidAccProduct: 'p1',
      UidPerson: 'a',
      UidITShopOrg: 'shelf1',
    };

    const serviceItemChild: RequestableProductForPerson = {
      UidAccProduct: 'p2',
      UidPerson: 'a',
      UidITShopOrg: 'shelf1',
    };

    spyOn<any>(service, 'editItems');
    const items = [serviceItem, serviceItemChild];
    await service.addItems(items);
    expect(qerApiStub.typedClient.PortalCartitem.createEntity).toHaveBeenCalledTimes(items.length);
    expect(qerApiStub.typedClient.PortalCartitem.Post).toHaveBeenCalledTimes(items.length);
  });

  // TODO: Revist when cart has been restructured
  // it ('sorts children to back items', async () => {
  //   const serviceItem: RequestableProductForPerson = {
  //     UidAccProduct: 'p1',
  //     UidPerson: 'a',
  //     UidITShopOrg: 'shelf1',
  //     UidAccProductParent: 'p2'
  //   };

  //   const serviceItemChild: RequestableProductForPerson = {
  //     UidAccProduct: 'p2',
  //     UidPerson: 'a',
  //     UidITShopOrg: 'shelf1',
  //   };

  //   spyOn<any>(service, 'editItems');
  //   const items = [serviceItem, serviceItemChild];
  //   await service.addItems(items);
  //   expect(qerApiStub.typedClient.PortalCartitem.createEntity).toHaveBeenCalledTimes(items.length);
  //   expect(qerApiStub.typedClient.PortalCartitem.Post).toHaveBeenCalledTimes(items.length);
  // });

  // it ('should abort since the parent is not here', async () => {
  //   const serviceItem: RequestableProductForPerson = {
  //     UidAccProduct: 'p1',
  //     UidPerson: 'a',
  //     UidITShopOrg: 'shelf1',
  //     UidAccProductParent: 'not here'
  //   };

  //   const serviceItemChild: RequestableProductForPerson = {
  //     UidAccProduct: 'p2',
  //     UidPerson: 'a',
  //     UidITShopOrg: 'shelf1',
  //   };

  //   spyOn<any>(service, 'editItems');
  //   const items = [serviceItem, serviceItemChild];
  //   await service.addItems(items);
  //   expect(errorHandlerStub.handleError).toHaveBeenCalled();
  //   expect(qerApiStub.typedClient.PortalCartitem.createEntity).toHaveBeenCalledTimes(0);
  //   expect(qerApiStub.typedClient.PortalCartitem.Post).toHaveBeenCalledTimes(0);
  // });

  [
    { doSave: true },
    { doSave: false }
  ].forEach(testcase =>
    it('has an add method with the possibility to skip items that have mandatory request parameters', async () => {
      onEditMandatoryPropertiesClose = () => testcase.doSave;

      const serviceItem = {
        UID_AccProduct: 'p1',
        UidPerson: 'a',
        UidITShopOrg: 'shelf1'
      };
      const items = [serviceItem];

      fakeServer.set(items.map(item => ({ key: item.UID_AccProduct })));

      spyOn<any>(service, 'editItems');

      await service.addItems(items);

      expect(qerApiStub.typedClient.PortalCartitem.createEntity).toHaveBeenCalledTimes(items.length);
      expect(qerApiStub.typedClient.PortalCartitem.Post).toHaveBeenCalledTimes(items.length);
    }));

  it('has a save method', async () => {
    const wrapper = {
      typedEntity: { } as TypedEntity,
      parameterCategoryColumns: []
    };

    await service.save(wrapper);

    expect(cartItemInteractiveService.commitExtendedEntity).toHaveBeenCalledWith(
      wrapper
    );
  });

  for (const testcase of [
    { selectedItems: [fakeServer.root], expectedNumOfremainingItems: 0 },
    { selectedItems: [fakeServer.itemWithParentAndChild], expectedNumOfremainingItems: 1 },
    { selectedItems: [fakeServer.itemWithParent], expectedNumOfremainingItems: 2 },
    { selectedItems: [fakeServer.itemWithParent, fakeServer.itemWithParentAndChild], expectedNumOfremainingItems: 1 },
    { selectedItems: [fakeServer.root, fakeServer.itemWithParent], expectedNumOfremainingItems: 0 },
    { selectedItems: [fakeServer.itemWithParent, fakeServer.root], expectedNumOfremainingItems: 0 },
    { selectedItems: [fakeServer.itemWithParent, fakeServer.itemWithParentAndChild, fakeServer.root], expectedNumOfremainingItems: 0 },
    { selectedItems: [fakeServer.itemWithParentAndChild, fakeServer.itemWithParent, fakeServer.root], expectedNumOfremainingItems: 0 },
    { selectedItems: [fakeServer.root, fakeServer.itemWithParent, fakeServer.itemWithParentAndChild], expectedNumOfremainingItems: 0 },
  ]) {
    it('has a remove method that handles relationships between the items (' + testcase.selectedItems.map(item => item.key).join(',') + ')', async () => {
      const filter = cartItem => fakeServer.filter(cartItem.GetEntity().GetKeys()[0], testcase.selectedItems);

      await service.removeItems(testcase.selectedItems.map(item => createItem(item.key, item.parent)), filter);

      expect(qerApiStub.client.portal_cartitem_delete).toHaveBeenCalledTimes(1);
      expect(errorHandlerStub.handleError).not.toHaveBeenCalled();
      expect(fakeServer.numOfItems).toEqual(testcase.expectedNumOfremainingItems);
    })
  }

  it('has a remove method that handles errors', async () => {
    await service.removeItems([createItem('uid for some non-existing item')]);

    expect(qerApiStub.client.portal_cartitem_delete).toHaveBeenCalledTimes(1);
    expect(errorHandlerStub.handleError).toHaveBeenCalled();
  });

  const testcases = [
    { selectedItems: [fakeServer.root], expecedMove: true },
    { selectedItems: [fakeServer.itemWithParentAndChild], expecedMove: false },
    { selectedItems: [fakeServer.itemWithParent, fakeServer.itemWithParentAndChild], expecedMove: false },
    { selectedItems: [fakeServer.root, fakeServer.itemWithParentAndChild], expecedMove: true },
    { selectedItems: [fakeServer.root, fakeServer.itemWithParent], expecedMove: true },
    { selectedItems: [fakeServer.itemWithParent, fakeServer.root], expecedMove: true },
    { selectedItems: [fakeServer.itemWithParent, fakeServer.itemWithParentAndChild, fakeServer.root], expecedMove: true },
    { selectedItems: [fakeServer.itemWithParentAndChild, fakeServer.itemWithParent, fakeServer.root], expecedMove: true },
    { selectedItems: [fakeServer.root, fakeServer.itemWithParent, fakeServer.itemWithParentAndChild], expecedMove: true },
  ];

  for (const testcase of testcases) {
    it('has a move to cart method (' + testcase.selectedItems.map(item => item.key).join(',') + ')', async () => {
      await service.moveToCart(testcase.selectedItems.map(item => createItem(item.key, item.parent)));
      expect(fakeServer.numOfItemsInCart).toEqual(testcase.expecedMove ? fakeServer.numOfItems : 0);

      expect(qerApiStub.client.portal_cartitem_move_post).toHaveBeenCalledTimes(testcase.expecedMove ? 1 : 0);
      expect(errorHandlerStub.handleError).not.toHaveBeenCalled();
    });
  }

  for (const testcase of testcases) {
    it('has a move to for later method (' + testcase.selectedItems.map(item => item.key).join(',') + ')', async () => {
      fakeServer.setCart();
      await service.moveToLater(testcase.selectedItems.map(item => createItem(item.key, item.parent)));
      expect(fakeServer.numOfItemsInCart).toEqual(testcase.expecedMove ? 0 : fakeServer.numOfItems);

      expect(qerApiStub.client.portal_cartitem_move_post).toHaveBeenCalledTimes(testcase.expecedMove ? 1 : 0);
      expect(errorHandlerStub.handleError).not.toHaveBeenCalled();
    });
  }
});
