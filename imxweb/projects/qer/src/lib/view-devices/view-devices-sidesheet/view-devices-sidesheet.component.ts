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

import { Component, Inject, OnDestroy } from "@angular/core";
import { UntypedFormGroup } from "@angular/forms";
import { EUI_SIDESHEET_DATA, EuiLoadingService, EuiSidesheetRef } from "@elemental-ui/core";
import { PortalDevices } from "imx-api-qer";
import { IEntity } from "imx-qbm-dbts";
import { BaseCdr, ColumnDependentReference, ConfirmationService, SnackBarService } from "qbm";
import { ViewDevicesService } from "../view-devices.service";
import { Subscription } from "rxjs";
import { OverlayRef } from "@angular/cdk/overlay";

@Component({
  selector: 'imx-view-devices-sidesheet',
  templateUrl: './view-devices-sidesheet.component.html',
  styleUrls: ['./view-devices-sidesheet.component.scss']
})
export class ViewDevicesSidesheetComponent implements OnDestroy {
  public readonly formGroup = new UntypedFormGroup({});
  public cdrList: ColumnDependentReference[] = [];
  public canEdit: boolean = false;

  private subscriptions: Subscription[] = [];

  constructor(
    @Inject(EUI_SIDESHEET_DATA) public data: { device: PortalDevices; deviceEntityConfig: string[] },
    private viewDevicesService: ViewDevicesService,
    private readonly sidesheetRef: EuiSidesheetRef,
    private readonly snackbar: SnackBarService,
    private readonly confirmation: ConfirmationService,
    private readonly euiBusyService: EuiLoadingService,
  ) {
    const entity = data.device.GetEntity();
    this.cdrList = this.createCdrList(entity);

    this.canEdit = data.device.UID_HardwareType.GetMetadata().CanEdit();

    this.subscriptions.push(this.sidesheetRef.closeClicked().subscribe(async () => {
      if (this.formGroup.pristine || await this.confirmation.confirmLeaveWithUnsavedChanges()) {
        this.sidesheetRef.close();
      }
    }));
  }

  private createCdrList(entity: IEntity): BaseCdr[] {
    const cdrList = [];
    const columnNames: string[] = this.data.deviceEntityConfig;
    columnNames?.forEach((name) => {
      try {
        cdrList.push(new BaseCdr(entity.GetColumn(name)));
      } catch {}
    });
    return cdrList;
  }

  public async saveChanges(): Promise<void> {
    if (this.formGroup.valid) {
      this.viewDevicesService.handleOpenLoader();
      let confirmMessage = '#LDS#The device has been successfully saved.';
      try {
        await this.data.device.GetEntity().Commit(false);
        this.formGroup.markAsPristine();
        this.sidesheetRef.close(true);
        this.snackbar.open({ key: confirmMessage });
      } finally {
        this.viewDevicesService.handleCloseLoader();
      }
    }
  }

  public async deleteDevice(): Promise<void> {
    if (
      await this.confirmation.confirm({
        Title: '#LDS#Heading Delete Device',
        Message: '#LDS#Are you sure you want to delete the device?',
      })
    ) {
      let overlayRef: OverlayRef;
      setTimeout(() => (overlayRef = this.euiBusyService.show()));
      let confirmMessage = '#LDS#The device has been successfully deleted.';
      try {
        const uid = this.data.device.EntityKeysData.Keys[0];
        await this.viewDevicesService.deleteDevice(uid);
        this.sidesheetRef.close(true);
        this.snackbar.open({ key: confirmMessage });
      } finally {
        setTimeout(() => this.euiBusyService.hide(overlayRef));
      }
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
