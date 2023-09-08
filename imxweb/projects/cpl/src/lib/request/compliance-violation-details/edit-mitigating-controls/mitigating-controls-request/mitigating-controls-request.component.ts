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
import { Subscription } from 'rxjs';

import { ConfirmationService, EntityService, SettingsService, SnackBarService } from 'qbm';
import { ExtendedDeferredOperationsData } from './extended-deferred-operations-data';
import { MitigatingControlData } from './mitigating-control-data.interface';
import { MitigatingControlsRequestService } from './mitigating-controls-request.service';
import { RequestMitigatingControlFilterPipe } from './request-mitigating-control-filter.pipe';
import { RequestMitigatingControls } from './request-mitigating-controls';

@Component({
  selector: 'imx-mitigating-controls-request',
  templateUrl: './mitigating-controls-request.component.html',
  styleUrls: ['../../../../mitigating-controls-common.scss', 'mitigating-controls-request.component.scss'],
})
export class MitigatingControlsRequestComponent implements OnInit {
  @Input() public uidPerson: string;
  @Input() public uidNonCompliance: string;
  @Input() public uidPersonWantsOrg: string;
  @Input() public status: string;
  @Input() public sidesheetRef: EuiSidesheetRef;
  @Input() public readOnly: boolean;
  @Input() public closeOnSave: boolean;
  @Input() public isMControlPerViolation: boolean;

  public subscriptions$: Subscription[] = [];
  public formGroup: UntypedFormGroup;
  public options: EuiSelectOption[] = [];

  public mControls: MitigatingControlData[] = [];
  public mControlsToDelete: MitigatingControlData[] = [];

  public mitigatingCaption: string;
  public headertext: string;

  constructor(
    public mControlService: MitigatingControlsRequestService,
    private formBuilder: UntypedFormBuilder,
    private cd: ChangeDetectorRef,
    private busyService: EuiLoadingService,
    private snackbarService: SnackBarService,
    private settingService: SettingsService,
    private confirmationService: ConfirmationService,
    private entityService: EntityService
  ) {
    this.mitigatingCaption = mControlService.mitigationSchema.Columns.UID_MitigatingControl.Display;
    this.formGroup = new UntypedFormGroup({ formArray: formBuilder.array([]) });
  }

  get formArray(): UntypedFormArray {
    return this.formGroup.get('formArray') as UntypedFormArray;
  }

  public hasItems(filter: 'active' | 'inactive' | 'deferred'):boolean {
    return RequestMitigatingControlFilterPipe.getItems(this.mControls, filter)?.length > 0;
  }

  public get itemText(): string {
    return this.mControls.every((elem) => elem.isDeferredData)
      ? '#LDS#The following mitigating controls will be automatically assigned to the rule violation if this request is approved.'
      : '#LDS#The following mitigating controls are assigned to this request.';
  }

  public get notSaveable(): boolean {
    if (this.mControlsToDelete.length !== 0) {
      this.formGroup.markAsDirty();
    }

    if (!this.formGroup.dirty || !this.formGroup.valid) {
      return true;
    }

    return (
      this.mControls.length > 0 &&
      this.mControls.every((ctrl) => {
        return !ctrl.editable || ctrl.uidMitigatingControl === null || ctrl.uidMitigatingControl === '';
      }) &&
      this.mControlsToDelete.length === 0
    );
  }

  public get isDirty(): boolean {
    return this.formGroup.dirty || this.mControlsToDelete.length > 0;
  }

  public async ngOnInit(): Promise<void> {
    this.subscriptions$.push(
      this.sidesheetRef.closeClicked().subscribe(async () => {
        if (!this.isDirty || (await this.confirmationService.confirmLeaveWithUnsavedChanges())) {
          this.sidesheetRef.close();
        }
      })
    );
    this.headertext = !this.readOnly
      ? '#LDS#Heading Mitigating Controls Can Be Assigned Individually'
      : '#LDS#Heading Mitigating Controls';
    await this.loadMitigatingControls();
  }

  public ngOnDestroy(): void {
    this.subscriptions$.map((sub) => sub.unsubscribe());
  }

