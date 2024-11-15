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

import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormGroup } from '@angular/forms';
import { EUI_SIDESHEET_DATA, EuiSidesheetRef } from '@elemental-ui/core';
import { ClassloggerService, ColumnDependentReference } from 'qbm';
import { ReportSubscription } from '../../subscriptions/report-subscription/report-subscription';

@Component({
  selector: 'imx-parameter-sidesheet',
  templateUrl: './parameter-sidesheet.component.html',
})
export class ParameterSidesheetComponent implements OnInit {
  public readonly reportFormGroup = new UntypedFormGroup({});

  public cdrs: ColumnDependentReference[];
  public writeOperators = 1;
  constructor(
    private readonly sidesheetRef: EuiSidesheetRef,
    private readonly changeDetectorRef: ChangeDetectorRef,
    @Inject(EUI_SIDESHEET_DATA) public readonly data: { subscription: ReportSubscription; presetParameter: { [key: string]: string } },
    logger: ClassloggerService,
  ) {
    data.subscription.reportEntityWrapper.startWriteData.subscribe(() => {
      this.writeOperators = this.writeOperators + 1;
      logger.debug(this, 'number of write operations:', this.writeOperators);
      changeDetectorRef.detectChanges();
    });
    data.subscription.reportEntityWrapper.endWriteData.subscribe(() => {
      this.writeOperators = this.writeOperators - 1;
      logger.debug(this, 'number of write operations:', this.writeOperators);
      changeDetectorRef.detectChanges();
    });
  }

  public async ngOnInit(): Promise<void> {
    if (this.data.presetParameter) {
      await this.data.subscription.fillColumnsWithPreset(this.data.presetParameter);
      this.cdrs = this.data.subscription.getParameterCdr(Object.entries(this.data.presetParameter).map((elem) => elem[0]));
    } else {
      this.cdrs = this.data.subscription.getParameterCdr();
    }
  }

  public addFormControl(name: string, control: AbstractControl<any, any>) {
    this.reportFormGroup.addControl(name, control);
    this.changeDetectorRef.detectChanges();
  }

  public async viewReport(): Promise<void> {
    this.sidesheetRef.close(true);
  }
}
