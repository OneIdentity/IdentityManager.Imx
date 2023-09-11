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

import { EventEmitter } from '@angular/core';
import { SqlExpression, LogOp, SqlColumnTypes, FilterProperty } from 'imx-qbm-dbts';
import { SqlWizardApiService } from './sqlwizard-api.service';

export class SqlViewSettings {

    public root: SqlViewRoot;
    constructor(
        public readonly sqlWizardService: SqlWizardApiService,
        tableName: string,
        rootExpression?: SqlExpression) {
        let expr = rootExpression;
        if (!expr) {
            expr = {
                Expressions: [],
                LogOperator: LogOp.AND
            };
        }

        this.root = new SqlViewRoot(this, tableName, expr);
    }
}

export interface ISqlNodeView {
    readonly childViews: SqlNodeView[];
    Data: SqlExpression;
    replaceChildNode(oldNode: SqlExpression, newData: SqlExpression): void;
    addChildNode(): Promise<void>;
}

abstract class SqlViewBase implements ISqlNodeView {

    get childViews(): SqlNodeView[] {
        return this.views;
    }

    private views: SqlNodeView[] = [];

    constructor(public readonly viewSettings: SqlViewSettings,
        public tableName: string,
        public Data: SqlExpression,
        public Property: FilterProperty) {
        this.views = this.buildViews();
    }

    // how to listen to a change of Data.PropertyId without re-implementing the SqlExpression interface?
    public readonly columnChanged: EventEmitter<string> = new EventEmitter();

    public async prepare(): Promise<void> {
        if (!this.Property && this.Data.PropertyId) {
            // load property
            const props = (await this.viewSettings.sqlWizardService.getFilterProperties(this.tableName))
                .filter(n => n.PropertyId == this.Data.PropertyId);
            this.Property = props.length > 0 ? props[0] : null;
        }
        // prepare recursively
        for (let child of this.views) {
            await child.prepare();
        }
    }

    public async addChildNode(): Promise<void> {
        const e = {
            LogOperator: LogOp.AND,
            Expressions: [],
        };
        this.Data.Expressions.push(e);
        this.childViews.push(new SqlNodeView(this.viewSettings, this, this.tableName, e, null));
    }

    public replaceChildNode(oldNode: SqlExpression, newData: SqlExpression) {
        const currentExprIndex = this.Data.Expressions.indexOf(oldNode);
        if (currentExprIndex < 0) {
            throw Error('Expected to find child node in array.');
        }

        this.Data.Expressions[currentExprIndex] = newData;
    }

    private buildViews(): SqlNodeView[] {
        let exp = this.Data.Expressions;
        if (!exp) {
            return [];
        }

        const result = new Array(exp.length);

        exp.forEach((e, idx) => {
            let view = new SqlNodeView(this.viewSettings, this, this.tableName, e, null);
            result[idx] = view;
        });

        return result;
    }
}

export class SqlViewRoot extends SqlViewBase implements ISqlNodeView {
    constructor(viewSettings: SqlViewSettings, tableName: string, Data: SqlExpression) {
        super(viewSettings, tableName, Data, null);
    }
}

export class SqlNodeView extends SqlViewBase implements ISqlNodeView {
    constructor(viewSettings: SqlViewSettings,
        public Parent: ISqlNodeView, tableName: string, Data: SqlExpression, property: FilterProperty) {
        super(viewSettings, tableName, Data, property);
    }

    public isSimple(): boolean {
        return !this.Property || this.Property.ColumnType == SqlColumnTypes.Normal;
    }

    public canRemove(): boolean {
        return true;
    }

    public remove() {
        const expressions = this.Parent.Data.Expressions;
        const index = expressions.indexOf(this.Data);

        if (index < 0) {
            throw new Error('Node not found');
        }
        expressions.splice(index, 1);
        this.Parent.childViews.splice(index, 1);
    }
}
