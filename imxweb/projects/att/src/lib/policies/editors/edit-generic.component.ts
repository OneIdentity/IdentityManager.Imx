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

import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';

import { MultiValue, ValueStruct } from 'imx-qbm-dbts';
import { ColumnDependentReference, BaseCdr, ClassloggerService, MetadataService } from 'qbm';
import { FilterChangedArgument } from './filter-changed-argument.interface';
import { FilterElementModel } from './filter-element-model';

@Component({
  templateUrl: './edit-generic.component.html',
  selector: 'imx-edit-generic',
})
export class EditGenericComponent implements OnChanges {
  public cdr: ColumnDependentReference;

  @Input() public filterElementModel: FilterElementModel;
  @Input() public identifier: string;

  @Output() public valueChanged = new EventEmitter<FilterChangedArgument>();

  constructor(private readonly logger: ClassloggerService, private readonly metaData: MetadataService) {}

  public async ngOnChanges(): Promise<void>{
    const tableName = this.filterElementModel.getTableName();
    if (tableName == null) {
      this.cdr = new BaseCdr(this.filterElementModel.columnForFilter);
    } else {
      await this.metaData.update([this.filterElementModel.getTableName()]);
      this.cdr = new BaseCdr(this.filterElementModel.columnForFilter,
        this.metaData.tables[this.filterElementModel.getTableName()]
          .Columns[this.filterElementModel.getColumnName()].Display);
    }
  }

  public async invokeValueChangedEvent(arg: ValueStruct<string>): Promise<void> {
    await this.filterElementModel.columnForFilter.PutValueStruct(arg);
    const data = {
      ParameterValue: FilterElementModel.buildCommaSeparatedList(this.filterElementModel.columnForFilter.GetValue()),
      displays: MultiValue.FromString(this.filterElementModel.columnForFilter.GetDisplayValue()).GetValues(),
    };
    this.logger.trace(this, 'valueChanged called with', data);
    this.valueChanged.emit(data);
  }
}
