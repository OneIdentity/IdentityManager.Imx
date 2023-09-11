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

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { EuiSelectOption } from '@elemental-ui/core';

import { IForeignKeyInfo } from 'imx-qbm-dbts';
import { MetadataService } from '../../base/metadata.service';

@Component({
  selector: 'imx-fk-table-select',
  templateUrl: './fk-table-select.component.html',
  styleUrls: ['./fk-table-select.component.scss'],
})
export class FkTableSelectComponent implements OnInit {
  public readonly control = new UntypedFormControl(undefined);

  public options: EuiSelectOption[];
  public loading: boolean;

  @Input() public fkTables: ReadonlyArray<IForeignKeyInfo>;
  @Input() public preselectedTableName: string;

  @Output() public selectionChanged = new EventEmitter<string>();

  constructor(private readonly metadata: MetadataService) {}

  public async ngOnInit(): Promise<void> {
    this.loading = true;
    await this.metadata.updateNonExisting(this.fkTables.map((item) => item.TableName));
    this.loading = false;

    this.options = this.fkTables.map((item) => ({
      display: this.metadata.tables[item.TableName]?.DisplaySingular || item.TableName,
      value: item.TableName,
    }));

    this.control.setValue(this.preselectedTableName ?? this.fkTables[0].TableName, { emitEvent: false });
  }

  public filter(option: EuiSelectOption, searchInputValue: string): boolean {
    return option.display.toString().toUpperCase().trim().includes(searchInputValue.toUpperCase().trim());
  }

  // TODO: Check Upgrade
  // public onChange(event: any): void {
  //   this.selectionChanged.emit(event.value);
  // }
}
