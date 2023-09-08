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

import { ImxMissingTranslationHandler } from './imx-missing-translation-handler';

describe('imx_MissingTranslationHandler', () => {
    [
        {
            text: 'text',
            expected: 'text'
        },
        {
            text: '#LDS#text',
            expected: 'text'
        },
        {
            text: '#LDS##LDS#text',
            expected: '#LDS#text'
        },
        {
            text: 'text#LDS#',
            expected: 'text#LDS#'
        }
    ].forEach(testcase => it('should provide a handle method', () => {
        expect(new ImxMissingTranslationHandler().handle({
            key: testcase.text,
            translateService: null
        })).toEqual(testcase.expected);
    }));
});
