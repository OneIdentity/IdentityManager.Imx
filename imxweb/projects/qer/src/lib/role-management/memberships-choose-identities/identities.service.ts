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
import { OwnershipInformation, PortalPersonAll } from 'imx-api-qer';
import {
  CollectionLoadParameters,
  DataModelFilter,
  EntitySchema,
  ExtendedTypedEntityCollection,
  TypedEntity,
  TypedEntityBuilder,
} from 'imx-qbm-dbts';
import { QerApiService } from '../../qer-api-client.service';
import { RoleService } from '../role.service';

@Injectable({
  providedIn: 'root',
})
export class IdentitiesService {
  constructor(
    private readonly api: QerApiService,
    private readonly roles: RoleService
  ) { }

  public getSchema(): EntitySchema {
    return this.api.typedClient.PortalPersonAll.GetSchema();
  }

  public async getIdentities(navigationState?: CollectionLoadParameters): Promise<ExtendedTypedEntityCollection<PortalPersonAll, unknown>> {
    return await this.api.typedClient.PortalPersonAll.Get(navigationState);
  }

  public async getIdentity(id: string): Promise<any> {
    return await this.api.typedClient.PortalPersonUid.Get(id);
  }

  public async getCandidates(
    id: string,
    navigationState?: CollectionLoadParameters
  ): Promise<ExtendedTypedEntityCollection<TypedEntity, unknown>> {
    const candidates = await this.api.client.portal_roles_config_membership_Locality_UID_Person_candidates_get(
      id,
      0,
      navigationState?.OrderBy,
      navigationState?.StartIndex,
      navigationState?.PageSize,
      navigationState?.filter,
      navigationState?.withProperties,
      navigationState?.search
    );

    const builder = new TypedEntityBuilder(PortalPersonAll);
    return builder.buildReadWriteEntities(candidates, PortalPersonAll.GetEntitySchema());
  }

  public async getFilterOptions(): Promise<DataModelFilter[]> {
    return (await this.api.client.portal_person_all_datamodel_get(null)).Filters;
  }

  public async addMemberships(ownershipInfo: OwnershipInformation, members: TypedEntity[], id: string): Promise<TypedEntity[]> {
    if (!this.roles.exists(ownershipInfo)) {
      return members;
    }

    const failedDueToInactivity = [];

    for (const member of members) {
      const entity = this.api.typedClient.PortalCartitem.createEntity();

      // NOTE: The order of setting values *is* important
      entity.RoleMembership.value = id;
      entity.UID_PersonOrdered.value = member.GetEntity().GetKeys()[0];

      try {
        await this.api.typedClient.PortalCartitem.Post(entity);
      }
      catch (exception) {
        if (exception?.dataItems.length && exception.dataItems[0].Number === 6053002) {
          failedDueToInactivity.push(member);
        } else {
          throw exception;
        }
      }
    }
    return failedDueToInactivity;
  }
}
