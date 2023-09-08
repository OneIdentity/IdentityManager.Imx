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

import { Component, Input, Output, EventEmitter, OnChanges, OnDestroy } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { BaseCdr, ColumnDependentReference } from 'qbm';
import { Subscription } from 'rxjs';

import { FilterChangedArgument } from './filter-changed-argument.interface';
import { FilterElementModel } from './filter-element-model';

@Component({
  templateUrl: './edit-name.component.html',
  selector: 'imx-edit-name'
})
export class EditNameComponent implements OnChanges, OnDestroy {

  @Input() public filterElementModel: FilterElementModel;
  @Input() public identifier: string;
  @Input() public testId = '';

  public cdr: ColumnDependentReference;

  @Output() public valueChanged = new EventEmitter<FilterChangedArgument>();

  private valueChangedSubscription: Subscription;

  public ngOnChanges(): void {
    this.cdr = new BaseCdr(this.filterElementModel.columnForFilter);
  }

  public ngOnDestroy(): void {
    if (this.valueChangedSubscription) {
      this.valueChangedSubscription.unsubscribe();
    }
  }

  public invokeValueChangedEvent(control: AbstractControl): void {
    if (this.valueChangedSubscription) {
      this.valueChangedSubscription.unsubscribe();
    }
    this.valueChangedSubscription = control.valueChanges.subscribe(value => {
      this.valueChanged.emit({
        ParameterValue: value,
        displays: [value]
      });
    });
  }
}
