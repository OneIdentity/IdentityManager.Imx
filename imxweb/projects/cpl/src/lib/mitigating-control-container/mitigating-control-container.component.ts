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

import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray } from '@angular/forms';
import { EuiSelectOption } from '@elemental-ui/core';
import { ConfirmationService } from 'qbm';
import { ExtendedDeferredOperationsData } from '../request/compliance-violation-details/edit-mitigating-controls/mitigating-controls-request/extended-deferred-operations-data';
import { RequestMitigatingControls } from '../request/compliance-violation-details/edit-mitigating-controls/mitigating-controls-request/request-mitigating-controls';
import { PersonMitigatingControls } from '../rules-violations/mitigating-controls-person/person-mitigating-controls';

@Component({
  selector: 'imx-mitigating-control-container',
  templateUrl: './mitigating-control-container.component.html',
  styleUrls: ['../mitigating-controls-common.scss'],
})
export class MitigatingControlContainerComponent {
  @Input() public mControls: Array<RequestMitigatingControls | ExtendedDeferredOperationsData | PersonMitigatingControls> = [];
  @Input() public mitigatingCaption: string;
  @Input() public formArray: FormArray;
  @Input() public options: EuiSelectOption[] = [];

  @Output() public controlDeleted = new EventEmitter<RequestMitigatingControls | PersonMitigatingControls>();
  @Output() public controlsRequested = new EventEmitter<void>();

  constructor(
    private readonly cd: ChangeDetectorRef,
    private readonly confirmationService: ConfirmationService,
  ) {}

  public filter = (option: EuiSelectOption, searchInputValue: string): boolean =>
    option.value.toString().toUpperCase() === searchInputValue.toUpperCase();

  public async onSelectionChange(
    mcontrol: RequestMitigatingControls | ExtendedDeferredOperationsData | PersonMitigatingControls,
    option: EuiSelectOption | EuiSelectOption[],
  ): Promise<void> {
    // Multiple is set to false so there is no array of options
    mcontrol.uidMitigatingControl = (option as EuiSelectOption).value;
    this.formArray.updateValueAndValidity();
    this.cd.detectChanges();
    return;
  }

  public onOpenChange(
    isopen: boolean,
    mControl: RequestMitigatingControls | ExtendedDeferredOperationsData | PersonMitigatingControls,
  ): void {
    if (!isopen) {
      mControl?.formControl.updateValueAndValidity({ onlySelf: true });
    }
  }

  public async onDelete(
    mControl: RequestMitigatingControls | ExtendedDeferredOperationsData | PersonMitigatingControls | undefined,
    index: number,
  ): Promise<void> {
    if (mControl?.uidMitigatingControl !== '' && !(await this.confirmationService.confirmDelete())) {
      return;
    }
    if (!(mControl instanceof ExtendedDeferredOperationsData) && mControl?.GetEntity().GetKeys() != null) {
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
