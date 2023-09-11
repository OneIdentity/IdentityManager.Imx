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

import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { Subscription } from 'rxjs';
import { CDRGroups, RequestStepData } from '../approval-workflow.interface';
import { FormDataService } from '../form-data.service';
import { IEntity } from 'imx-qbm-dbts';
import { ColumnDependentReference } from 'qbm';

@Component({
  selector: 'imx-approval-step-form',
  templateUrl: './approval-step-form.component.html',
  styleUrls: ['./approval-step-form.component.scss'],
})
export class ApprovalStepFormComponent implements OnInit, OnDestroy {
  public readonly formGroup: FormGroup;
  public entity: IEntity;
  public cdrGroups: CDRGroups;
  public isCdrReadOnly: boolean[];
  public columnNameToIndex: { [name: string]: number } = {};

  private readonly subscriptions: Subscription[] = [];

  constructor(
    formBuilder: FormBuilder,
    @Inject(EUI_SIDESHEET_DATA) public requestData: RequestStepData,
    public formService: FormDataService,
    public sidesheetRef: EuiSidesheetRef,
    private cd: ChangeDetectorRef
  ) {
    this.formGroup = new FormGroup({ formArray: formBuilder.array([]) });

    this.subscriptions.push(
      this.sidesheetRef.closeClicked().subscribe(async () => {
        await this.formService.cancelChangesGrouped(this.formGroup, this.sidesheetRef, this.requestData);
      })
    );
  }
  get formArray(): FormArray {
    return this.formGroup.get('formArray') as FormArray;
  }

  public ngOnInit(): void {
    this.cdrGroups = this.formService.setupGrouped(this.requestData);
    this.isCdrReadOnly = this.cdrGroups.General.map((cdr) => cdr.isReadOnly());
  }

  // Logic to determine if the incoming control is a replacement or a new control
  public addControl(index: number, control: AbstractControl): void {
    index < this.formArray.length ? this.formArray.setControl(index, control) : this.formArray.push(control);
  }

  // Check if changing a CDR value triggered other cdrs to be editible / mandatory
  public checkCDRs(): void {
    this.cdrGroups.General.forEach((cdr, i) => {
      if (cdr.isReadOnly() !== this.isCdrReadOnly[i]) {
        this.isCdrReadOnly[i] = cdr.isReadOnly();
        const columnName = cdr.column.ColumnName;
        this.cdrGroups.General[i] = this.formService.createCdr(this.requestData, columnName);
      }
      if (cdr.column.ColumnName === 'MinutesAutomaticDecision') {
        // We will treat this field specially, signal it has been touched to trigger a status check
        cdr.valueConstraint = {
          MinValue: cdr.column.GetMetadata().GetMinLength(),
        };
        this.formArray.controls[i].markAsTouched();
      }
    });
    this.cd.detectChanges();
  }

  public canSee(cdr: ColumnDependentReference): boolean {
    return cdr.column.GetMetadata().CanSee();
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }
}
