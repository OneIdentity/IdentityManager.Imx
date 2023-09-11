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

import { ChangeDetectorRef, EventEmitter, ViewChild } from '@angular/core';
import { Component, Input, Output } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { MatExpansionPanel } from '@angular/material/expansion';
import { MatSelectChange } from '@angular/material/select';

import { FilterChangedArgument } from '../editors/filter-changed-argument.interface';
import { FilterElementModel } from '../editors/filter-element-model';

@Component({
  selector: 'imx-policy-filter-element',
  templateUrl: './policy-filter-element.component.html',
  styleUrls: ['./policy-filter-element.component.scss']
})
export class PolicyFilterElementComponent {

  @Input() public formGroup: UntypedFormGroup;
  @Input() public idForTest: string;

  @Output() public deleteFilter = new EventEmitter<UntypedFormGroup>();
  @Output() public conditionTypeChanged = new EventEmitter<FilterElementModel>();
  @Output() public parameterChanged = new EventEmitter<FilterElementModel>();

  @ViewChild(MatExpansionPanel) private panel: MatExpansionPanel;
  public get filterElementModel(): FilterElementModel {
    return this.formGroup?.get(this.filterParameter).value;
  }

  private readonly filterParameter = 'filterParameter';

  constructor(private readonly cd: ChangeDetectorRef) { }

  public open(): void {
    if (this.panel
      && (this.filterElementModel.attestationSubType == null || this.filterElementModel.attestationSubType === '')
    ) {
      this.panel.open();
      this.cd.detectChanges();
    }
  }

  public selectedConditionTypeChanged(arg: MatSelectChange): void {
    if (this.filterElementModel == null) {
      return;
    }
    this.filterElementModel.updateColumn({
      ParameterName: this.filterElementModel.getParameterData(arg.value).RequiredParameter,
      AttestationSubType: arg.value,
      ParameterValue: FilterElementModel.getDefaultValue(this.filterElementModel.getParameterData(arg.value).RequiredParameter, false),
      ParameterValue2: FilterElementModel.getDefaultValue(this.filterElementModel.getParameterData(arg.value).RequiredParameter, true),
    }, []);
    this.formGroup.updateValueAndValidity();
    this.conditionTypeChanged.emit(this.filterElementModel);
  }

  public filterParameterChanged(arg: FilterChangedArgument): void {
    if (this.filterElementModel == null) {
      return;
    }
    this.filterElementModel.updateColumn(this.filterElementModel.filterElement, arg.displays);
    this.parameterChanged.emit(this.filterElementModel);
  }

}