  public async onSelectionChange(mcontrol: RequestMitigatingControls, value: string): Promise<void> {
    mcontrol.UID_MitigatingControl.value = value;
    this.formArray.updateValueAndValidity();
    this.cd.detectChanges();
    return;
  }

  public onOpenChange(isopen: boolean, mControl: RequestMitigatingControls): void {
    if (!isopen) {
      mControl.formControl.updateValueAndValidity({ onlySelf: true });
    }
  }

  public onControlDeleted( mControl: RequestMitigatingControls){
    this.mControlsToDelete.push(mControl);
  }

  public getMControlId(mControl: RequestMitigatingControls): string {
    return mControl.GetEntity().GetColumn('UID_MitigatingControl').GetValue();
  }

  public async onCreateControl(): Promise<void> {
    const mControl = this.mControlService.createControl(this.uidPerson, this.uidNonCompliance);
    this.mControls.push(mControl);
    this.formArray.push(mControl.formControl);
    this.cd.detectChanges();

    mControl.formControl.setValidators([
      Validators.required,
      (control: FormControl<string | undefined>) => (this.isDuplicate(control) ? { duplicated: true } : null),
    ]);
    this.formGroup.markAsDirty();
  }


  public async onSave(): Promise<void> {
    const overlay = this.busyService.show();
    try {
      await this.handleSave();
    } finally {
      this.busyService.hide(overlay);
      this.snackbarService.open({
        key: '#LDS#The mitigating controls have been successfully saved.',
      });
      if (this.closeOnSave) {
        this.sidesheetRef.close();
      }
    }
  }

  public async handleSave(): Promise<void> {
    for (const ctrl of this.mControlsToDelete) {
      await this.mControlService.deleteControl(ctrl);
    }
    for (const ctrl of this.mControls.filter((elem) => elem.editable)) {
      if (this.uidPersonWantsOrg != null && this.uidPersonWantsOrg !== '') {
        await this.mControlService.postControlRequest(
          this.uidPerson,
          this.uidNonCompliance,
          this.uidPersonWantsOrg,
          ctrl.uidMitigatingControl
        );
      } else {
        await this.mControlService.postControl(this.uidPerson, this.uidNonCompliance, ctrl.data);
      }
    }

    if (!this.closeOnSave) {
      this.resetForm();
    }
  }

  public async resetForm(): Promise<void> {
    // Since we must handle change detection manually, overwrite formgroup and get read-only mcontrols
    this.formGroup = new UntypedFormGroup({ formArray: this.formBuilder.array([]) });
    this.mControlsToDelete = [];
    await this.loadMitigatingControls();
    this.cd.detectChanges();
  }

  private async loadMitigatingControls(): Promise<void> {
    if (!this.isMControlPerViolation) {
      this.mControls = [];
      return;
    }

    const overlay = this.busyService.show();
    try {
      //reload
      const data = await this.mControlService.getControls(this.uidPerson, this.uidNonCompliance);
      this.mControls = data.Data.map((elem) => new RequestMitigatingControls(false, elem));
      this.mControls.push(
        ...data.extendedData.MitigatingControls.map((elem) => new ExtendedDeferredOperationsData(elem, this.entityService))
      );

      if (!this.readOnly) {
        this.mControls.forEach((elem) => this.formArray.push(elem.formControl));
        await this.initOptions();
      }
    } finally {
      this.busyService.hide(overlay);
    }
  }

  private isDuplicate(actrl: FormControl<string | undefined>): boolean {
    const test = this.mControls.findIndex((ctrl) => ctrl.formControl != actrl && ctrl?.uidMitigatingControl === actrl.value) !== -1;
    return test;
  }

  private async initOptions(): Promise<void> {
    const optionCandidates = await this.mControlService.getCandidates(
      this.uidPerson,
      this.uidNonCompliance,
      {},
      {
        PageSize: this.settingService.PageSizeForAllElements,
      }
    );
    this.options = optionCandidates.Entities.map((elem) => ({ display: elem.Display, value: elem.Keys[0] }));
  }
}
