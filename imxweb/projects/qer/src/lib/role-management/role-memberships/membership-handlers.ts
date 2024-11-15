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

// eslint-disable-next-line max-classes-per-file
import {
  CollectionLoadParameters,
  DataModel,
  EntityCollectionData,
  EntitySchema,
  ExtendedTypedEntityCollection,
  FkCandidateRouteDto,
  IEntity,
  TypedEntity,
} from '@imx-modules/imx-qbm-dbts';
import { DynamicMethod, ImxTranslationProviderService, imx_SessionService } from 'qbm';

import { QerApiService } from '../../qer-api-client.service';

export interface IRoleMembershipType {
  readonly supportsDynamicMemberships: boolean;

  get(id: string, navigationState?: CollectionLoadParameters): Promise<ExtendedTypedEntityCollection<TypedEntity, unknown>>;

  getCandidates(id: string, navigationState?: CollectionLoadParameters): Promise<ExtendedTypedEntityCollection<TypedEntity, unknown>>;

  getCandidatesDataModel(id: string): Promise<DataModel>;

  delete(role: string, identity: string): Promise<EntityCollectionData>;

  GetSchema(): EntitySchema;

  GetUidRole(entity: IEntity): string;

  GetUidPerson(entity: IEntity): string;

  /** Returns a flag indicating whether primary memberships
   * are possible for this role type.
   */
  hasPrimaryMemberships(): boolean;

  getPrimaryMembers(uid: string, navigationstate: CollectionLoadParameters): Promise<ExtendedTypedEntityCollection<TypedEntity, any>>;

  getPrimaryMembersSchema(): EntitySchema;
}

export abstract class BaseMembership implements IRoleMembershipType {
  public supportsDynamicMemberships = true;
  declare fkCandidateRoute: FkCandidateRouteDto | undefined;
  declare basePath: string;
  declare columnName: string;
  declare dynamicRoleUrl: string;

  constructor(
    private readonly _api: any,
    private _session: imx_SessionService,
    private readonly _translator: ImxTranslationProviderService,
  ) {}

  public setRoleName(role: string, columnName: string): void {
    this.basePath = `portal/roles/config/membership/${role}`; //hard coded as almost all of the candidate roles exist only as fk urls
    this.columnName = columnName;
    this.dynamicRoleUrl = `${this.basePath}/{${columnName}}`;
    this.getFkRoute();
  }

  private getFkRoute(): void {
    this.fkCandidateRoute = this.GetSchema().FkCandidateRoutes?.find((route) => route.ColumnName === 'UID_Person');
  }

  public GetSchema(url?: string): EntitySchema {
    return this._api.client.getSchema(url ? url : this.dynamicRoleUrl);
  }

  public async get(id: string, navigationState?: CollectionLoadParameters): Promise<ExtendedTypedEntityCollection<TypedEntity, unknown>> {
    const api = new DynamicMethod(this.dynamicRoleUrl, `/${this.basePath}/${id}`, this._api.apiClient, this._session, this._translator);
    return api.Get(navigationState);
  }

  public async getCandidates(
    id: string,
    navigationState?: CollectionLoadParameters,
  ): Promise<ExtendedTypedEntityCollection<TypedEntity, unknown>> {
    const schemaPath =
      (this.fkCandidateRoute?.Url?.at(0) === '/' ? this.fkCandidateRoute.Url.substring(1) : this.fkCandidateRoute?.Url) || '';
    const api = new DynamicMethod(schemaPath, this.fkCandidateRoute?.Url || '', this._api.apiClient, this._session, this._translator);
    return api.Get(navigationState);
  }

  public async getCandidatesDataModel(): Promise<DataModel> {
    const schemaPath =
      (this.fkCandidateRoute?.Url?.at(0) === '/' ? this.fkCandidateRoute.Url.substring(1) : this.fkCandidateRoute?.Url) || '';
    const api = new DynamicMethod(schemaPath, this.fkCandidateRoute?.Url || '', this._api.apiClient, this._session, this._translator);
    return api.getDataModei();
  }

  public abstract delete(role: string, identity: string): Promise<EntityCollectionData>;

