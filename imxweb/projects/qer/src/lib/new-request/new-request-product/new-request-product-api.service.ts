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

import { Injectable, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';

import { PortalShopServiceitems, ServiceItemsExtendedData } from 'imx-api-qer';
import { CollectionLoadParameters, EntitySchema, ExtendedTypedEntityCollection, IWriteValue } from 'imx-qbm-dbts';

import { QerApiService } from '../../qer-api-client.service';
import { NewRequestOrchestrationService } from '../new-request-orchestration.service';
import { ServiceItemParameters } from './service-item-parameters';

@Injectable({
  providedIn: 'root',
})
export class NewRequestProductApiService implements OnDestroy {
  private subscriptions: Subscription[] = [];

  // public recipients: IWriteValue<string>;
  public entitySchema: EntitySchema;

  constructor(private readonly qerApi: QerApiService, private readonly orchestration: NewRequestOrchestrationService) {
    this.entitySchema = this.qerApi.typedClient.PortalShopServiceitems.GetSchema();
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
  }

  public async get(
    parameters: CollectionLoadParameters | ServiceItemParameters = {}
  ): Promise<ExtendedTypedEntityCollection<PortalShopServiceitems, ServiceItemsExtendedData>> {
    return this.qerApi.typedClient.PortalShopServiceitems.Get(parameters, { signal: this.orchestration.abortController.signal });
  }
}
