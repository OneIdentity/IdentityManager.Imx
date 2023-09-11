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
import { EuiLoadingService } from '@elemental-ui/core';

import { PortalServiceitems } from 'imx-api-qer';
import { CollectionLoadParameters, ExtendedTypedEntityCollection, EntitySchema } from 'imx-qbm-dbts';
import { DynamicMethodService, GenericTypedEntity } from 'qbm';
import { QerApiService } from '../qer-api-client.service';

@Injectable({
  providedIn: 'root'
})
export class ServiceItemsEditService {

  private busyIndicator: OverlayRef;

  constructor(
    private readonly qerClient: QerApiService,
    private readonly dynamicMethodService: DynamicMethodService,
    private readonly busyService: EuiLoadingService
  ) { }

  public get serviceitemsSchema(): EntitySchema {
    return this.qerClient.typedClient.PortalServiceitems.GetSchema();
  }

  public async get(parameters: CollectionLoadParameters): Promise<ExtendedTypedEntityCollection<PortalServiceitems, unknown>> {
    return this.qerClient.typedClient.PortalServiceitems.Get(parameters);
  }

  public async getServiceItem(serviceItemUid: string): Promise<PortalServiceitems> {
    const serviceItemCollection = await this.qerClient.typedClient.PortalServiceitemsInteractive.Get_byid(serviceItemUid);

    if (serviceItemCollection == null || serviceItemCollection.Data == null || serviceItemCollection.Data.length === 0) {
      throw new Error('getServiceItem - service item not found');
    }

    return serviceItemCollection.Data[0];
  }

  public async hasAccproductparamcategoryCandidates(): Promise<boolean> {
    return (await this.qerClient.typedClient.PortalCandidatesAccproductparamcategory.Get({ PageSize: -1 })).totalCount > 0;
  }

  public async hasFunctionalAreaCandidates(): Promise<boolean> {

    return (await this.dynamicMethodService.get(
      this.qerClient.apiClient,
      {
        type: GenericTypedEntity,
        path: '/portal/candidates/FunctionalArea',
        schemaPath: 'portal/candidates/FunctionalArea'
      },
      { PageSize: -1 })).totalCount > 0;
  }

  public async hasTermsOfUseCancdidates(): Promise<boolean> {
    return (await this.qerClient.typedClient.PortalTermsofuse.Get({ PageSize: -1 })).totalCount > 0;
  }

  public handleOpenLoader(): void {
    if (!this.busyIndicator) {
      setTimeout(() => this.busyIndicator = this.busyService.show());
    }
  }

  public handleCloseLoader(): void {
    if (this.busyIndicator) {
      setTimeout(() => {
        this.busyService.hide(this.busyIndicator);
        this.busyIndicator = undefined;
      });
    }
  }
}
