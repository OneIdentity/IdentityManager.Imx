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

import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { RulesMitigatingControls } from './rules-mitigating-controls';
import { MitigatingControlsRulesService } from './mitigating-controls-rules.service';
import { EuiLoadingService, EuiSidesheetRef } from '@elemental-ui/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ConfirmationService, SnackBarService } from 'qbm';
import { Subscription } from 'rxjs';

@Component({
  selector: 'imx-mitigating-controls-rules',
  templateUrl: './mitigating-controls-rules.component.html',
  styleUrls: ['./mitigating-controls-rules.component.scss'],
})
export class MitigatingControlsRulesComponent implements OnInit, OnDestroy {
  @Input() public isMControlPerViolation: boolean;
  @Input() public uidNonCompliance: string;
  @Input() public uidCompliance: string;
  @Input() public mControls: RulesMitigatingControls[];
  @Input() public sidesheetRef: EuiSidesheetRef;
  @Input() public canEdit = true; 
  public subscriptions$: Subscription[] = [];
  public formGroup: UntypedFormGroup;

  constructor(
    public mControlService: MitigatingControlsRulesService,
    private formBuilder: UntypedFormBuilder,
    private cd: ChangeDetectorRef,
    private busyService: EuiLoadingService,
    private snackbarService: SnackBarService,
    private confirmationService: ConfirmationService
  ) {
    this.formGroup = new UntypedFormGroup({ formArray: formBuilder.array([]) });
  }

  get formArray(): UntypedFormArray {
    return this.formGroup.get('formArray') as UntypedFormArray;
  }

  public ngOnInit(): void {
    this.subscriptions$.push(
      this.sidesheetRef.closeClicked().subscribe(async () => {
        if (!this.formGroup.dirty || (await this.confirmationService.confirmLeaveWithUnsavedChanges())) {
          this.sidesheetRef.close();
        }
      })
    );
  }

  public ngOnDestroy(): void {
    this.subscriptions$.map((sub) => sub.unsubscribe());
  }

  public getMControlId(mControl: RulesMitigatingControls): string {
    return mControl.GetEntity().GetColumn('UID_MitigatingControl').GetValue();
  }

  public onCreateControl(): void {
    const mControl = this.mControlService.createControl(this.uidCompliance);
    this.mControls.push(mControl);
    this.formGroup.markAsDirty();
    this.cd.detectChanges();
  }

  public async onDelete(mControl: RulesMitigatingControls, index: number): Promise<void> {
    if (mControl.GetEntity().GetKeys()) {
      // Only call delete if the control exists on the server
      this.busyService.show();
      try {
        await this.mControlService.deleteControl(mControl);
      } finally {
        this.busyService.hide();
      }
    }
    this.formArray.removeAt(index);
    this.mControls.splice(index, 1);
    this.cd.detectChanges();
  }

  public hasDuplicates(): boolean {
    const values = this.mControls.map((mControl) => this.getMControlId(mControl));
    const uniqueValues = [...new Set(values)];
    return values.length !== uniqueValues.length;
  }

  public async onSave(): Promise<void> {
    if (this.hasDuplicates()) {
      await this.confirmationService.confirmGeneral({
        ShowOk: true,
        Title: '#LDS#Heading Mitigating Control Assigned More Than Once',
        Message: '#LDS#Saving is not possible. At least one mitigating control is assigned more than once. Remove the multiple assigned mitigating control and try again.',
      });
      return;
    }
    this.busyService.show();
    try {
      await this.handleSave();
    } finally {
      this.busyService.hide();
      this.snackbarService.open({
        key: '#LDS#The mitigating controls have been successfully saved.',
      });
    }
  }

  public async handleSave(): Promise<void> {
    for await (const [index, mControl] of this.mControls.entries()) {
      if (this.formArray.controls[index].dirty) {
        // Only save if the form array is dirty
        const _ = await this.mControlService.postControl(this.uidNonCompliance, mControl.baseObject);
      }
    }
    this.resetForm();
  }

  public async resetForm(): Promise<void> {
    // Since we must handle change detection manually, overwrite formgroup and get read-only mcontrols
    this.formGroup = new UntypedFormGroup({ formArray: this.formBuilder.array([]) });
    this.mControls = (await this.mControlService.getControls(this.uidNonCompliance)).Data;
    this.cd.detectChanges();
  }
}
