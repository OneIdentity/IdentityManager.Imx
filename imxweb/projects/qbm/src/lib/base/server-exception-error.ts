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

import { ExceptionData } from 'imx-api-qbm';
import { ServerError } from './server-error';

export class ServerExceptionError extends ServerError {
    constructor(private readonly dataItems: ExceptionData[]) {
        super(ServerExceptionError.parse(dataItems));

        this.messageUserFriendly = ServerExceptionError.parse(this.dataItems, true);
    }

    private static parse(dataItems: ExceptionData[], userFriendly: boolean = false): string {
        if (dataItems && dataItems.length > 0) {
            if (userFriendly) {
                return dataItems.map(item => `${item.Message}${item.Number ? ` [${item.Number}]` : ''}`).join(', ');
            }

            return JSON.stringify(dataItems);
        }

        return 'Unknown error';
    }
}
