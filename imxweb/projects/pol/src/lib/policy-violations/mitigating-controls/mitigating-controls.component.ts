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

import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormControl, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { EuiLoadingService, EuiSelectOption, EuiSidesheetRef } from '@elemental-ui/core';
import { ConfirmationService, SnackBarService } from 'qbm';
import { Subscription } from 'rxjs';
import { PolicyViolationsService } from '../policy-violations.service';
import { PolicyViolationExtended } from './policy-violation-extended';

@Component({
  selector: 'imx-mitigating-controls',
  templateUrl: './mitigating-controls.component.html',
  styleUrls: ['./mitigating-controls.component.scss'],
})
export class MitigatingControlsComponent implements OnInit {
  @Input() public uidViolation: string;
  @Input() public isMControlPerViolation: boolean;
  @Input() public sidesheetRef: EuiSidesheetRef;

  public mControls: PolicyViolationExtended[];
  public subscriptions$: Subscription[] = [];
  public mitigatingForm: UntypedFormGroup;
  public options: EuiSelectOption[] = [];
  public mitigatingCaption: string;

  private controlsToDelete: PolicyViolationExtended[] = [];

  constructor(
    private readonly violationService: PolicyViolationsService,
    private readonly loadingService: EuiLoadingService,
    private confirmationService: ConfirmationService,
    private cd: ChangeDetectorRef,
    private snackbar: SnackBarService,
    formBuilder: UntypedFormBuilder
  ) {
    this.mitigatingForm = new UntypedFormGroup({ formArray: formBuilder.array([]) });
    this.mitigatingCaption = violationService.mitigationSchema.Columns.UID_MitigatingControl.Display;
  }

  public filter = (option: EuiSelectOption, searchInputValue: string): boolean =>
    option.value.toString().toUpperCase() === searchInputValue.toUpperCase();

  public get formArray(): UntypedFormArray {
    return this.mitigatingForm.get('formArray') as UntypedFormArray;
  }

  public get notSaveable(): boolean {
    if (this.controlsToDelete.length !== 0) {
      this.mitigatingForm.markAsDirty();
    }

    if (!this.mitigatingForm.dirty || !this.mitigatingForm.valid) {
      return true;
    }

    return (
      this.mControls.length > 0 &&
      this.mControls.every((ctrl) => {
        return !ctrl.editable || ctrl.UID_MitigatingControl.value === null || ctrl.UID_MitigatingControl.value === '';
      }) &&
      this.controlsToDelete.length === 0
    );
  }

  public get isDirty(): boolean {
    return this.mitigatingForm.dirty || this.controlsToDelete.length > 0;
  }

  public async onSelectionChange(mcontrol: PolicyViolationExtended, value: string): Promise<void> {
    mcontrol.UID_MitigatingControl.value = value;
    this.formArray.updateValueAndValidity();
    this.cd.detectChanges();
    return;
  }

  public async ngOnInit(): Promise<void> {
    this.sidesheetRef.componentInstance.disableClose = true;
    this.subscriptions$.push(
      this.sidesheetRef.closeClicked().subscribe(async () => {
        if (!this.isDirty || (await this.confirmationService.confirmLeaveWithUnsavedChanges())) {
          this.sidesheetRef.close();
        }
      })
    );
    return this.loadMitigationControls();
  }

  private isDuplicate(actrl: FormControl<string | undefined>): boolean {
    const test = this.mControls.findIndex((ctrl) => ctrl.formControl != actrl && ctrl?.UID_MitigatingControl.value === actrl.value) !== -1;
    return test;
  }

  public canDelete(index: number): boolean {
    return (
      this.mControls[index]?.UID_MitigatingControl.Column.GetMetadata().CanEdit() || this.mControls[index].GetEntity().GetKeys() == null
    );
  }

  public async delete(index: number): Promise<void> {
    const elem = this.mControls[index];
    if (elem.UID_MitigatingControl.value !== '' && !(await this.confirmationService.confirmDelete())) {
      return;
    }
    if (elem.GetEntity().GetKeys() != null) {
      this.controlsToDelete.push(elem);
    }

    //Remove the controls and update ui
    this.mControls.splice(index, 1);
    this.formArray.controls.splice(index, 1);
    this.formArray.controls.forEach((elem) => elem.updateValueAndValidity());
    this.cd.detectChanges();
  }

  public async addMitigatingControl(): Promise<any> {
    const newControl = new PolicyViolationExtended(true, this.violationService.createMitigatingControl(this.uidViolation));
    this.mControls.push(newControl);
    this.formArray.push(newControl.formControl);
    newControl.formControl.setValidators([
      Validators.required,
      (control: FormControl<string | undefined>) => (this.isDuplicate(control) ? { duplicated: true } : null),
    ]);
    this.cd.detectChanges();
  }

  public async save() {
    const overlay = this.loadingService.show();
    try {
      for (const ctrl of this.controlsToDelete) {
        await this.violationService.deleteMitigationControl(this.uidViolation, ctrl.UID_MitigatingControl.value);
      }
      for (const ctrl of this.mControls.filter((elem) => elem.editable)) {
        await ctrl.GetEntity().Commit(false);
      }
    } finally {
      this.loadingService.hide(overlay);
      this.snackbar.open({
        key: '#LDS#The mitigating controls have been successfully saved.',
        parameters: [this.sidesheetRef.componentInstance?.config.subTitle],
      });
      this.sidesheetRef.close();
    }
  }

  private async loadMitigationControls(): Promise<void> {
    const overlay = this.loadingService.show();
    try {
      //reload
      this.mControls = (await this.violationService.getMitigatingContols(this.uidViolation)).Data.map(
        (elem) => new PolicyViolationExtended(false, elem)
      );
      this.mControls.forEach((elem) => this.formArray.push(elem.formControl));
      await this.initOptions();
    } finally {
      this.loadingService.hide(overlay);
    }
  }

  private async initOptions(): Promise<void> {
    this.options = (
      await this.violationService.getCandidates(
        this.uidViolation,
        {},
        {
          PageSize: 100000,
        }
      )
    ).Entities?.map((elem) => ({ display: elem.Display, value: elem.Keys[0] }));
  }
}
