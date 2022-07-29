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

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { configureTestSuite } from 'ng-bullet';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { EuiCoreModule, EuiLoadingService } from '@elemental-ui/core';
import { LoggerTestingModule } from 'ngx-logger/testing';

import { clearStylesFromDOM, ConfirmationService } from 'qbm';
import { ShoppingCartForLaterComponent } from './shopping-cart-for-later.component';
import { CartItemsService } from '../cart-items.service';

@Component({
  selector: 'imx-cart-items',
  template: '<p>MockItShopCartitemsComponent</p>'
})
class MockItShopCartitemsComponent {
  @Input() public shoppingCart: any;
  @Input() public forLater: any;
  @Output() public dataChange = new EventEmitter<any>();
}

describe('ShoppingCartForLaterComponent', () => {
  let component: ShoppingCartForLaterComponent;
  let fixture: ComponentFixture<ShoppingCartForLaterComponent>;

  const forLaterData = [
    { UID_ShoppingCartItemParent: { value: 'this is a child' } },
    { UID_ShoppingCartItemParent: { value: '' } }
  ]

  const cartItemsServiceStub = {
    removeItems: jasmine.createSpy('removeItems').and.returnValue(Promise.resolve()),
    getItemsForCart: jasmine.createSpy('getItemsForCart').and.returnValue(Promise.resolve({ totalCount: 2, Data: forLaterData }))
  };

  let confirm = true;
  const mockConfirmationService = {
    confirm: jasmine.createSpy('confirm')
      .and.callFake(() => Promise.resolve(confirm))
  }

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [
        EuiCoreModule,
        MatCardModule,
        MatMenuModule,
        MatButtonModule,
        MatDividerModule,
        LoggerTestingModule
      ],
      declarations: [
        ShoppingCartForLaterComponent,
        MockItShopCartitemsComponent],
      providers: [
        {
          provide: ConfirmationService,
          useValue: mockConfirmationService
        },
        {
          provide: EuiLoadingService,
          useValue: {
            show: jasmine.createSpy('show'),
            hide: jasmine.createSpy('hide')
          }
        },
        {
          provide: CartItemsService,
          useValue: cartItemsServiceStub
        },
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate')
          }
        }
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShoppingCartForLaterComponent);
    component = fixture.componentInstance;
    cartItemsServiceStub.removeItems.calls.reset();
    cartItemsServiceStub.getItemsForCart.calls.reset();
    mockConfirmationService.confirm.calls.reset();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('gets data, after the view is initialized', async () => {
    await component.ngAfterViewInit();
    expect(component.shoppingCart.totalCount).toEqual(2);
  });

  it('gets data', async () => {
    await component.getData();
    expect(component.shoppingCart.totalCount).toEqual(2);
  });

  describe('removes items', () => {
    for (const testcase of [
      { confirm: true },
      { confirm: false }
    ]) {
      it(`${testcase.confirm ? 'should' : ' shouldn\'t'} be started, because the user ${testcase.confirm ? 'has' : 'has not'} confirmed the dialog`, 
      async () => {
        confirm = testcase.confirm;
        await component.getData();
        await component.clearForLaterList();

        if(testcase.confirm) {
          expect(cartItemsServiceStub.removeItems).toHaveBeenCalledWith([forLaterData[1]]);
        } else {
          expect(cartItemsServiceStub.removeItems).not.toHaveBeenCalled();
        }  
      });
    }
  });
});
