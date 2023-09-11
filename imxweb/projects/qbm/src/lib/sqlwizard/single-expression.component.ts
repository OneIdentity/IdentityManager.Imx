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

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SqlNodeView, SqlViewSettings } from './SqlNodeView';
import { LogOp as _logOp } from 'imx-qbm-dbts';

@Component({
    selector: 'imx-sqlwizard-singleexpression',
    styleUrls: ['single-expression.component.scss', './sqlwizard.scss'],
    templateUrl: './single-expression.component.html'
})
export class SingleExpressionComponent {

    @Input() public expr: SqlNodeView;
    @Input() public first: boolean;
    @Input() public last: boolean;
    @Input() public viewSettings: SqlViewSettings;

    @Output() public change = new EventEmitter<any>();

    public LogOp = _logOp;

    public emitChanges(): void {
      this.change.emit();
    }

    public IsEmpty(): boolean {
        return !this.expr.Data.PropertyId;
    }

    public toggleLogOperator() {
        this.expr.Parent.Data.LogOperator = this.expr.Parent.Data.LogOperator === _logOp.OR ? _logOp.AND : _logOp.OR;
        this.change.emit();
    }

    public async addExpression(): Promise<void> {
      await this.expr.Parent.addChildNode();
      this.emitChanges();
    }

    public removeExpression(): void {
      this.expr.remove();
      this.emitChanges();
    }

}
