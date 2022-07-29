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
 * Copyright 2022 One Identity LLC.
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

import { Component, Inject, OnDestroy, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { PortalServiceitemsInteractive } from 'imx-api-qer';

import { ClassloggerService, ColumnDependentReference, ConfirmationService, SnackBarService } from 'qbm';
import { Subscription } from 'rxjs';
import { ServiceItemsEditService } from '../../service-items-edit/service-items-edit.service';
import { ServiceItemsEditFormComponent } from '../service-items-edit-form/service-items-edit-form.component';

@Component({
  selector: 'imx-service-items-edit-sidesheet',
  templateUrl: './service-items-edit-sidesheet.component.html',
  styleUrls: ['./service-items-edit-sidesheet.component.scss']
})
export class ServiceItemsEditSidesheetComponent implements OnDestroy {

  @ViewChild('serviceItemsEditForm') public serviceItemsEditForm: ServiceItemsEditFormComponent;

  public readonly formGroup: FormGroup;
  public cdrList: ColumnDependentReference[] = [];
  public isInActiveFormControl = new FormControl();

  private readonly subscriptions: Subscription[] = [];

  constructor(
    formBuilder: FormBuilder,
    @Inject(EUI_SIDESHEET_DATA) public serviceItem: PortalServiceitemsInteractive,
    private serviceItemsEditService: ServiceItemsEditService,
    private readonly sidesheetRef: EuiSidesheetRef,
    private readonly logger: ClassloggerService,
    private readonly snackbar: SnackBarService,
    confirmation: ConfirmationService
  ) {
    this.formGroup = new FormGroup({ formArray: formBuilder.array([]) });

    this.subscriptions.push(this.sidesheetRef.closeClicked().subscribe(async () => {
      if (this.formGroup.pristine || await confirmation.confirmLeaveWithUnsavedChanges()) {
        this.sidesheetRef.close();
      }
    }));
  }

  get formArray(): FormArray {
    return this.formGroup.get('formArray') as FormArray;
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  public async saveChanges(): Promise<void> {
    if (this.formGroup.valid) {
      this.serviceItemsEditForm?.saveTags();
      const uidPerson = this.serviceItemsEditForm?.getSelectedUidPerson;
      let confirmMessage = '#LDS#The service item has been successfully saved.';
      if (uidPerson) {
        // PortalServiceitemsInteractive cannot write extendedData,
        // but this code was here and should not break with strong typing
        (<any>this.serviceItem).extendedData = {
          UidPerson: uidPerson,
          CopyAllMembers: true,
        };
        confirmMessage = '#LDS#The service item has been successfully saved. It may take some time for the changes to take effect.';
      } else {
        (<any>this.serviceItem).extendedData = undefined;
      }

      this.logger.debug(this, `Saving group changes`);
      this.serviceItemsEditService.handleOpenLoader();
      try {
        await this.serviceItem.GetEntity().Commit(true);
        this.formGroup.markAsPristine();
        this.sidesheetRef.close(true);
        this.snackbar.open({ key: confirmMessage });
      } finally {
        this.serviceItemsEditService.handleCloseLoader();
      }
    }
  }
}
