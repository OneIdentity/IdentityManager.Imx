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

import { Component, effect, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { EuiSelectFeedbackMessages } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { DataViewSource } from '../data-view-source';

@Component({
  selector: 'imx-data-view-group',
  templateUrl: './data-view-group.component.html',
})
export class DataViewGroupComponent implements OnInit {
  /**
   * Input the DataViewSource service. It handles all the action and the data loading. This input property is required.
   */
  @Input({ required: true }) public dataSource: DataViewSource;
  formControl = new FormControl<string>('', { nonNullable: true });
  feedbackMessages: EuiSelectFeedbackMessages;

  constructor(private readonly translateService: TranslateService) {
    this.feedbackMessages = {
      ...this.feedbackMessages,
      search: this.translateService.instant('#LDS#Search'),
    };
    effect(
      () => {
        if (!!this.dataSource.groupByColumn() && this.dataSource.groupByColumn()?.ColumnName !== this.formControl.value) {
          this.formControl.setValue(this.dataSource.groupByColumn()?.ColumnName || '', { emitEvent: false });
        }
      },
      { allowSignalWrites: true },
    );
  }

  ngOnInit(): void {
    // Change the DataViewSource groupByColumn signal and rerender the table on template group option change event.
    this.formControl.valueChanges.subscribe((column) => {
      const selectedOption = this.dataSource.groupOptions.find((option) => option.value === column);
      this.dataSource.groupByColumn.set(selectedOption?.clientProperty);
      this.dataSource.selection.clear();
      this.dataSource.nestedSelection = new Map();
      if (column !== null) {
        this.dataSource.state.update((state) => ({ ...state, StartIndex: 0 }));
        this.dataSource.updateState();
      }
    });
  }
}
