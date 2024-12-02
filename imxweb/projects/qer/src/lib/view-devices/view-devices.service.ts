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

import { Injectable } from '@angular/core';
import { EuiLoadingService } from '@elemental-ui/core';
import { PortalCandidatesHardwaretype, PortalDevices } from '@imx-modules/imx-api-qer';
import { CollectionLoadParameters, DataModel, EntitySchema, ExtendedTypedEntityCollection } from '@imx-modules/imx-qbm-dbts';
import { QerApiService } from '../qer-api-client.service';

@Injectable({
  providedIn: 'root',
})
export class ViewDevicesService {
  constructor(
    private readonly qerClient: QerApiService,
    private readonly busyService: EuiLoadingService,
  ) {}

  public get devicesSchema(): EntitySchema {
    return this.qerClient.typedClient.PortalDevices.GetSchema();
  }

  public handleOpenLoader(): void {
    if (this.busyService.overlayRefs.length === 0) {
      this.busyService.show();
    }
  }

  public handleCloseLoader(): void {
    this.busyService.hide();
  }

  public async get(
    parameters: CollectionLoadParameters,
    signal: AbortSignal,
  ): Promise<ExtendedTypedEntityCollection<PortalDevices, unknown>> {
    return this.qerClient.typedClient.PortalDevices.Get(parameters);
  }

  public get hardwareTypeSchema(): EntitySchema {
    return this.qerClient.typedClient.PortalCandidatesHardwaretype.GetSchema();
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

  public async getPortalCandidatesHardwaretype(
    parameters: CollectionLoadParameters,
  ): Promise<ExtendedTypedEntityCollection<PortalCandidatesHardwaretype, unknown>> {
    return await this.qerClient.typedClient.PortalCandidatesHardwaretype.Get(parameters);
  }

  public async getHardwareTypeDataModel(): Promise<DataModel> {
    return this.qerClient.client.portal_candidates_HardwareType_datamodel_get();
  }
}
