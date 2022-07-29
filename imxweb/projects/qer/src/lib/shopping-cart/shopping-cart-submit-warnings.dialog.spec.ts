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
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { configureTestSuite } from 'ng-bullet';

import { clearStylesFromDOM } from 'qbm';
import { ShoppingCartSubmitWarningsDialog } from './shopping-cart-submit-warnings.dialog';
import { CartItemValidationStatus } from './cart-items/cart-item-validation-status.enum';
import { ICartItemCheck } from 'imx-api-qer';

describe('ShoppingCartSubmitWarningsDialog', () => {
    let component: ShoppingCartSubmitWarningsDialog;
    let fixture: ComponentFixture<ShoppingCartSubmitWarningsDialog>;

    configureTestSuite(() =>
        TestBed.configureTestingModule({
            declarations: [
                ShoppingCartSubmitWarningsDialog
            ],
            imports: [
                MatDialogModule
            ],
            providers: [
                {
                    provide: MatDialogRef,
                    useValue: { }
                },
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: { }
                }
            ]
        }).compileComponents()
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(ShoppingCartSubmitWarningsDialog);
        component = fixture.componentInstance;
    });

    afterAll(() => {
        clearStylesFromDOM();
    });

    it('should create', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    [
        {
            check: {
                Status: CartItemValidationStatus.pending,
                Title: 'This check is pending',
                ResultText: 'It runs and runs and runs.'
            },
            expected: { status: 'Pending', icon: 'hourglass_empty'}
        },
        {
            check: {
                Status: CartItemValidationStatus.warning,
                Title: 'This is a warning',
                ResultText: 'Each warning is a warning.'
            },
            expected: { status: 'Warning', icon: 'warning'}
        },
        {
            check: {
                Status: CartItemValidationStatus.error,
                Title: 'This is an error',
                ResultText: 'Each error is an error.'
            },
            expected: { status: 'Error', icon: 'cancel'}
        },
        {
            check: {
                Status: CartItemValidationStatus.disabled,
                Title: 'This check is disabled',
                ResultText: 'It is really disabled.'
            },
            expected: { status: 'Disabled', icon: 'location_disabled'}
        }
    ].forEach(testcase =>
    it(`returns the status and the icon of the check with title= ${testcase.check.Title}`, () => {
        const status = component.getStatus(testcase.check as ICartItemCheck);

        expect(status.icon).toBe(testcase.expected.icon);
        expect(status.status).toBe(testcase.expected.status);
    }));
});
