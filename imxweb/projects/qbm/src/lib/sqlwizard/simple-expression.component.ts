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
import { SqlNodeView } from './SqlNodeView';
import { SqlColumnTypes, ValType as _valType } from 'imx-qbm-dbts';

@Component({
    selector: 'imx-sqlwizard-simpleexpression',
    styleUrls: ['./sqlwizard.scss', './simple-expression.component.scss'],
    templateUrl: './simple-expression.component.html'
})
export class SimpleExpressionComponent {
    @Input() public expr: SqlNodeView;
    @Output() public change = new EventEmitter<any>();

    public ValType = _valType;
    public ColumnType = SqlColumnTypes;

    public emitChanges(): void {
      this.change.emit();
    }

    public delete(ind: number) {
        this.expr.Data.Value.splice(ind, 1);
        this.emitChanges();
    }

    public addNew() {
        this.expr.Data.Value.push(null);
        this.emitChanges();
    }

    // https://stackoverflow.com/questions/42322968/angular2-dynamic-input-field-lose-focus-when-input-changes
    public trackByFn(index: any, item: any) {
        return index;
    }

    public operatorChanged() {
        if (this.expr.Data.Operator == 'IN') {
            if (!(this.expr.Data.Value instanceof Array)) {

                // re-initialize with array with single null element
                this.expr.Data.Value = [null];
            }
        }
        else {
            // re-initialize with single null element
            if (this.expr.Data.Value instanceof Array) {
                this.expr.Data.Value = null;
            }
        }
        this.emitChanges();
    }

    public isArray(x): boolean {
        return x instanceof Array;
    }
}
