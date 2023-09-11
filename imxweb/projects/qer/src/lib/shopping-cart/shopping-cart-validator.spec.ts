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

import { ShoppingCartValidator } from './shopping-cart-validator';
import { CartCheckResult, PortalCartitem } from 'imx-api-qer';
import { CartItemValidationStatus } from './cart-items/cart-item-validation-status.enum';

describe('ShoppingCartValidator', () => {
    const checkWithError = {
        Status: CartItemValidationStatus.error,
        Title: 'This is an error',
        ResultText: 'Each error is an error.'
    };

    const resultWithWarningsAndCheckWithError = {
        HasWarnings: true,
        Checks: [checkWithError]
    };

    const resultItemWithoutWarnings = {
        HasWarnings: false,
        Checks: [checkWithError]
    };

    const resultWithWarningsAndCheckWithSuccess = {
        HasWarnings: true,
        Checks: [
            {
                Status: CartItemValidationStatus.success,
                Title: 'This was successful',
                ResultText: 'But success does not last forever.'
            }
        ]
    };

    function getCartItem(_) {
        return {
            UID_PersonOrdered: { Column: { GetDisplayValue: () => undefined } },
            GetEntity: () => ({ GetDisplay: () => undefined })
        } as PortalCartitem;
    }

    [
        {
            CheckResultItems: [resultItemWithoutWarnings],
            expected: { itemsWithWarnings: 0 }
        },
        {
            CheckResultItems: [
                resultItemWithoutWarnings,
                resultWithWarningsAndCheckWithSuccess
            ],
            expected: { itemsWithWarnings: 0 }
        },
        {
            CheckResultItems: [
                resultItemWithoutWarnings,
                resultWithWarningsAndCheckWithSuccess,
                resultWithWarningsAndCheckWithError
            ],
            expected: { itemsWithWarnings: 1 }
        }
    ].forEach(testcase =>
        it('shows only checks with warnings that have CartItemValidationStatus !== Success', () => {
            const validator = new ShoppingCartValidator({ Items: testcase.CheckResultItems } as CartCheckResult);

            const warnings = validator.getWarnings(getCartItem);

            expect(warnings.length).toBe(testcase.expected.itemsWithWarnings);
        })
    );
});
