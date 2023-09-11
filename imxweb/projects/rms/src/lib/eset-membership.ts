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

import { CollectionLoadParameters, ExtendedTypedEntityCollection, TypedEntity, EntityCollectionData, EntitySchema, IEntity, DataModel } from 'imx-qbm-dbts';
import { IRoleMembershipType } from 'qer';
import { DynamicMethod, ImxTranslationProviderService, imx_SessionService } from 'qbm';
import { RmsApiService } from './rms-api-client.service';

export class EsetMembership implements IRoleMembershipType {

  public supportsDynamicMemberships = false;
  private readonly schemaPaths: Map<string, string> = new Map();

  private readonly basePath = 'portal/roles/config/membership/ESet';

  constructor(
    private readonly api: RmsApiService,
    private readonly session: imx_SessionService,
    private readonly translator: ImxTranslationProviderService
  ) {
    this.schemaPaths.set('get', `${this.basePath}/{UID_ESet}`);
    this.schemaPaths.set('candidates', `${this.basePath}/{UID_ESet}/UID_Person/candidates`);
  }

  public async get(id: string, navigationState?: CollectionLoadParameters): Promise<ExtendedTypedEntityCollection<TypedEntity, unknown>> {
    return this.api.typedClient.PortalRolesConfigMembershipEset.Get(id, navigationState);
  }

  public getSchema(key: string): EntitySchema {
    return this.session.Client.getSchema(this.schemaPaths.get(key));
  }

  public GetUidPerson(entity: IEntity) {
    return entity.GetColumn('UID_Person').GetValue();
  }

  public async getCandidates(
    id: string,
    navigationState?: CollectionLoadParameters
  ): Promise<ExtendedTypedEntityCollection<TypedEntity, unknown>> {
    const api = new DynamicMethod(
      this.schemaPaths.get('candidates'),
      `/${this.basePath}/${id}/UID_Person/candidates`,
      this.api.apiClient,
      this.session,
      this.translator
    );

    return api.Get(navigationState);
  }

  public async getCandidatesDataModel(id: string): Promise<DataModel> {
    const dynamicMethod = new DynamicMethod(
      this.schemaPaths.get('candidates'),
      `/${this.basePath}/${id}/UID_Person/candidates`,
      this.api.apiClient,
      this.session,
      this.translator
    );
    return dynamicMethod.getDataModei();
  }

  public async delete(role: string, identity: string): Promise<EntityCollectionData> {
    return this.api.client.portal_roles_config_membership_ESet_delete(role, identity);
  }

  public hasPrimaryMemberships(): boolean {
    return false;
  }

  public GetUidRole(entity: IEntity): string {
    return entity.GetColumn("UID_ESet").GetValue();
  }

  public getPrimaryMembers(
    uid: string,
    navigationstate: CollectionLoadParameters
  ): Promise<ExtendedTypedEntityCollection<TypedEntity, any>> {
    throw new Error('System roles do not allow primary memberships.');
  }

  public getPrimaryMembersSchema(): EntitySchema {
    throw new Error('System roles do not allow primary memberships.');
  }
}
