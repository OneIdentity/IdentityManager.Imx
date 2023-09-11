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

import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormControl, UntypedFormGroup } from '@angular/forms';

import { IClientProperty } from 'imx-qbm-dbts';
import { ColumnDependentReference } from 'qbm';
import { ReportSubscription } from '../report-subscription/report-subscription';

@Component({
  selector: 'imx-subscription-properties',
  templateUrl: './subscription-properties.component.html',
  styleUrls: ['./subscription-properties.component.scss']
})
export class SubscriptionPropertiesComponent implements OnInit, OnChanges {

  public cdrList: ColumnDependentReference[] = [];
  public parameterCdrList: ColumnDependentReference[] = [];
  public readonly subscriptionPropertiesFormArray = new UntypedFormArray([]);
  public readonly subscriptionParameterFormArray = new UntypedFormArray([]);

  public withSeparateParameterList: boolean;

  @Input() public subscription: ReportSubscription;
  @Input() public formGroup: UntypedFormGroup;
  @Input() public withTitles = true;
  @Input() public displayedColumns: IClientProperty[] = [];

  public ngOnInit(): void {
    if (this.formGroup) {
      this.formGroup.addControl('subscriptionProperties', this.subscriptionPropertiesFormArray);
      this.formGroup.addControl('subscriptionParameter', this.subscriptionParameterFormArray);
    }
  }

  public ngOnChanges(): void {

    this.subscriptionPropertiesFormArray.clear();
    this.cdrList = this.subscription == null ? [] : this.subscription.getCdrs(this.displayedColumns);

    this.subscriptionParameterFormArray.clear();
    this.parameterCdrList = this.subscription == null ? [] : this.subscription.getParameterCdr();

    this.withSeparateParameterList = this.withTitles || this.parameterCdrList.length > 0;
  }

  public valueHasChanged(name: any): void {
    if (this.subscription.columnsWithParameterReload.indexOf(name) !== -1) {
      this.subscriptionParameterFormArray.clear();
      this.parameterCdrList = this.subscription.getParameterCdr();
    }
  }

  public addFormControl(array: UntypedFormArray, control: UntypedFormControl): void {
    setTimeout(() => {
      array.push(control);
    });
  }
}
