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

import { Component, Input, OnChanges } from '@angular/core';

import { IEntityColumn } from 'imx-qbm-dbts';
import { BaseReadonlyCdr } from '../base-readonly-cdr';
import { ColumnDependentReference } from '../column-dependent-reference.interface';

@Component({
    selector: 'imx-property-viewer',
    templateUrl: './property-viewer.component.html',
    styleUrls: ['./property-viewer.component.scss']
})
export class PropertyViewerComponent implements OnChanges {
    public cdrList: ColumnDependentReference[];
    @Input() public showHiddenProperties = true;
    @Input() public properties: IEntityColumn[] = [];

    public ngOnChanges(): void {
        if (this.properties) {
            this.cdrList = this.properties
                .filter(column => this.showProperty(column))
                .map(column => new BaseReadonlyCdr(column));
        }
    }

    private showProperty(column: IEntityColumn): boolean {
        // show hidden properties?
        return (column.GetMetadata().CanSee() || this.showHiddenProperties)

            &&

            true;
        /* TODO
        // show empty properties?
        (from edittable select current not(isnullorempty(currentcolumn))
        or getconfig("VI_Common_DisplayEmptyProperties") = "true");*/
    }
}
