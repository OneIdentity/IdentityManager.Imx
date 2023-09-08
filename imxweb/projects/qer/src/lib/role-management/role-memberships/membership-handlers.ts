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

import {
  CollectionLoadParameters,
  DataModel,
  EntityCollectionData,
  EntitySchema,
  ExtendedTypedEntityCollection,
  IEntity,
  TypedEntity,
  XOrigin
} from 'imx-qbm-dbts';
import { DynamicMethod, ImxTranslationProviderService, imx_SessionService } from 'qbm';

import { QerApiService } from '../../qer-api-client.service';

export interface IRoleMembershipType {

  readonly supportsDynamicMemberships: boolean;

  get(id: string, navigationState?: CollectionLoadParameters): Promise<ExtendedTypedEntityCollection<TypedEntity, unknown>>;

  getCandidates(
    id: string,
    navigationState?: CollectionLoadParameters
  ): Promise<ExtendedTypedEntityCollection<TypedEntity, unknown>>;

  getCandidatesDataModel(id: string): Promise<DataModel>;

  delete(role: string, identity: string): Promise<EntityCollectionData>;

  getSchema(key: string): EntitySchema;

  GetUidRole(entity: IEntity): string;

  GetUidPerson(entity: IEntity): string;

  /** Returns a flag indicating whether primary memberships
   * are possible for this role type.
   */
  hasPrimaryMemberships(): boolean;

  getPrimaryMembers(uid: string, navigationstate: CollectionLoadParameters): Promise<ExtendedTypedEntityCollection<TypedEntity, any>>;

  getPrimaryMembersSchema(): EntitySchema;
}

type CandidateParameters = CollectionLoadParameters & { xorigin?: XOrigin };

export abstract class BaseMembership implements IRoleMembershipType {

  public supportsDynamicMemberships = true;
  protected readonly schemaPaths: Map<string, string> = new Map();
  protected basePath = '';

  constructor(
    protected readonly session: imx_SessionService
  ) { }

  public abstract get(id: string, navigationState?: CollectionLoadParameters): Promise<ExtendedTypedEntityCollection<TypedEntity, unknown>>;

  public abstract getCandidates(
    id: string,
    navigationState?: CandidateParameters
  ): Promise<ExtendedTypedEntityCollection<TypedEntity, unknown>>;

  public abstract getCandidatesDataModel(id: string): Promise<DataModel>;

  public abstract delete(role: string, identity: string): Promise<EntityCollectionData>;

  public getSchema(key: string): EntitySchema {
    return this.session.Client.getSchema(this.schemaPaths.get(key));
  }

  public GetUidPerson(entity: IEntity): string {
    return entity.GetColumn('UID_Person').GetValue();
  }

  public abstract GetUidRole(entity: IEntity): string;

  /** Returns a flag indicating whether primary memberships
   * are possible for this role type.
   */
  public abstract hasPrimaryMemberships(): boolean;

  public abstract getPrimaryMembers(
    uid: string,
    navigationstate: CollectionLoadParameters
  ): Promise<ExtendedTypedEntityCollection<TypedEntity, any>>;

  public abstract getPrimaryMembersSchema(): EntitySchema;

}

// tslint:disable-next-line: max-classes-per-file
export class LocalityMembership extends BaseMembership {
  constructor(
    private readonly api: QerApiService,
    session: imx_SessionService,
    private readonly translator: ImxTranslationProviderService
  ) {
    super(session);
    this.basePath = 'portal/roles/config/membership/Locality';
    this.schemaPaths.set('get', `${this.basePath}/{UID_Locality}`);
    this.schemaPaths.set('candidates', `${this.basePath}/{UID_Locality}/UID_Person/candidates`);
  }

  public async get(id: string, navigationState?: CollectionLoadParameters): Promise<ExtendedTypedEntityCollection<TypedEntity, unknown>> {
    const api = new DynamicMethod(
      this.schemaPaths.get('get'),
      `/portal/roles/config/membership/Locality/${id}`,
      this.api.apiClient,
      this.session,
      this.translator
    );

    return api.Get(navigationState);
  }

  public async getCandidates(
    id: string,
    navigationState?: CandidateParameters
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
    return this.api.client.portal_roles_config_membership_Locality_delete(role, identity);
  }

  public hasPrimaryMemberships(): boolean {
    return true;
  }


  public GetUidRole(entity: IEntity): string {
    return entity.GetColumn("UID_Locality").GetValue();
  }

  public getPrimaryMembers(
    uid: string,
    navigationstate: CollectionLoadParameters
  ): Promise<ExtendedTypedEntityCollection<TypedEntity, any>> {
    return this.api.typedClient.PortalRolesConfigLocalityPrimarymembers.Get(uid, navigationstate);
  }

  public getPrimaryMembersSchema(): EntitySchema {
    return this.api.typedClient.PortalRolesConfigLocalityPrimarymembers.GetSchema();
  }

}

