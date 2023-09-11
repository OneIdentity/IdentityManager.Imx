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
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { FilterChangedArgument } from './filter-changed-argument.interface';
import { FilterElementModel } from './filter-element-model';

@Component({
  templateUrl: './edit-threshold.component.html',
  selector: 'imx-edit-threshold',
  styleUrls: ['./edit-threshold.component.scss']
})
export class EditThresholdComponent implements OnInit, OnDestroy {

  public readonly riskIndexForm: UntypedFormGroup;
  public readonly lowerControl: UntypedFormControl;
  public readonly upperControl: UntypedFormControl;

  @Input() public filterElementModel: FilterElementModel;
  @Input() public identifier: string;
  @Input() public testId = '';

  @Output() public valueChanged = new EventEmitter<FilterChangedArgument>();

  private valueChangedSubscription: Subscription;

  constructor(private readonly translateService: TranslateService) {
    this.lowerControl = new UntypedFormControl(undefined, { updateOn: 'blur', validators: [Validators.min(0), Validators.max(1)] });
    this.upperControl = new UntypedFormControl(undefined, { updateOn: 'blur', validators: [Validators.min(0), Validators.max(1)] });
    this.riskIndexForm = new UntypedFormGroup({
      lowerBounds: this.lowerControl,
      upperBounds: this.upperControl
    });
  }

  public ngOnInit(): void {
    this.lowerControl.patchValue(this.filterElementModel?.parameterValue);
    this.upperControl.patchValue(this.filterElementModel?.parameterValue2);

    this.valueChangedSubscription = this.riskIndexForm.valueChanges.subscribe(() =>
      this.valueChanged.emit({
        ParameterValue: this.lowerControl.value?.toLocaleString('en-us'),
        ParameterValue2: this.upperControl.value?.toLocaleString('en-us'),
        displays: [(this.lowerControl.value * 100).toLocaleString(this.translateService.currentLang)
          + ' - ' + (this.upperControl.value * 100).toLocaleString(this.translateService.currentLang)]
      })
    );
  }

  public ngOnDestroy(): void {
    if (this.valueChangedSubscription) {
      this.valueChangedSubscription.unsubscribe();
    }
  }
}
