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

import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { EntitySchema } from 'imx-qbm-dbts';
import { BaseCdr, ClassloggerService, ColumnDependentReference, ConfirmationService, SnackBarService } from 'qbm';
import { Subscription } from 'rxjs';
import { PolicyGroupService } from '../policy-group.service';
import {PolicyGroup} from '../policy-group.interface';
@Component({
  templateUrl: './edit-policy-group-sidesheet.component.html',
  styleUrls: ['./edit-policy-group-sidesheet.component.scss']
})
export class EditPolicyGroupSidesheetComponent implements OnInit {

  public readonly formGroup = new UntypedFormGroup({});
  public readonly schema: EntitySchema;
  public objectProperties:ColumnDependentReference[]=[]
  public formArray: UntypedFormArray;
  public reload = false;
  public hasAttestations: boolean;

  private valueChangedSubscription: Subscription;
  private closeSubscription: Subscription;

  constructor(
    @Inject(EUI_SIDESHEET_DATA) public readonly policygroup: PolicyGroup,
    public readonly sidesheetRef: EuiSidesheetRef,
    private readonly snackBar: SnackBarService,
    private readonly policyGroupService: PolicyGroupService,
    private readonly logger: ClassloggerService,
    private readonly confirmationService: ConfirmationService
  ) {
    this.initOrRefreshCdrDictionary();
    this.formGroup = new UntypedFormGroup({
      formArray: new UntypedFormArray([])
    });
    this.formArray = this.formGroup.get('formArray') as UntypedFormArray;
    this.closeSubscription = this.sidesheetRef.closeClicked().subscribe(async () => {
      if (!this.formGroup.dirty
        || await confirmationService.confirmLeaveWithUnsavedChanges()) {
        this.sidesheetRef.close(this.reload);
      }
    });
  }

  public async ngOnInit(): Promise<void> {
    this.logger.trace('call isEnabledSubject with', this.policygroup.policyGroup.UID_QERPickCategory.value == null);
  }

  public ngOnDestroy(): void {
    if (this.valueChangedSubscription) {
      this.valueChangedSubscription.unsubscribe();
    }
    if (this.closeSubscription) {
      this.closeSubscription.unsubscribe();
    }
  }

  public addFormControl(columnName: string, control: UntypedFormControl): void {
    // Add control after timeout to prevent expression changed error
    setTimeout(() => {
      this.formGroup.addControl(columnName, control);
    });
  }

  public initOrRefreshCdrDictionary(refresh: boolean = false): void {
    if (this.policygroup.policyGroup == null) {
      return;
    }
    const columns = [
      this.policygroup.policyGroup.Ident_AttestationPolicyGroup.Column,
      this.policygroup.policyGroup.Description.Column,
      this.policygroup.policyGroup.IsInActive.Column,
      this.policygroup.policyGroup.UID_AERoleOwner.Column,
      this.policygroup.policyGroup.UID_DialogSchedule.Column,
      this.policygroup.policyGroup.UID_PersonOwner.Column,
      this.policygroup.policyGroup.UID_QERPickCategory.Column
    ];

    for (const column of columns) {
      if (!column.GetMetadata().CanSee()) {
        continue;
      }
      if (refresh) {
        this.objectProperties.push(new BaseCdr(column));
      } else {
        this.objectProperties.push(new BaseCdr(column));
      }
    }
  }

  public addControl(columnName: string, evt: UntypedFormControl): void {
    setTimeout(() =>
    this.formGroup.addControl(columnName, evt)
  );
  }

  public async saveChanges(): Promise<void> {
    if (this.formGroup.valid) {
      this.policyGroupService.handleOpenLoader();
      let confirmMessage = !this.policygroup.isNew ? '#LDS#The policy collection has been successfully saved.' :'#LDS#The policy collection has been successfully created.';
      try {
        this.policygroup.policyGroup.GetEntity().Commit(false);
        this.sidesheetRef.close(true);
        this.snackBar.open({ key: confirmMessage });
      } finally {
        this.policyGroupService.handleCloseLoader();
      }
    }
  }

  public async delete(): Promise<void> {
    if (await this.confirmationService.confirm({
      Title: '#LDS#Heading Delete Policy Collection',
      Message: '#LDS#Are you sure you want to delete the policy collection?'
    })) {
      this.policyGroupService.handleOpenLoader();
      try {
        const key = this.policygroup.policyGroup.GetEntity().GetKeys()[0];
        await this.policyGroupService.deleteAttestationPolicyGroup(key);
        this.logger.debug(this, `policy ${key} deleted`);
      } finally {
        this.policyGroupService.handleCloseLoader();
      }
      this.sidesheetRef.close();
    }
  }

}
