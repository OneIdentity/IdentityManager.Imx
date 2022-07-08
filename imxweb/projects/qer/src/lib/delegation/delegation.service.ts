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
 * Copyright 2021 One Identity LLC.
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

import { CollectionLoadParameters, EntitySchema, ExtendedTypedEntityCollection } from 'imx-qbm-dbts';
import { GlobalDelegationInput, PortalDelegable, PortalDelegations, PortalDelegationsGlobalRoleclasses } from 'imx-api-qer';

import { QerApiService } from '../qer-api-client.service';

@Injectable({
  providedIn: 'root'
})
export class DelegationService {

  constructor(private readonly qerApiService: QerApiService) { }

  public getDelegationSchema(): EntitySchema {
    return this.qerApiService.typedClient.PortalDelegations.GetSchema();
  }

  public async createDelegation(): Promise<PortalDelegations> {
    return this.qerApiService.typedClient.PortalDelegations.createEntity();
  }

  public async getDelegatableItems(uidUser: string, uidRecipient: string, parameter: CollectionLoadParameters)
    : Promise<ExtendedTypedEntityCollection<PortalDelegable, unknown>> {
    return this.qerApiService.typedClient.PortalDelegable.Get(uidUser, uidRecipient, parameter);
  }

  public commitGlobalDelegation(delegation: GlobalDelegationInput): Promise<void> {
    return this.qerApiService.client.portal_delegations_global_post(delegation);
  }

  public async getRoleClasses(uidUser: string): Promise<PortalDelegationsGlobalRoleclasses[]> {
    return (await this.qerApiService.typedClient.PortalDelegationsGlobalRoleclasses.Get(uidUser, { PageSize: 1024 })).Data;
  }

  public async commitDelegations(reference: PortalDelegations, objectKeys: string[]): Promise<void> {
    reference.ObjectKeyDelegated.value = objectKeys[0];

    if (objectKeys.length > 1) {
      objectKeys.shift();
      for (const objectKey of objectKeys) {
        const element = await this.createDelegation();
        for (const key in this.qerApiService.typedClient.PortalDelegations.GetSchema().Columns) {
          if (!key.startsWith('__') && reference[key].GetMetadata().CanEdit()) {
            await element[key].Column.PutValueStruct({
              DataValue: reference[key].value,
              DisplayValue: reference[key].Column.GetDisplayValue()
            });
          }
        }
        element.ObjectKeyDelegated.value = objectKey;
        await element.GetEntity().Commit(true);
      }
    }
    await reference.GetEntity().Commit(true);
  }
}
