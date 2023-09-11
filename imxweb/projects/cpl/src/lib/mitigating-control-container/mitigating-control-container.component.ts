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

import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray } from '@angular/forms';
import { EuiSelectOption } from '@elemental-ui/core';
import { ConfirmationService } from 'qbm';
import { MitigatingControlData } from '../request/compliance-violation-details/edit-mitigating-controls/mitigating-controls-request/mitigating-control-data.interface';
import { RequestMitigatingControls } from '../request/compliance-violation-details/edit-mitigating-controls/mitigating-controls-request/request-mitigating-controls';
import { PersonMitigatingControls } from '../rules-violations/mitigating-controls-person/person-mitigating-controls';

@Component({
  selector: 'imx-mitigating-control-container',
  templateUrl: './mitigating-control-container.component.html',
  styleUrls: ['../mitigating-controls-common.scss'],
})
export class MitigatingControlContainerComponent {
  @Input() public mControls: MitigatingControlData[] | PersonMitigatingControls[] = [];
  @Input() public mitigatingCaption: string;
  @Input() public formArray: FormArray;
  @Input() public options: EuiSelectOption[] = [];

  @Output() public controlDeleted = new EventEmitter<MitigatingControlData | PersonMitigatingControls>();
  @Output() public controlsRequested = new EventEmitter<void>();

  constructor(private readonly cd: ChangeDetectorRef, private readonly confirmationService: ConfirmationService) {}

  public async onSelectionChange(mcontrol: RequestMitigatingControls | PersonMitigatingControls, value: string): Promise<void> {
    mcontrol.UID_MitigatingControl.value = value;
    this.formArray.updateValueAndValidity();
    this.cd.detectChanges();
    return;
  }

  public onOpenChange(isopen: boolean, mControl: RequestMitigatingControls | PersonMitigatingControls): void {
    if (!isopen) {
      mControl.formControl.updateValueAndValidity({ onlySelf: true });
    }
  }

  public async onDelete(mControl: RequestMitigatingControls | PersonMitigatingControls | undefined, index: number): Promise<void> {
    if (mControl.UID_MitigatingControl.value !== '' && !(await this.confirmationService.confirmDelete())) {
      return;
    }
    if (mControl.GetEntity().GetKeys() != null) {
      this.controlDeleted.emit(mControl);
    }
    this.mControls.splice(index, 1);
    this.formArray.controls.splice(index, 1);
    this.formArray.controls.forEach((elem) => elem.updateValueAndValidity());
    this.cd.detectChanges();
  }

  public async onCreateControl(): Promise<void> {
    this.controlsRequested.emit();
  }
}
