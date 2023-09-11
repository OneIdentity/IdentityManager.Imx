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
import { UntypedFormGroup } from '@angular/forms';
import { EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { Subscription } from 'rxjs';

import { ConfirmationService, SnackBarService } from 'qbm';
import { TypedEntity } from 'imx-qbm-dbts';
import { EntitlementWrapper } from '../entitlement-wrapper.interface';

@Component({
  selector: 'imx-entitlement-detail',
  templateUrl: './entitlement-detail.component.html',
  styleUrls: ['./entitlement-detail.component.scss']
})
export class EntitlementDetailComponent implements OnDestroy {
  public readonly form = new UntypedFormGroup({});

  private readonly subscriptions: Subscription[] = [];

  constructor(
    @Inject(EUI_SIDESHEET_DATA) public readonly data: EntitlementWrapper,
    private readonly sidesheetRef: EuiSidesheetRef,
    private readonly snackbar: SnackBarService,
    confirmation: ConfirmationService
  ) {
    this.subscriptions.push(this.sidesheetRef.closeClicked().subscribe(async () => {
      const entitlementHasChanges = this.entityHasChanges(this.data.entitlement);
      const serviceItemHasChanges = this.entityHasChanges(this.data.serviceItem);
      const hasChanges = entitlementHasChanges || serviceItemHasChanges || !this.form.pristine;

      if (hasChanges && !(await confirmation.confirmLeaveWithUnsavedChanges())) {
        return;
      }

      if (entitlementHasChanges) {
        await this.data.entitlement.GetEntity().DiscardChanges();
      }

      if (serviceItemHasChanges) {
        await this.data.serviceItem.GetEntity().DiscardChanges();
      }

      if (hasChanges) {
        this.snackbar.open({ key: '#LDS#The changes were discarded.' });
      }

      this.sidesheetRef.close(false);
    }));
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  public afterSave(success: boolean): void {
    if (success) {
      this.snackbar.open({ key: '#LDS#The application entitlement has been successfully saved.' });
    }

    this.sidesheetRef.close(true);
  }

  private entityHasChanges(entity: TypedEntity): boolean {
    return entity != null && entity.GetEntity().GetDiffData()?.Data?.length > 0;
  }
}
