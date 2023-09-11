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

import { OverlayRef } from '@angular/cdk/overlay';
import { Injectable } from '@angular/core';
import { QerApiService } from '../qer-api-client.service';
import { EuiLoadingService } from '@elemental-ui/core';
import { CollectionLoadParameters, DataModel, EntityCollectionData, EntitySchema, ExtendedTypedEntityCollection } from 'imx-qbm-dbts';
import { PortalCandidatesHardwaretype, PortalCandidatesHardwaretypeWrapper, PortalDevices } from 'imx-api-qer';

@Injectable({
  providedIn: 'root',
})
export class ViewDevicesService {
  private busyIndicator: OverlayRef;

  constructor(
    private readonly qerClient: QerApiService,
    private readonly busyService: EuiLoadingService
    ) {}

  public get devicesSchema(): EntitySchema {
    return this.qerClient.typedClient.PortalDevices.GetSchema();
  }

  public get hardwareTypeSchema(): EntitySchema {
    return this.qerClient.typedClient.PortalCandidatesHardwaretype.GetSchema();
  }

  public handleOpenLoader(): void {
    if (!this.busyIndicator) {
      setTimeout(() => (this.busyIndicator = this.busyService.show()));
    }
  }

  public handleCloseLoader(): void {
    if(this.busyIndicator) {
      setTimeout(() => {
        this.busyService.hide(this.busyIndicator);
        this.busyIndicator = undefined;
      });
    }
  }

  public async get(parameters: CollectionLoadParameters): Promise<ExtendedTypedEntityCollection<PortalDevices, unknown>> {
    return this.qerClient.typedClient.PortalDevices.Get(parameters);
  }

  public async getDataModel(): Promise<DataModel> {
    return this.qerClient.client.portal_devices_datamodel_get();
  }

  public async getPortalDeviceEntity(uidDeviceIndex: string): Promise<ExtendedTypedEntityCollection<PortalDevices, unknown>> {
    return await this.qerClient.typedClient.PortalDevicesInteractive.Get_byid(uidDeviceIndex);
  }

  public async createNewDevice(): Promise<PortalDevices> {
    return (await this.qerClient.typedClient.PortalDevicesInteractive.Get()).Data[0];
  }

  public async deleteDevice(uid: string): Promise<void> {
    await this.qerClient.client.portal_devices_delete(uid);
  }

  public async getPortalCandidatesHardwaretype(parameters: CollectionLoadParameters): Promise<ExtendedTypedEntityCollection<PortalCandidatesHardwaretype, unknown>> {
    return await this.qerClient.typedClient.PortalCandidatesHardwaretype.Get(parameters);
  }

  public async getHardwareTypeDataModel(): Promise<DataModel> {
    return this.qerClient.client.portal_candidates_HardwareType_datamodel_get();
  }
}
