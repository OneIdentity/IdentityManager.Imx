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

import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import {
  FkProviderItem,
  IClientProperty,
  MetaTableRelationData,
  SqlColumnTypes,
  SqlTable,
  ValType,
  ValType as _valType,
} from 'imx-qbm-dbts';
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
  public get selectedTable() {
    return this._selectedTable;
  }

  public set selectedTable(val) {
    this._selectedTable = val;
    if (val) {
      this._fkRelation.ParentTableName = val.Name;
      this._fkRelation.ParentColumnName = val.ParentColumnName;
      this._fkProviderItem.fkTableName = val.Name;
    }
  }

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
    if (!this.expr.Data.DisplayValues) {
      return null;
    }
    return this.expr.Data.DisplayValues[this.mode === 'array' ? this.index : 0];
  }

  set displayValue(val) {
    if(!this.expr.Data?.DisplayValues){
      return;
    }
    if (this.mode == 'array' && this.expr.Data.DisplayValues) {
      this.expr.Data.DisplayValues[this.index] = val;
    } else {
      this.expr.Data.DisplayValues = [val];
    }
  }

  @Input() public expr: SqlNodeView;
  @Input() public mode: 'array' | 'single' = 'single';
  @Input() public index: number;

  @Output() public change = new EventEmitter<any>();

  public ValType = _valType;
  public ColumnType = SqlColumnTypes;

  public cdr: BaseCdr;

  private _selectedTable: SqlTable;
  private _fkRelation: MetaTableRelationData = {
    IsMemberRelation: false,
  };
  private _fkProviderItem: FkProviderItem = {
    columnName: 'dummycolumn',
    fkTableName: 'not_set',
    parameterNames: ['OrderBy', 'StartIndex', 'PageSize', 'filter', 'search'],
    load: async (_, parameters = {}) => this.sqlWizardApi.getCandidates(this._fkRelation.ParentTableName, parameters),
    getFilterTree: async () => ({ Elements: [] }),
    getDataModel: async () => ({}),
  };

  constructor(private readonly entityService: EntityService, private readonly sqlWizardApi: SqlWizardApiService) {}

  private subscriptions: Subscription[] = [];

  public ngOnInit(): void {
    this.subscriptions.push(
      this.expr.columnChanged.subscribe((_) => {
        this.buildCdr();
      })
    );

    this.buildCdr();
  }

  public emitChanges(): void {
    this.change.emit();
  }

  private buildCdr() {
    const tables = this.expr.Property.SelectionTables;
    if (tables && tables.length > 0) {
      this.selectedTable = tables[0];
    } else {
      this.selectedTable = null;
    }

    const property: IClientProperty = {
      ColumnName: 'dummycolumn',
      Type: ValType.String,
      FkRelation: this._fkRelation,
    };

    if (this.expr.Property.Type === ValType.Bool) this.value = false;

    const column = this.entityService.createLocalEntityColumn(property, [this._fkProviderItem], {
      Value: this.value,
      DisplayValue: this.displayValue,
    });

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

  public ngOnDestroy(): void {
    for (var s of this.subscriptions) s.unsubscribe();
  }
}
