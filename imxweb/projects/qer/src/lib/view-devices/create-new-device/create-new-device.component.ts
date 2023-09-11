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

import { Component, Inject } from "@angular/core";
import { UntypedFormGroup } from "@angular/forms";
import { EUI_SIDESHEET_DATA, EuiSidesheetRef } from "@elemental-ui/core";
import { PortalDevices } from "imx-api-qer";
import { IEntity, ValueStruct } from "imx-qbm-dbts";
import { BaseCdr, ColumnDependentReference, SnackBarService } from "qbm";
import { ViewDevicesService } from "../view-devices.service";

@Component({
  selector: 'imx-create-new-device',
  templateUrl: './create-new-device.component.html',
  styleUrls: ['./create-new-device.component.scss']
})
export class CreateNewDeviceComponent {
  public readonly formGroup = new UntypedFormGroup({});
  public cdrList: ColumnDependentReference[] = [];

  constructor(
    @Inject(EUI_SIDESHEET_DATA) public data: { newDevice: PortalDevices, deviceEntityConfig: string[], deviceModelValueStruct: ValueStruct<string> },
    public viewDevicesService: ViewDevicesService,
    private readonly sidesheetRef: EuiSidesheetRef,
    private readonly snackbar: SnackBarService,
  ) {
    const entity = data.newDevice.GetEntity();
    this.cdrList = this.createCdrList(entity);
  }

  private createCdrList(entity: IEntity): BaseCdr[] {
    const cdrList = [];
    const columnNames: string[] = this.data.deviceEntityConfig;
    columnNames?.forEach(async (name) => {
      try {
        if (name === 'UID_HardwareType') {
          await entity.GetColumn(name).PutValueStruct(this.data.deviceModelValueStruct);
          cdrList.unshift(new BaseCdr(entity.GetColumn(name), null, true));
        } else {
          cdrList.push(new BaseCdr(entity.GetColumn(name)));
        }
      } catch {}
    });
    return cdrList;
  }

  public async createDevice(): Promise<void> {
    if (this.formGroup.valid) {
      this.viewDevicesService.handleOpenLoader();
      let confirmMessage = '#LDS#The device has been successfully created.';
      try {
        await this.data.newDevice.GetEntity().Commit(true);
        this.formGroup.markAsPristine();
        this.sidesheetRef.close(true);
        this.snackbar.open({ key: confirmMessage });
      } finally {
        this.viewDevicesService.handleCloseLoader();
      }
    }
  }
}
