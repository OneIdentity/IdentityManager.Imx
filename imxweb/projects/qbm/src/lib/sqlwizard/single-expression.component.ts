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
 * Copyright 2021 One Identity LLC.
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

import { Component, Input } from '@angular/core';
import { SqlNodeView, SqlViewSettings } from './SqlNodeView';
import { LogOp as _logOp } from 'imx-qbm-dbts';

@Component({
    selector: 'imx-sqlwizard-singleexpression',
    styleUrls: ['./sqlwizard.scss'],
    templateUrl: './single-expression.component.html'
})
export class SingleExpressionComponent {

    @Input() public expr: SqlNodeView;
    @Input() public first: boolean;
    @Input() public last: boolean;
    @Input() public viewSettings: SqlViewSettings;

    public LogOp = _logOp;

    public IsEmpty(): boolean {
        return !this.expr.Data.PropertyId;
    }

    public toggleLogOperator() {
        this.expr.Parent.Data.LogOperator = this.expr.Parent.Data.LogOperator === _logOp.OR ? _logOp.AND : _logOp.OR;
    }

}
