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

import { EventEmitter, forwardRef, Component, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { ClassloggerService } from 'qbm';
import { FilterChangedArgument } from './filter-changed-argument.interface';
import { FilterElementModel } from './filter-element-model';

@Component({
  selector: 'imx-filter-editor',
  templateUrl: './filter-editor.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FilterEditorComponent),
      multi: true,
    }
  ],
  styleUrls: ['./filter-editor.component.scss']
})
export class FilterEditorComponent implements ControlValueAccessor {
  public onChange: (event: FilterElementModel) => void;
  public onTouch: (event: any) => void;

  @Input() public filterElementModel: FilterElementModel;
  @Input() public testId = '';

  @Output() public filterChanged = new EventEmitter<FilterChangedArgument>();

  constructor(private readonly logger: ClassloggerService) { }

  public writeValue(filter: FilterElementModel): void {
    this.filterElementModel = filter;
  }

  public registerOnChange(fn: (event: FilterElementModel) => void): void {
    this.onChange = fn;
    this.logger.trace(this, 'onChange registered as', fn);
  }

  public registerOnTouched(fn: (event: any) => void): void {
    this.onTouch = fn;
    this.logger.trace(this, 'onTouch registered as', fn);
  }

  public invokeFilterChangedElement(arg: FilterChangedArgument): void {
    this.filterElementModel.parameterValue = arg.ParameterValue;
    this.filterElementModel.parameterValue2 = arg.ParameterValue2;

    this.writeValue(this.filterElementModel);

    this.onTouch(this.filterElementModel);
    this.onChange(this.filterElementModel);
    this.filterChanged.emit(arg);

  }
}
