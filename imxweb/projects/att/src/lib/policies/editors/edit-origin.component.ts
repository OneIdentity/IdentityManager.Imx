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
import { UntypedFormArray, UntypedFormControl } from '@angular/forms';
import { Subscription } from 'rxjs';

import { ParmOpt } from 'imx-api-att';
import { ClassloggerService } from 'qbm';
import { FilterChangedArgument } from './filter-changed-argument.interface';
import { FilterElementModel } from './filter-element-model';

@Component({
  templateUrl: './edit-origin.component.html',
  selector: 'imx-edit-origin',
  styleUrls: ['./edit-origin.component.scss']
})
export class EditOriginComponent implements OnInit, OnDestroy {

  public candidates: ParmOpt[];
  public readonly control = new UntypedFormArray([]);

  @Input() public filterElementModel: FilterElementModel;
  @Input() public identifier: string;
  @Input() public testId = '';

  @Output() public valueChanged = new EventEmitter<FilterChangedArgument>();

  private selectedParameter: string[];
  private valueChangedSubscription: Subscription;

  constructor(private readonly logger: ClassloggerService) { }

  public ngOnInit(): void {

    if (this.filterElementModel == null) {
      return;
    }
    this.candidates = this.filterElementModel.getParameterData(this.filterElementModel?.attestationSubType).Options;

    this.selectedParameter = this.splitStringAndRemoveQuotes(this.filterElementModel?.parameterValue, ',');

    this.candidates.forEach(elem => {
      this.control.push(new UntypedFormControl(this.isSelected(elem)));
      this.logger.trace(this, 'control added for candidate', elem);
    });

    this.valueChangedSubscription = this.control.valueChanges.subscribe(() =>
      this.valueChanged.emit({
        ParameterValue: this.buildNewParameterValue(),
        displays: this.buildDisplay()
      })
    );
  }

  public ngOnDestroy(): void {
    if (this.valueChangedSubscription) {
      this.valueChangedSubscription.unsubscribe();
    }
  }

  private buildNewParameterValue(): string {
    const elements = this.control.value;
    const returnValue = [];
    elements.forEach((element: any, index: number) => {
      if (element) {
        returnValue.push(`'${this.candidates[index].Uid}'`);
      }
    });
    const list = returnValue.join(',');
    this.logger.trace(this, 'new parameter value generated with', list);
    return list;
  }

  private buildDisplay(): string[] {
    const elements = this.control.value;
    const returnValue = [];
    elements.forEach((element: any, index: number) => {
      if (element) {
        returnValue.push(`'${this.candidates[index].Display}'`);
      }
    });
    this.logger.trace(this, 'new displays build as', returnValue);
    return returnValue;
  }

  private isSelected(option: ParmOpt): boolean {
    return this.selectedParameter.includes(option.Uid);
  }

  private splitStringAndRemoveQuotes(listString: string, separator: string): string[] {
    const splitted = listString.split(separator);
    return splitted.map(str => str.substring(1, str.length - 1));
  }

}
