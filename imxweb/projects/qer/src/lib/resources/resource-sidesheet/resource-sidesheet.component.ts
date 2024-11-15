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

import { Component, Inject, OnDestroy } from '@angular/core';
import { FormGroup, UntypedFormGroup } from '@angular/forms';
import { EUI_SIDESHEET_DATA, EuiLoadingService, EuiSidesheetRef } from '@elemental-ui/core';
import { Subscription } from 'rxjs';

import { IEntity } from '@imx-modules/imx-qbm-dbts';
import { BaseCdr, ColumnDependentReference, ConfirmationService } from 'qbm';

@Component({
  selector: 'imx-resource-sidesheet',
  templateUrl: './resource-sidesheet.component.html',
  styleUrls: ['./resource-sidesheet.component.scss'],
})
export class ResourceSidesheetComponent implements OnDestroy {
  public cdrList: ColumnDependentReference[];
  public ownerCdr: BaseCdr | undefined;
  public resourceFormGroup = new UntypedFormGroup({});
  public formGroup: FormGroup<{ resource: UntypedFormGroup }>;
  private subscriptions: Subscription[] = [];

  constructor(
    @Inject(EUI_SIDESHEET_DATA)
    public readonly data: {
      entity: IEntity;
      isAdmin: boolean;
      tablename: string;
      accProduct: IEntity;
      editableFields: string[];
    },
    private readonly sidesheetRef: EuiSidesheetRef,
    private readonly busy: EuiLoadingService,
    confirmation: ConfirmationService,
  ) {
    this.formGroup = new UntypedFormGroup({ resource: this.resourceFormGroup });
    this.subscriptions.push(
      sidesheetRef.closeClicked().subscribe(async () => {
        if (this.formGroup.dirty && !(await confirmation.confirmLeaveWithUnsavedChanges())) {
          return;
        }

        sidesheetRef.close(false);
      }),
    );
    this.cdrList = this.data.editableFields.map((elem) => new BaseCdr(this.data.entity.GetColumn(elem)));
    this.ownerCdr = this.data.accProduct == null ? undefined : new BaseCdr(this.data.accProduct.GetColumn('UID_OrgRuler'));
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  public async submit(): Promise<void> {
    if (this.busy.overlayRefs.length === 0) {
      this.busy.show();
    }
    try {
      if (this.resourceFormGroup.dirty) {
        this.data.entity.Commit();
      }
      if (this.formGroup.get('UID_OrgRuler')?.dirty) {
        this.data.accProduct.Commit();
      }
    } finally {
      this.busy.hide();
    }
    this.sidesheetRef.close(true);
  }
}
