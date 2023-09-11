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

import { Injectable } from '@angular/core';

import { PortalSubscription, PortalSubscriptionInteractive } from 'imx-api-rps';
import { CollectionLoadParameters, EntitySchema, ExtendedEntityCollectionData, ExtendedTypedEntityCollection } from 'imx-qbm-dbts';
import { RpsApiService } from '../rps-api-client.service';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionsService {

  constructor(private readonly api: RpsApiService) {
  }

  public get PortalSubscriptionSchema(): EntitySchema {
    return this.api.typedClient.PortalSubscription.GetSchema();
  }

  public async getSubscriptions(parameters?: CollectionLoadParameters):
    Promise<ExtendedTypedEntityCollection<PortalSubscription, any>> {

    return this.api.typedClient.PortalSubscription.Get(parameters);
  }

  public async deleteSubscription(uid: string): Promise<ExtendedEntityCollectionData<any>> {
    return this.api.client.portal_subscription_delete(uid);
  }

  public async getSubscriptionInteractive(uid: string): Promise<ExtendedTypedEntityCollection<PortalSubscriptionInteractive, {}>> {
    return this.api.typedClient.PortalSubscriptionInteractive.Get_byid(uid);
  }

  public async sendMail(uidPort: string, withCc: boolean): Promise<void> {
    if (withCc) {
      await this.api.client.portal_subscription_sendmailcc_post(uidPort);
    }
    return this.api.client.portal_subscription_sendmail_post(uidPort);
  }

  public async hasReports(): Promise<boolean> {
    return (await this.api.typedClient.PortalReports.Get({ PageSize: -1 })).totalCount > 0;
  }
}
