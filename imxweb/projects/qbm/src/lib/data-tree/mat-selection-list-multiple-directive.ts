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

import { SelectionModel } from '@angular/cdk/collections';
import { Directive, Host, Input, OnChanges } from '@angular/core';
import { MatListOption, MatSelectionList } from '@angular/material/list';

@Directive({
    // tslint:disable-next-line: directive-selector
    selector: 'mat-selection-list[multiple]'
})
// TODO Later: kann wieder weg, wenn wir mal auf einen neuere Material - Version migrieren
export class MatSelectionListMultipleDirective implements OnChanges {

    @Input() public multiple: boolean;
    private matSelectionList: MatSelectionList;

    constructor(@Host() matSelectionList: MatSelectionList) {
        this.matSelectionList = matSelectionList;
    }

    public ngOnChanges(): void {
        if (this.multiple) {
            this.matSelectionList.selectedOptions = new SelectionModel<MatListOption>(true, this.matSelectionList.selectedOptions.selected);
        } else {
            const selected = this.matSelectionList.selectedOptions.selected.splice(0, 1);
            this.matSelectionList.selectedOptions = new SelectionModel<MatListOption>(false, selected);
        }
    }
}