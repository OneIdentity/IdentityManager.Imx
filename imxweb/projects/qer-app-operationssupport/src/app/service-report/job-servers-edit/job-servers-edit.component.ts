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
import { EuiLoadingService, EuiSidesheetService, EUI_SIDESHEET_DATA, EuiSidesheetRef } from '@elemental-ui/core';
import { FormGroup, FormArray } from '@angular/forms';
import { BaseCdr, ColumnDependentReference, ConfirmationService, SnackBarService } from 'qbm';
import { OpsupportJobservers } from 'imx-api-qbm';

@Component({
  selector: 'imx-job-servers-edit',
  templateUrl: './job-servers-edit.component.html',
  styleUrls: ['./job-servers-edit.component.scss'],
})
export class JobServersEditComponent implements OnInit {
  public readonly serverDetailsFormGroup: FormGroup;
  public cdrList: ColumnDependentReference[] = [];
  constructor(
    @Inject(EUI_SIDESHEET_DATA) public serverDetails:{data: OpsupportJobservers, properties: string[]},
    private readonly sidesheet: EuiSidesheetService,
    private readonly sidesheetRef: EuiSidesheetRef,
    private readonly snackBarService: SnackBarService,
    private readonly euiLoadingService: EuiLoadingService,
    private readonly confirmation: ConfirmationService
  ) {
    this.serverDetailsFormGroup = new FormGroup({
      formArray: new FormArray([]),
    });

    this.sidesheetRef.closeClicked().subscribe(async () => {
      if (!this.serverDetailsFormGroup.dirty || (await this.confirmation.confirmLeaveWithUnsavedChanges())) {
        this.serverDetails.data.GetEntity().DiscardChanges();
        this.sidesheetRef.close();
      }
    });
  }

  public ngOnInit(): void {
    this.setup();
  }

  public setup(): void {
    let overlayRef = this.euiLoadingService.show();
    try {
      this.serverDetails.properties.forEach((field) => {
        this.cdrList.push(new BaseCdr(this.serverDetails.data.GetEntity().GetColumn(field)));
      });
    } finally {
      this.euiLoadingService.hide(overlayRef);
    }
  }

  public async submit(): Promise<void> {
    if (this.serverDetailsFormGroup.valid) {
      let overlayRef = this.euiLoadingService.show();
      try {
        await this.serverDetails.data.GetEntity().Commit(true);
        this.sidesheet.close();
        let textContainer = { key: '#LDS#Your changes have been successfully saved.' };
        this.snackBarService.open(textContainer, '#LDS#Close', { duration: 6000 });
      } finally {
        this.euiLoadingService.hide(overlayRef);
      }
    }
  }
}
