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

import { CollectionLoadParameters, ExtendedTypedEntityCollection, TypedEntity, EntityCollectionData, EntitySchema, IEntity } from "imx-qbm-dbts";
import { IRoleMembershipType } from "qer";
import { DynamicMethod, ImxTranslationProviderService, imx_SessionService } from "qbm";
import { RmbApiService } from "./rmb-api-client.service";

// do not inherit from BaseMembership because classes cannot inherit across modules :-(

export class OrgMembership implements IRoleMembershipType {
  constructor(
    private readonly api: RmbApiService,
    private readonly session: imx_SessionService,
    private readonly translator: ImxTranslationProviderService
  ) {
    this.schemaPaths.set('get', `portal/roles/config/membership/Org/{UID_Org}`);
    this.schemaPaths.set('candidates', `portal/roles/config/membership/Org/{UID_Org}/UID_Person/candidates`);
  }

  private readonly schemaPaths: Map<string, string> = new Map();

  public async get(id: string, navigationState?: CollectionLoadParameters): Promise<ExtendedTypedEntityCollection<TypedEntity, unknown>> {
    const api = new DynamicMethod(
      this.schemaPaths.get('get'),
      `/portal/roles/config/membership/Org/${id}`,
      this.api.apiClient,
      this.session,
      this.translator
    );

    return await api.Get(navigationState);
  }

  public getSchema(key: string): EntitySchema {
    return this.session.Client.getSchema(this.schemaPaths.get(key));
  }

  public GetUidPerson(entity: IEntity) {
    return entity.GetColumn("UID_Person").GetValue();
  }

  public async getCandidates(
    id: string,
    navigationState?: CollectionLoadParameters
  ): Promise<ExtendedTypedEntityCollection<TypedEntity, unknown>> {
    const api = new DynamicMethod(
      this.schemaPaths.get('candidates'),
      `/portal/roles/config/membership/Org/${id}/UID_Person/candidates`,
      this.api.apiClient,
      this.session,
      this.translator
    );

    return await api.Get(navigationState);
  }

  public async delete(role: string, identity: string): Promise<EntityCollectionData> {
    return await this.api.client.portal_roles_config_membership_Org_delete(role, identity);
  }

  public hasPrimaryMemberships(): boolean {
    return true;
  }

  public getPrimaryMembers(uid: string, navigationstate: CollectionLoadParameters): Promise<ExtendedTypedEntityCollection<TypedEntity, any>> {
    return this.api.typedClient.PortalRolesConfigOrgPrimarymembers.Get(uid, navigationstate);
  }

  public getPrimaryMembersSchema(): EntitySchema {
    return this.api.typedClient.PortalRolesConfigOrgPrimarymembers.GetSchema();
  }
}