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

import { Component, Inject, OnDestroy } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { EUI_SIDESHEET_DATA, EuiSidesheetRef } from '@elemental-ui/core';
import { PortalWebauthnkey } from 'imx-api-qer';
import { IEntity } from 'imx-qbm-dbts';
import { BaseCdr, BusyService, ColumnDependentReference, ConfirmationService, SnackBarService } from 'qbm';
import { Subscription } from 'rxjs';
import { SecurityKeysService } from '../security-keys.service';

@Component({
  templateUrl: './security-keys-sidesheet.component.html',
  styleUrls: ['./security-keys-sidesheet.component.scss']
})
export class SecurityKeysSidesheetComponent implements OnDestroy {
  public readonly formGroup = new UntypedFormGroup({
    DisplayName: new UntypedFormControl(this.data.DisplayName.value, { updateOn: 'blur', validators: [Validators.required] }),
  });
  public cdrList: ColumnDependentReference[];
  public busyService = new BusyService();
  private subscriptions: Subscription[] = [];


  constructor(
    @Inject(EUI_SIDESHEET_DATA) public data: PortalWebauthnkey,
    private readonly sidesheetRef: EuiSidesheetRef,
    private readonly snackbar: SnackBarService,
    private readonly securityKeysService: SecurityKeysService,
    private readonly confirmation: ConfirmationService,
  ) {
    const entity = data.GetEntity();
    this.cdrList = this.createCdrList(entity);

    this.subscriptions.push(this.sidesheetRef.closeClicked().subscribe(async () => {
      if (this.formGroup.pristine || await this.confirmation.confirmLeaveWithUnsavedChanges()) {
        this.sidesheetRef.close();
      }
    }));
  }

  /**
   * Creates a cdr list from the data and its entity
   * @param entity the data's entity
   * @returns Base cdr list
   */
  private createCdrList(entity: IEntity): BaseCdr[] {
    const cdrList = [];
    const columnNames: string[] = Object.keys(this.data).reverse().filter((column) => column !== "DisplayName");
    columnNames?.forEach((name) => {
      try {
        cdrList.push(new BaseCdr(entity.GetColumn(name)));
      } catch {}
    });
    return cdrList;
  }

  /**
   * Saves the security key's data (in case of a change)
   */
  public async saveSecurityKey(): Promise<void> {
    if (this.formGroup.valid) {
      const isBusy = this.busyService.beginBusy();
      const confirmMessage = '#LDS#The security key has been successfully saved.';

      try {
        this.data.DisplayName.Column.PutValue(this.formGroup.get('DisplayName').value);
        await this.data.GetEntity().Commit(true);
        this.formGroup.markAsPristine();
        this.sidesheetRef.close(true);
        this.snackbar.open({ key: confirmMessage });
      } finally {
        isBusy?.endBusy();
      }
    }
  }

  /**
   * Deletes the security key
   */
  public async deleteSecurityKey() {
    await this.securityKeysService.delete(this.data.EntityKeysData.Keys[0]);
    this.sidesheetRef.close('delete');
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

}
