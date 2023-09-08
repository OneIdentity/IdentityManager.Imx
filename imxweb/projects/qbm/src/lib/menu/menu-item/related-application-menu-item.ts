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

import { MenuItem } from './menu-item.interface';
import { RelatedApplication } from './related-application.interface';

/** Menu item for a link to an external web site */
export class RelatedApplicationMenuItem implements MenuItem {
    public get id(): string { return this.app.uid; }
    public get title(): string { return this.app.displayName; }
    public get description(): string { return this.app.description; }

    constructor(private readonly app: RelatedApplication) { }

    public Trigger(): void {
        // TODO (TFS number 805756): VI.WebRuntime.RuntimeUtil.CheckIsValidUrlForRedirect(url);

        if (this.app.displayType === 'NV') { // content and navigation
            // TODO (TFS number 805756): show in VI_Common_ExternalFormHost
            return;
        }

        if (this.app.displayType === 'PP') { // Popup
            // TODO (TFS number 805756): show in popup
            return;
        }

        if (this.app.displayType === 'NR') { // Content
            return;
        }

        if (this.app.displayType === 'NT') { // Content, navigation and header
            // TODO (TFS number 805756): directly redirect to the URL
            return;
        }

        throw new Error('MenuItem - the related application has an invalid displayType.');
    }
}
