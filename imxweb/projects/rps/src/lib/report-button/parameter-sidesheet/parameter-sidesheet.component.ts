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

import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { ClassloggerService, ColumnDependentReference } from 'qbm';
import { ReportSubscription } from '../../subscriptions/report-subscription/report-subscription';

@Component({
  selector: 'imx-parameter-sidesheet',
  templateUrl: './parameter-sidesheet.component.html',
  styleUrls: ['./parameter-sidesheet.component.scss']
})
export class ParameterSidesheetComponent {
  public readonly reportFormGroup = new UntypedFormGroup({});

  public cdrs: ColumnDependentReference[];
  public writeOperators = 1;
  constructor(
    private readonly sidesheetRef: EuiSidesheetRef,
    private readonly changeDetectorRef: ChangeDetectorRef,
    @Inject(EUI_SIDESHEET_DATA) public readonly data: { subscription: ReportSubscription },
    logger: ClassloggerService
  ) {
    this.cdrs = data.subscription.getParameterCdr();
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

  public addFormControl(name: string, control: UntypedFormControl) {
    this.reportFormGroup.addControl(name, control);
    this.changeDetectorRef.detectChanges();
  }

  public viewReport() {
    this.sidesheetRef.close(true);
  }
}
