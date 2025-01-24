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
import { PortalPersonAll } from 'imx-api-qer';
import {
  CollectionLoadParameters,
  DataModel,
  DataModelFilter,
  EntitySchema,
  ExtendedTypedEntityCollection,
  TypedEntity,
  TypedEntityBuilder,
} from 'imx-qbm-dbts';
import { QerApiService } from '../../qer-api-client.service';
import { RoleService } from '../role.service';
import { NotRequestableMembershipsEntity } from './not-requestable-memberships/not-requestable-memberships-entity';

@Injectable({
  providedIn: 'root',
})
export class IdentitiesService {
  constructor(private readonly api: QerApiService, private readonly roles: RoleService) {}

  public getSchema(): EntitySchema {
    return this.api.typedClient.PortalPersonAll.GetSchema();
  }

  public async getIdentities(navigationState?: CollectionLoadParameters): Promise<ExtendedTypedEntityCollection<PortalPersonAll, unknown>> {
    return this.api.typedClient.PortalPersonAll.Get(navigationState);
  }

  public async getIdentity(id: string): Promise<any> {
    return this.api.typedClient.PortalPersonUid.Get(id);
  }

  public async getCandidates(
    id: string,
    navigationState?: CollectionLoadParameters
  ): Promise<ExtendedTypedEntityCollection<TypedEntity, unknown>> {
    const candidates = await this.api.client.portal_roles_config_membership_Locality_UID_Person_candidates_get(id, {
      ...navigationState,
      xorigin: 0,
    });

    const builder = new TypedEntityBuilder(PortalPersonAll);
    return builder.buildReadWriteEntities(candidates, PortalPersonAll.GetEntitySchema());
  }

  public async getDataModel(): Promise<DataModel> {
    return this.api.client.portal_person_all_datamodel_get(null);
  }

  /** @deprecated Will be removed. Please load the data model first.*/
  public async getFilterOptions(): Promise<DataModelFilter[]> {
    return (await this.getDataModel()).Filters;
  }

  public async addMemberships(tableName: string, members: TypedEntity[], id: string): Promise<TypedEntity[]> {
    if (!this.roles.exists(tableName)) {
      return members;
    }

    const notRequestableMemberships: NotRequestableMembershipsEntity[] = [];

    for (const member of members) {
      const entity = this.api.typedClient.PortalCartitem.createEntity();

      // NOTE: The order of setting values *is* important
      entity.RoleMembership.value = id;
      entity.UID_PersonOrdered.value = member.GetEntity().GetKeys()[0];

      try {
        await this.api.typedClient.PortalCartitem.Post(entity);
      } catch (exception) {
        // 6053005 == The membership cannot be requested for this identity.
        if (exception?.dataItems.length && exception.dataItems[0].Number === 6053005) {
          notRequestableMemberships.push(new NotRequestableMembershipsEntity(member.GetEntity(), exception.dataItems[0]));
        } else {
          throw exception;
        }
      }
    }
    return notRequestableMemberships;
  }
}
