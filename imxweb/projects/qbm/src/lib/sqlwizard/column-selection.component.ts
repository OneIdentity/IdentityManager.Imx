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

import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { EuiSelectOption } from '@elemental-ui/core';
import { FilterProperty, LogOp, SqlExpression } from 'imx-qbm-dbts';
import { SqlNodeView } from './SqlNodeView';
import { SqlWizardService } from './sqlwizard.service';

@Component({
    templateUrl: './column-selection.component.html',
    selector: 'imx-sqlwizard-columnselection'
})

export class ColumnSelectionComponent implements OnInit, OnChanges {


    @Input() public node: SqlNodeView;

    @Output() public change = new EventEmitter<any>();

    public columns: FilterProperty[] = [];

    public dataReady = false;
    public options: EuiSelectOption[] = [];

    public formControl = new UntypedFormControl();

    private lastSelected;

    constructor(private readonly svc: SqlWizardService) {
    }

    public async ngOnInit(): Promise<void> {
        await this.reloadColumns();
        if (this.node.Property) {
            this.formControl.setValue(this.node.Property.PropertyId);
        }

        this.formControl.valueChanges.subscribe(c => {
            this.selectColumn(c);
        });
    }

    // TODO: Check Upgrade
    public selectionChange(value: any): void {
        this.formControl.setValue(value);
        this.node.columnChanged.emit(value);
        this.change.emit();
    }

    public ngOnChanges(changes: any): void {
        if (changes.node) {
            this.reloadColumns();
        }
    }
    public async selectColumn(propertyId: string): Promise<void> {
        if (this.lastSelected === propertyId) {
            return;
        }
        this.lastSelected = propertyId;
        const found = this.columns.filter(c => c.PropertyId === propertyId);
        if (found.length != 1) {
            throw new Error('Property not found: ' + propertyId);
        }
        const filterProperty = found[0];

        // If there is only one operator, pre-select it.
        // this is important for boolean properties that do not show
        // an operator selection.
        let preselectedOperator: string = null;
        if (found[0].Operators?.length === 1) {
          preselectedOperator = found[0].Operators[0].Type;
        }

        // create new empty node
        const data: SqlExpression = {
            PropertyId: propertyId,
            Operator: preselectedOperator,
            LogOperator: LogOp.AND
        };
        this.node.Parent.replaceChildNode(this.node.Data, data);
        this.node.Data = data;
        this.node.Property = filterProperty;
    }
    public filter(option: EuiSelectOption, searchInputValue: string): boolean {
        return option.display.toString().toUpperCase().trim().includes(searchInputValue.toUpperCase().trim());
    }

    private async reloadColumns(): Promise<void> {
        const tableName = this.node.tableName;

        if (tableName) {

            this.columns = await this.svc.getColumns(this.node.viewSettings, tableName);
            this.options = [];
            for (const col of this.columns) {
                this.options.push({
                    display: col.Display,
                    value: col.PropertyId
                });
            }

            this.dataReady = true;
        }
    }
}