  public GetUidPerson(entity: IEntity): string {
    return entity.GetColumn('UID_Person').GetValue();
  }

  public GetUidRole(entity: IEntity): string {
    return entity.GetColumn(this.columnName).GetValue();
  }

  /** Returns a flag indicating whether primary memberships
   * are possible for this role type.
   */
  public abstract hasPrimaryMemberships(): boolean;

  public abstract getPrimaryMembers(
    uid: string,
    navigationstate: CollectionLoadParameters,
  ): Promise<ExtendedTypedEntityCollection<TypedEntity, any>>;

  public abstract getPrimaryMembersSchema(): EntitySchema;
}

// eslint-disable-next-line max-classes-per-file
export class LocalityMembership extends BaseMembership {
  constructor(
    private api: QerApiService,
    private session: imx_SessionService,
    private translator: ImxTranslationProviderService,
  ) {
    super(api, session, translator);
    this.setRoleName('Locality', 'UID_Locality');
  }

  public async delete(role: string, identity: string): Promise<EntityCollectionData> {
    return this.api.client.portal_roles_config_membership_Locality_delete(role, identity);
  }

  public hasPrimaryMemberships(): boolean {
    return true;
  }

  public getPrimaryMembers(
    uid: string,
    navigationstate: CollectionLoadParameters,
  ): Promise<ExtendedTypedEntityCollection<TypedEntity, any>> {
    return this.api.typedClient.PortalRolesConfigLocalityPrimarymembers.Get(uid, navigationstate);
  }

  public getPrimaryMembersSchema(): EntitySchema {
    return this.api.typedClient.PortalRolesConfigLocalityPrimarymembers.GetSchema();
  }
}

// eslint-disable-next-line max-classes-per-file
export class ProfitCenterMembership extends BaseMembership {
  constructor(
    private api: QerApiService,
    private session: imx_SessionService,
    private translator: ImxTranslationProviderService,
  ) {
    super(api, session, translator);
    this.setRoleName('ProfitCenter', 'UID_ProfitCenter');
  }

  public async delete(role: string, identity: string): Promise<EntityCollectionData> {
    return this.api.client.portal_roles_config_membership_ProfitCenter_delete(role, identity);
  }

  public hasPrimaryMemberships(): boolean {
    return true;
  }

  public getPrimaryMembers(uid: string, navigationstate: CollectionLoadParameters): Promise<ExtendedTypedEntityCollection<any, any>> {
    return this.api.typedClient.PortalRolesConfigProfitcenterPrimarymembers.Get(uid, navigationstate);
  }

  public getPrimaryMembersSchema(): EntitySchema {
    return this.api.typedClient.PortalRolesConfigProfitcenterPrimarymembers.GetSchema();
  }
}

// eslint-disable-next-line max-classes-per-file
export class DepartmentMembership extends BaseMembership {
  constructor(
    private api: QerApiService,
    private session: imx_SessionService,
    private translator: ImxTranslationProviderService,
  ) {
    super(api, session, translator);
    this.setRoleName('Department', 'UID_Department');
  }

  public async delete(role: string, identity: string): Promise<EntityCollectionData> {
    return this.api.client.portal_roles_config_membership_Department_delete(role, identity);
  }

  public GetUidRole(entity: IEntity): string {
    return entity.GetColumn('UID_Department').GetValue();
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

// eslint-disable-next-line max-classes-per-file
export class AERoleMembership extends BaseMembership {
  constructor(
    private api: QerApiService,
    private session: imx_SessionService,
    private translator: ImxTranslationProviderService,
  ) {
    super(api, session, translator);
    this.setRoleName('AERole', 'UID_AERole');
  }

  public async delete(role: string, identity: string): Promise<EntityCollectionData> {
    return this.api.client.portal_roles_config_membership_AERole_delete(role, identity);
  }

  public hasPrimaryMemberships(): boolean {
    return false;
  }

  public getPrimaryMembers(): Promise<ExtendedTypedEntityCollection<any, any>> {
    throw new Error('Application roles do not allow primary memberships.');
  }

  public getPrimaryMembersSchema(): EntitySchema {
    throw new Error('Application roles do not allow primary memberships.');
  }
}
