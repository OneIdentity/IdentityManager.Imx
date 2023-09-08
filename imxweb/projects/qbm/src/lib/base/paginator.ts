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

import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslateService } from '@ngx-translate/core';

import { LdsReplacePipe } from '../lds-replace/lds-replace.pipe';

export class Paginator extends MatPaginatorIntl {
    private rangeText = '';
    private rangeTextFallback = '';

    private constructor(private translateService: TranslateService, private readonly ldsReplace: LdsReplacePipe) {
        super();
        this.translateService.get('#LDS#Entries per page').subscribe((text: string) => this.itemsPerPageLabel = text + ':');
        this.translateService.get('#LDS#First page').subscribe((text: string) => this.firstPageLabel = text);
        this.translateService.get('#LDS#Previous page').subscribe((text: string) => this.previousPageLabel = text);
        this.translateService.get('#LDS#Next page').subscribe((text: string) => this.nextPageLabel = text);
        this.translateService.get('#LDS#Last page').subscribe((text: string) => this.lastPageLabel = text);
        this.translateService.get('#LDS#{0} - {1} of {2}').subscribe((text: string) => this.rangeText = text);
        this.translateService.get('#LDS#0 of {0}').subscribe((text: string) => this.rangeTextFallback = text);
        this.getRangeLabel = (page: number, pageSize: number, length: number) => {
            length = Math.max(length, 0);

            if (length === 0 || pageSize === 0) {
                return this.ldsReplace.transform(this.rangeTextFallback, length);
            }

            const startIndex = page * pageSize;
            const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;

            return this.ldsReplace.transform(this.rangeText, startIndex + 1, endIndex, length);
        };
    }

    public static Create(translateService: TranslateService, ldsReplace: LdsReplacePipe): Paginator {
        return new Paginator(translateService, ldsReplace);
    }
}
