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
 * Copyright 2024 One Identity LLC.
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

import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import {
  FkProviderItem,
  IClientProperty,
  IEntityColumn,
  SqlColumnTypes,
  SqlTable,
  ValType,
  ValType as _valType,
} from '@imx-modules/imx-qbm-dbts';
import { Subscription } from 'rxjs';
import { BaseCdr } from '../cdr/base-cdr';
import { EntityService } from '../entity/entity.service';
import { SqlNodeView } from './SqlNodeView';
import { SqlWizardApiService } from './sqlwizard-api.service';

@Component({
  selector: 'imx-sqlwizard-singlevalue',
  styleUrls: ['./sqlwizard.scss'],
  templateUrl: './single-value.component.html',
})
export class SingleValueComponent implements OnInit, OnDestroy {
  get value() {
    if (this.mode == 'array' && this.expr.Data.Value) {
      return this.expr.Data.Value[this.index];
    } else {
      return this.expr.Data.Value;
    }
  }

  set value(val) {
    if (this.mode == 'array' && this.expr.Data.Value) {
      this.expr.Data.Value[this.index] = val;
    } else {
      this.expr.Data.Value = val;
    }
  }

  get displayValue() {
    if (!this.expr.Data?.DisplayValues) {
      return null;
    }
    if (this.mode == 'array') {
      return this.expr.Data.DisplayValues[this.index];
    } else {
      return this.expr.Data.DisplayValues ? this.expr.Data.DisplayValues[0] : null;
    }
  }

  set displayValue(val) {
    if (!this.expr.Data) {
      return;
    }
    if (this.mode == 'array' && this.expr.Data.DisplayValues) {
      this.expr.Data.DisplayValues?.splice(this.index, 1, val ?? '');
    } else {
      this.expr.Data.DisplayValues = [val ?? ''];
    }
  }

  @Input() public expr: SqlNodeView;
  @Input() public mode: 'array' | 'single' = 'single';
  @Input() public index: number;

  @Output() public change = new EventEmitter<any>();

  public ValType = _valType;
  public ColumnType = SqlColumnTypes;
  public cdr: BaseCdr;
  public doubleFormControl = new FormControl(null, [Validators.pattern(/^[+-]?\d+(\.\d+)?$/), Validators.required]);
  public integerFormControl = new FormControl(null, [Validators.pattern(/^[+-]?\d+$/), Validators.required]);

  private subscriptions: Subscription[] = [];

  constructor(
    private readonly entityService: EntityService,
    private readonly sqlWizardApi: SqlWizardApiService,
  ) {}

  public ngOnInit(): void {
    this.subscriptions.push(
      this.expr.columnChanged.subscribe((_) => {
        this.buildCdr();
      }),
    );

    this.buildCdr();
    this.onFormValueChanges();
  }

  public ngOnDestroy(): void {
    for (var s of this.subscriptions) s.unsubscribe();
  }

  public emitChanges(): void {
    this.change.emit();
  }

  /**
   * @ignore Builds a cdr for the expression.
   */
  private buildCdr() {
    const tables = this.expr.Property?.SelectionTables;

    if (this.expr.Property?.Type === ValType.Bool && this.expr.Data.Value === undefined) {
      this.value = false;
    }

    let column: IEntityColumn;

    if ((tables?.length ?? 0) > 1) {
      column = this.buildDynamicFk(tables ?? []);
    } else {
      if (!!tables?.length) {
        column = this.buildFk(tables?.[0]);
      } else {
        column = this.buildSimple();
      }
    }
    if (!column) throw new Error('Column can not be build');

    if (this.expr.Property?.Type === ValType.Double) {
      this.doubleFormControl.setValue(column.GetValue());
    }
    if (this.expr.Property?.Type === ValType.Int) {
      this.integerFormControl.setValue(column.GetValue());
    }

    // when the CDR value changes, write back to the SQL wizard data structure
    column.ColumnChanged.subscribe(() => {
      setTimeout(() => {
        this.displayValue = column.GetDisplayValue();
        this.value = column.GetValue();
        this.emitChanges();
      }, 0);
    });
    this.cdr = new BaseCdr(column, '#LDS#Value');
  }

  /**
   * @ignore Builds a column, containing a dynamic fk definition, that uses multiple tables.
   * @param tables  a list containing the SQL tables, that are used for the column's fk relation
   * @returns an entity column, that can be used by a cdr
   */
  private buildDynamicFk(tables: SqlTable[]): IEntityColumn {
    const property: IClientProperty = {
      ColumnName: 'dummycolumn',
      Type: ValType.String,
      IsDynamicFk: true,
      ValidReferencedTables: tables.map((elem) => ({ TableName: elem.Name })),
    };

    return this.buildColumn(
      property,
      tables.map((elem) => this.buildProviderItem(elem.Name, 'XObjectKey')),
    );
  }

  /**
   * @ignore Builds a column, containing a simple fk definition.
   * @param table  the SQL table, that is used for the column's fk relation
   * @returns an entity column, that can be used by a cdr
   */
  private buildFk(table: SqlTable | undefined): IEntityColumn {
    const property: IClientProperty = {
      ColumnName: 'dummycolumn',
      Type: ValType.String,
      FkRelation: {
        IsMemberRelation: false,
        ParentTableName: table?.Name ?? '',
        ParentColumnName: table?.ParentColumnName,
      },
    };

    return this.buildColumn(property, [this.buildProviderItem(table?.Name, table?.ParentColumnName)]);
  }

  /**
   * @ignore Builds a simple entity column.
   * @returns a simple entity column without fk providers
   */
  private buildSimple(): IEntityColumn {
    const property: IClientProperty = {
      ColumnName: 'dummycolumn',
      Type: this.expr.Property?.Type ?? ValType.String,
    };
    return this.buildColumn(property, undefined);
  }

  /**
   * @ignore Builds a single FkProviderItem.
   * @param tableName the name of the table
   * @returns a fk provider item
   */
  private buildProviderItem(tableName: string | undefined, fkColumnName?: string): FkProviderItem {
    return {
      columnName: 'dummycolumn',
      fkColumnName,
      fkTableName: tableName ?? '',
      parameterNames: ['OrderBy', 'StartIndex', 'PageSize', 'filter', 'search'],
      load: async (_, parameters = {}) => this.sqlWizardApi.getCandidates(tableName ?? '', parameters),
      getFilterTree: async () => ({ Elements: [] }),
      getDataModel: async () => ({}),
    };
  }

  /**
   * @ignore This is used to build the entity column in all helper methods.
   * @param property the client property describing the column
   * @param providerItems FkProviderItems, that are associated with the column.
   * @returns an IEntityColumn, that can be used in the CDR
   */
  private buildColumn(property: IClientProperty, providerItems: FkProviderItem[] | undefined): IEntityColumn {
    return this.entityService.createLocalEntityColumn(property, providerItems, {
      Value: this.value,
      DisplayValue: this.displayValue ?? '',
    });
  }

  private onFormValueChanges(): void {
    this.subscriptions.push(
      this.doubleFormControl.valueChanges.subscribe((value) => {
        if (!this.doubleFormControl.hasError('pattern')) {
          this.value = value;
          this.emitChanges();
        } else {
          this.value = {};
        }
      }),
    );
    this.subscriptions.push(
      this.integerFormControl.valueChanges.subscribe((value) => {
        if (!this.integerFormControl.hasError('pattern')) {
          this.value = value;
          this.emitChanges();
        } else {
          this.value = {};
        }
      }),
    );
  }
}
