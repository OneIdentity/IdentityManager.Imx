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

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { configureTestSuite } from 'ng-bullet';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Component, Input, Output, EventEmitter, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { EuiCoreModule, EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';

import { clearStylesFromDOM, MessageDialogResult, SnackBarService } from 'qbm';
import { ShoppingCartComponent } from './shopping-cart.component';
import { CartItemsService } from './cart-items.service';
import { UserModelService } from '../user/user-model.service';
import { ProjectConfigurationService } from '../project-configuration/project-configuration.service';
import { ItshopService } from '../itshop/itshop.service';
import { ItshopPatternCreateService } from '../itshop-pattern/itshop-pattern-create-sidesheet/itshop-pattern-create.service';

@Component({
    selector: 'imx-cart-items',
    template: '<p>MockItShopCartitemsComponent</p>'
})
class MockItShopCartitemsComponent {
    @Input() public shoppingCart: any;
    @Output() public dataChange = new EventEmitter<any>();
}

@Component({
    selector: 'imx-empty-cart',
    template: '<p>MockEmptyCartComponent</p>'
})
class MockEmptyCartComponent {
}

describe('ShoppingCartComponent', () => {
    const shoppingCartData = [
        { UID_ShoppingCartItemParent: { value: 'this is a child' } },
        { UID_ShoppingCartItemParent: { value: '' } },
    ]

    let checkResult: { HasErrors: boolean, HasWarnings: boolean };

    const cartItemsServiceStub = {
        submit: jasmine.createSpy('submit').and.callFake(() => Promise.resolve(checkResult)),
        getItemsForCart: jasmine.createSpy('getItemsForCart').and.returnValue(Promise.resolve({ totalCount: 2, Data: shoppingCartData })),
        removeItems:jasmine.createSpy('removeItems')
    };

    const commitSpy = jasmine.createSpy('Commit');
    const snackBarSpy = jasmine.createSpy('open');

    const candidateData = [
        {
            DocumentNumber: { value: 1 },
            GetEntity: () => ({
                GetKeys: () => ['card 1'],
                GetDisplay: () => '',
                Commit: commitSpy
            })
        }
    ];

    let carts: any;

    const itshopServiceStub = {
        getCarts: jasmine.createSpy('getCarts').and.callFake(() => Promise.resolve(carts)),
        deleteShoppingCart: jasmine.createSpy('deleteShoppingCart').and.returnValue(Promise.resolve()),
    };

    const userModelServiceStub = {
        reloadPendingItems: jasmine.createSpy('ReloadPendingItems')
    }

    const patterCreateServiceStub = {
      createItshopPatternFromShoppingCart: jasmine.createSpy('createItshopPatternFromShoppingCart').and.callThrough(),
    }

    let config : any = {
        ITShopConfig: {}
    };

    const sidesheetServiceStub = {
      open: jasmine.createSpy('open').and.returnValue({
        afterClosed: () => of({})
      })
    };

    let component: ShoppingCartComponent;
    let fixture: ComponentFixture<ShoppingCartComponent>;
    configureTestSuite(() => {
        TestBed.configureTestingModule({
            schemas: [
              CUSTOM_ELEMENTS_SCHEMA
            ],
            imports: [
                EuiCoreModule,
                LoggerTestingModule,
                MatDividerModule,
                MatFormFieldModule,
                MatRadioModule,
                MatSelectModule,
                MatButtonModule,
                MatMenuModule,
                NoopAnimationsModule,
                RouterTestingModule.withRoutes(
                    [
                        { path: 'shoppingcart/empty', component: MockEmptyCartComponent },
                    ]
                ),
            ],
            declarations: [
                ShoppingCartComponent,
                MockItShopCartitemsComponent
            ],
            providers: [
                {
                    provide: EuiLoadingService,
                    useValue: {
                        show: jasmine.createSpy('show'),
                        hide: jasmine.createSpy('hide')
                    }
                },
                {
                    provide: MatDialog,
                    useValue: {
                        open() {
                            return {
                                beforeClosed: () => of(MessageDialogResult.YesResult),
                                afterClosed: () => of(MessageDialogResult.YesResult)
                            };
                        }
                    }
                },
                {
                    provide: SnackBarService,
                    useValue: {
                        open: snackBarSpy
                    }
                },
                {
                    provide: CartItemsService,
                    useValue: cartItemsServiceStub
                },
                {
                  provide: ItshopPatternCreateService,
                  useValue: patterCreateServiceStub
                },
                {
                    provide: UserModelService,
                    useValue: userModelServiceStub
                },
                {
                    provide: ProjectConfigurationService,
                    useValue: {
                        getConfig: jasmine.createSpy('getConfig').and.returnValue(Promise.resolve(config))
                    }
                },
                {
                    provide: ItshopService,
                    useValue: itshopServiceStub
                },
                {
                  provide: EuiSidesheetService,
                  useValue: sidesheetServiceStub
                }
            ]
        });
    });
    beforeEach(() => {
        fixture = TestBed.createComponent(ShoppingCartComponent);
        component = fixture.componentInstance;
        carts = { totalCount: 1, Data: candidateData };
        cartItemsServiceStub.getItemsForCart.calls.reset();
        cartItemsServiceStub.submit.calls.reset();
        cartItemsServiceStub.removeItems.calls.reset();
        commitSpy.calls.reset();
        snackBarSpy.calls.reset();
        itshopServiceStub.getCarts.calls.reset();
        itshopServiceStub.deleteShoppingCart.calls.reset();
    });


    afterAll(() => {
        clearStylesFromDOM();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    for (let testcase of [
        { description: 'with shoppingCarts', dataValue: { totalCount: 1, Data: candidateData }, expectedValue: 2 },
        { description: 'without shoppingcarts', dataValue: { totalCount: 0, Data: [] }, expectedValue: undefined }
    ])
        it(`get data ${testcase.description}`, async () => {
            carts = testcase.dataValue;
            fixture.ngZone.run(async () => {
                await component.ngAfterViewInit();
                if (testcase.expectedValue === 2) {
                    expect(component.selectedItshopCart).toBeDefined();
                    expect(component.shoppingCart.totalCount).toEqual(testcase.expectedValue);
                } else {
                    expect(component.selectedItshopCart).toBeUndefined();
                }

                expect(component.shoppingCart.hasErrors).toEqual(false);
                expect(component.shoppingCart.hasWarnings).toEqual(false);
            });
        });

    it('can handle unselected card', async () => {
        component.selectedItshopCart = undefined;
        fixture.ngZone.run(async () => {
            await component.getData(false);

            expect(component.shoppingCart).toBeDefined();
            expect(component.shoppingCart.totalCount).toEqual(0);
        });
    })

    it('has a shopping cart', async () => {
        await component.getData(true);
        expect(component.selectedItshopCart).toBeDefined();
    });

    it('deletes the cart', async () => {
        await component.ngAfterViewInit();
        await component.deleteCart();
        expect(itshopServiceStub.deleteShoppingCart).toHaveBeenCalledWith('card 1');
    });

    it('saved selected cart', async () => {
        await component.ngAfterViewInit();
        component.saveSelectedCart()
        expect(commitSpy).toHaveBeenCalledWith(true);
    });

    for (let testcase of [
        { description: 'without errors or warning', checkResult: { HasErrors: false, HasWarnings: false }, canBeSubmitted: true },
        { description: 'with warning', checkResult: { HasErrors: false, HasWarnings: true }, canBeSubmitted: true },
        { description: 'with erors', checkResult: { HasErrors: true, HasWarnings: false }, canBeSubmitted: false },
        { description: 'with errors and warnings', checkResult: { HasErrors: true, HasWarnings: true }, canBeSubmitted: false }
    ]) {
        it(`validates data ${testcase.description}`, async () => {
            checkResult = testcase.checkResult;
            config = { ITShopConfig: {} };
            await component.ngAfterViewInit();
            await component.validate();
            expect(snackBarSpy).toHaveBeenCalledWith( {
                    key: testcase.canBeSubmitted ? '#LDS#Your shopping cart may be submitted.' :
                        '#LDS#At least one request cannot be submitted.'
                },
                '#LDS#Close');
        });
    }

    for (let testcase of [
        { description: 'submits the shopping cart', checkResult: { HasErrors: false, HasWarnings: false }, calledTimes: 2 },
        { description: 'submits the shopping cart', checkResult: { HasErrors: false, HasWarnings: true }, calledTimes: 2 },
        { description: 'do not submits the shopping cart', checkResult: { HasErrors: true, HasWarnings: false }, calledTimes: 1 }
    ]) {
        it(testcase.description, async () => {
            checkResult = { ...testcase.checkResult, ...{ Items: [] } };
            await component.ngOnInit();
            await component.ngAfterViewInit();
            await component.submitShoppingCart();
            expect(cartItemsServiceStub.submit).toHaveBeenCalledTimes(testcase.calledTimes);
        });
    }
});