// tslint:disable-next-line: max-classes-per-file
export class ProfitCenterMembership extends BaseMembership {
  constructor(
    private readonly api: QerApiService,
    session: imx_SessionService,
    private readonly translator: ImxTranslationProviderService
  ) {
    super(session);
    this.basePath = 'portal/roles/config/membership/ProfitCenter';
    this.schemaPaths.set('get', `${this.basePath}/{UID_ProfitCenter}`);
    this.schemaPaths.set('candidates', `${this.basePath}/{UID_ProfitCenter}/UID_Person/candidates`);
  }

  public async get(id: string, navigationState?: CollectionLoadParameters): Promise<ExtendedTypedEntityCollection<TypedEntity, unknown>> {
    const api = new DynamicMethod(
      this.schemaPaths.get('get'),
      `/${this.basePath}/${id}`,
      this.api.apiClient,
      this.session,
      this.translator
    );

    return api.Get(navigationState);
  }

  public async getCandidates(
    id: string,
    navigationState?: CandidateParameters
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
    return this.api.client.portal_roles_config_membership_ProfitCenter_delete(role, identity);
  }

  public hasPrimaryMemberships(): boolean {
    return true;
  }

  public GetUidRole(entity: IEntity): string {
    return entity.GetColumn("UID_ProfitCenter").GetValue();
  }

  public getPrimaryMembers(uid: string, navigationstate: CollectionLoadParameters): Promise<ExtendedTypedEntityCollection<any, any>> {
    return this.api.typedClient.PortalRolesConfigProfitcenterPrimarymembers.Get(uid, navigationstate);
  }

  public getPrimaryMembersSchema(): EntitySchema {
    return this.api.typedClient.PortalRolesConfigProfitcenterPrimarymembers.GetSchema();
  }
}

// tslint:disable-next-line: max-classes-per-file
export class DepartmentMembership extends BaseMembership {
  constructor(
    private readonly api: QerApiService,
    session: imx_SessionService,
    private readonly translator: ImxTranslationProviderService
  ) {
    super(session);
    this.basePath = 'portal/roles/config/membership/Department';
    this.schemaPaths.set('get', `${this.basePath}/{UID_Department}`);
    this.schemaPaths.set('candidates', `${this.basePath}/{UID_Department}/UID_Person/candidates`);
  }
  public async get(id: string, navigationState?: CollectionLoadParameters): Promise<ExtendedTypedEntityCollection<TypedEntity, unknown>> {
    const api = new DynamicMethod(
      this.schemaPaths.get('get'),
      `/${this.basePath}/${id}`,
      this.api.apiClient,
      this.session,
      this.translator
    );

    return api.Get(navigationState);
  }

  public async getCandidates(
    id: string,
    navigationState?: CandidateParameters
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
    return this.api.client.portal_roles_config_membership_Department_delete(role, identity);
  }

  public GetUidRole(entity: IEntity): string {
    return entity.GetColumn("UID_Department").GetValue();
  }

  public hasPrimaryMemberships(): boolean {
    return true;
  }

  public getPrimaryMembers(uid: string, navigationstate: CollectionLoadParameters): Promise<ExtendedTypedEntityCollection<any, any>> {
    return this.api.typedClient.PortalRolesConfigDepartmentPrimarymembers.Get(uid, navigationstate);
  }

  public getPrimaryMembersSchema(): EntitySchema {
    return this.api.typedClient.PortalRolesConfigDepartmentPrimarymembers.GetSchema();
  }

}

// tslint:disable-next-line: max-classes-per-file
export class AERoleMembership extends BaseMembership {
  constructor(
    private readonly api: QerApiService,
    session: imx_SessionService,
    private readonly translator: ImxTranslationProviderService
  ) {
    super(session);
    this.basePath = 'portal/roles/config/membership/AERole';
    this.schemaPaths.set('get', `${this.basePath}/{UID_AERole}`);
    this.schemaPaths.set('candidates', `${this.basePath}/{UID_AERole}/UID_Person/candidates`);
  }
  public async get(id: string, navigationState?: CollectionLoadParameters): Promise<ExtendedTypedEntityCollection<TypedEntity, unknown>> {
    const api = new DynamicMethod(
      this.schemaPaths.get('get'),
      `/${this.basePath}/${id}`,
      this.api.apiClient,
      this.session,
      this.translator
    );

    return api.Get(navigationState);
  }

  public async delete(role: string, identity: string): Promise<EntityCollectionData> {
    return this.api.client.portal_roles_config_membership_AERole_delete(role, identity);
  }

  public async getCandidates(
    id: string,
    navigationState?: CandidateParameters
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

  public hasPrimaryMemberships(): boolean {
    return false;
  }

  public GetUidRole(entity: IEntity): string {
    return entity.GetColumn("UID_AERole").GetValue();
  }

  public getPrimaryMembers(): Promise<ExtendedTypedEntityCollection<any, any>> {
    throw new Error('Application roles do not allow primary memberships.');
  }

  public getPrimaryMembersSchema(): EntitySchema {
    throw new Error('Application roles do not allow primary memberships.');
  }

}
