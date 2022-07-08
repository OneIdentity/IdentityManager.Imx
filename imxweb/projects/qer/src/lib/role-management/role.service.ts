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
import {
  PortalAdminRoleDepartment,
  PortalAdminRoleLocality,
  PortalAdminRoleProfitcenter,
  PortalRespAerole,
  PortalRespDepartment,
  PortalRespLocality,
  PortalRespProfitcenter,
  ProjectConfig,
  QerProjectConfig,
  RoleAssignmentData,
  RoleExtendedDataWrite,
} from 'imx-api-qer';
import {
  CollectionLoadParameters,
  DataModel,
  EntityCollectionData,
  EntitySchema,
  ExtendedTypedEntityCollection,
  FkCandidateRouteDto,
  IEntity,
  TypedEntity,
  TypedEntityBuilder,
  TypedEntityCollectionData,
  WriteExtTypedEntity,
  XOrigin,
} from 'imx-qbm-dbts';
import { AERoleMembership, DepartmentMembership, LocalityMembership, ProfitCenterMembership } from './role-memberships/membership-handlers';
import { Subject } from 'rxjs';
import { ProjectConfigurationService } from '../project-configuration/project-configuration.service';
import { QerApiService } from '../qer-api-client.service';
import { RoleObjectInfo } from './role-object-info';
import { DynamicMethodService, ImxTranslationProviderService, imx_SessionService } from 'qbm';
import { BaseTreeEntitlement } from './role-entitlements/entitlement-handlers';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  public dataDirtySubject: Subject<boolean> = new Subject();
  public autoMembershipDirty$: Subject<boolean> = new Subject();
  public readonly targetMap: Map<string, RoleObjectInfo> = new Map();

  protected readonly LocalityTag = 'Locality';
  protected readonly ProfitCenterTag = 'ProfitCenter';
  protected readonly DepartmentTag = 'Department';
  protected readonly AERoleTag = 'AERole';
  protected config: QerProjectConfig & ProjectConfig;

  private readonly targets = [this.LocalityTag, this.ProfitCenterTag, this.DepartmentTag, this.AERoleTag];

  constructor(
    protected readonly api: QerApiService,
    public readonly session: imx_SessionService,
    public readonly translator: ImxTranslationProviderService,
    dynamicMethodSvc: DynamicMethodService,
    protected readonly project: ProjectConfigurationService) {
    this.targets.forEach((target) => {
      this.targetMap.set(target, { table: target, canBeSplitTarget: false, canBeSplitSource: false });
    });

    // Type of Role Objects
    this.targetMap.get(this.LocalityTag).respType = PortalRespLocality;
    this.targetMap.get(this.ProfitCenterTag).respType = PortalRespProfitcenter;
    this.targetMap.get(this.DepartmentTag).respType = PortalRespDepartment;
    this.targetMap.get(this.AERoleTag).respType = PortalRespAerole;
    this.targetMap.get(this.LocalityTag).adminType = PortalAdminRoleLocality;
    this.targetMap.get(this.ProfitCenterTag).adminType = PortalAdminRoleProfitcenter;
    this.targetMap.get(this.DepartmentTag).adminType = PortalAdminRoleDepartment;

    // Role Objects for Resp
    this.targetMap.get(this.LocalityTag).resp = this.api.typedClient.PortalRespLocality;
    this.targetMap.get(this.ProfitCenterTag).resp = this.api.typedClient.PortalRespProfitcenter;
    this.targetMap.get(this.DepartmentTag).resp = this.api.typedClient.PortalRespDepartment;
    this.targetMap.get(this.AERoleTag).resp = this.api.typedClient.PortalRespAerole;

    this.targetMap.get(this.LocalityTag).canBeSplitTarget = true;
    this.targetMap.get(this.ProfitCenterTag).canBeSplitTarget = true;
    this.targetMap.get(this.DepartmentTag).canBeSplitTarget = true;

    this.targetMap.get(this.LocalityTag).canBeSplitSource = true;
    this.targetMap.get(this.ProfitCenterTag).canBeSplitSource = true;
    this.targetMap.get(this.DepartmentTag).canBeSplitSource = true;

    // Role Objects for Admin (useable by tree)
    this.targetMap.get(this.LocalityTag).admin =
    {
      get: async (parameter: any) => this.api.client.portal_admin_role_locality_get(
        parameter?.OrderBy,
        parameter?.StartIndex,
        parameter?.PageSize,
        parameter?.filter,
        parameter?.withProperties,
        parameter?.search,
        parameter?.ParentKey,
        parameter?.risk)
    };
    this.targetMap.get(this.ProfitCenterTag).admin = {
      get: async (parameter: any) => this.api.client.portal_admin_role_profitcenter_get(
        parameter?.OrderBy,
        parameter?.StartIndex,
        parameter?.PageSize,
        parameter?.filter,
        parameter?.withProperties,
        parameter?.search,
        parameter?.ParentKey,
        parameter?.risk
      )
    };
    this.targetMap.get(this.DepartmentTag).admin = {
      get: async (parameter: any) => this.api.client.portal_admin_role_department_get(
        parameter?.OrderBy,
        parameter?.StartIndex,
        parameter?.PageSize,
        parameter?.filter,
        parameter?.withProperties,
        parameter?.search,
        parameter?.ParentKey,
        parameter?.risk
      )
    };


    // Entity Schema for Admin
    this.targetMap.get(this.LocalityTag).adminSchema = this.api.typedClient.PortalAdminRoleLocality.GetSchema();
    this.targetMap.get(this.ProfitCenterTag).adminSchema = this.api.typedClient.PortalAdminRoleProfitcenter.GetSchema();
    this.targetMap.get(this.DepartmentTag).adminSchema = this.api.typedClient.PortalAdminRoleDepartment.GetSchema();

    // wrapper class for interactive and interactive_byid methods
    class ApiWrapper {

      constructor(private getApi: {
        GetSchema(): EntitySchema,
        Get(): Promise<ExtendedTypedEntityCollection<WriteExtTypedEntity<RoleExtendedDataWrite>, unknown>>
      }, private getByIdApi: {
        Get_byid(id: string): Promise<ExtendedTypedEntityCollection<WriteExtTypedEntity<RoleExtendedDataWrite>, unknown>>
      }) { }

      Get(): Promise<ExtendedTypedEntityCollection<WriteExtTypedEntity<RoleExtendedDataWrite>, unknown>> {
        return this.getApi.Get();
      }

      GetSchema() { return this.getApi.GetSchema(); }

      Get_byid(id: string): Promise<ExtendedTypedEntityCollection<WriteExtTypedEntity<RoleExtendedDataWrite>, unknown>> {
        return this.getByIdApi.Get_byid(id);
      }
    }

    // Interactive Role Objects for Resp
    this.targetMap.get(this.LocalityTag).interactiveResp = new ApiWrapper(
      this.api.typedClient.PortalRespLocalityInteractive,
      this.api.typedClient.PortalRespLocalityInteractive_byid);

    this.targetMap.get(this.ProfitCenterTag).interactiveResp = new ApiWrapper(
      this.api.typedClient.PortalRespProfitcenterInteractive,
      this.api.typedClient.PortalRespProfitcenterInteractive_byid);

    this.targetMap.get(this.DepartmentTag).interactiveResp = new ApiWrapper(
      this.api.typedClient.PortalRespDepartmentInteractive,
      this.api.typedClient.PortalRespDepartmentInteractive_byid);

    this.targetMap.get(this.AERoleTag).interactiveResp = new ApiWrapper(
      this.api.typedClient.PortalRespAeroleInteractive,
      this.api.typedClient.PortalRespAeroleInteractive_byid);

    // Interactive Role Objects for Admin
    this.targetMap.get(this.LocalityTag).interactiveAdmin = new ApiWrapper(
      this.api.typedClient.PortalAdminRoleLocalityInteractive,
      this.api.typedClient.PortalAdminRoleLocalityInteractive_byid);

    this.targetMap.get(this.ProfitCenterTag).interactiveAdmin = new ApiWrapper(
      this.api.typedClient.PortalAdminRoleProfitcenterInteractive,
      this.api.typedClient.PortalAdminRoleProfitcenterInteractive_byid);

    this.targetMap.get(this.DepartmentTag).interactiveAdmin = new ApiWrapper(
      this.api.typedClient.PortalAdminRoleDepartmentInteractive,
      this.api.typedClient.PortalAdminRoleDepartmentInteractive_byid);

    // Role Membership Objects
    this.targetMap.get(this.LocalityTag).membership = new LocalityMembership(this.api, session, this.translator);
    this.targetMap.get(this.ProfitCenterTag).membership = new ProfitCenterMembership(this.api, this.session, this.translator);
    this.targetMap.get(this.DepartmentTag).membership = new DepartmentMembership(this.api, this.session, this.translator);
    this.targetMap.get(this.AERoleTag).membership = new AERoleMembership(this.api, this.session, this.translator);

    // Role Entitlement Objects
    this.targetMap.get(this.LocalityTag).entitlements = new BaseTreeEntitlement(this.api, this.session, dynamicMethodSvc, this.translator,
      'Locality', e => 'QER-V-Locality');
    this.targetMap.get(this.ProfitCenterTag).entitlements =
      new BaseTreeEntitlement(this.api, this.session, dynamicMethodSvc, this.translator,
        'ProfitCenter', e => 'QER-V-ProfitCenter');
    this.targetMap.get(this.DepartmentTag).entitlements = new BaseTreeEntitlement(this.api, this.session, dynamicMethodSvc, this.translator,
      'Department', e => 'QER-V-Department');
  }

  public getRoleTypeInfo(tableName: string): RoleObjectInfo {
    return this.targetMap.get(tableName);
  }

  public dataDirty(flag: boolean): void {
    this.dataDirtySubject.next(flag);
  }

  public autoMembershipDirty(flag: boolean): void {
    this.autoMembershipDirty$.next(flag);
  }

  public exists(tableName: string): boolean {
    return this.targetMap.has(tableName);
  }

  public async get(
    tableName: string,
    isAdmin: boolean = false,
    navigationState?: CollectionLoadParameters
  ): Promise<TypedEntityCollectionData<TypedEntity>> {
    if (this.exists(tableName)) {
      return isAdmin
        ? await this.getEntities(tableName, navigationState)
        : await this.targetMap.get(tableName).resp.Get(navigationState);
    }
    return null;
  }

  public getType(tableName: string, admin: boolean = false): any {
    return admin ? this.targetMap.get(tableName).adminType
      : this.targetMap.get(tableName).respType;
  }

  public async getEntitiesForTree(
    tableName: string,
    navigationState: CollectionLoadParameters)
    : Promise<EntityCollectionData> {
    return this.targetMap.get(tableName).admin.get(navigationState);
  }

  public async getInteractive(tableName: string, id: string, isAdmin: boolean = false): Promise<TypedEntity> {
    if (this.exists(tableName)) {
      return isAdmin
        ? (await this.targetMap.get(tableName).interactiveAdmin.Get_byid(id)).Data[0]
        : (await this.targetMap.get(tableName).interactiveResp.Get_byid(id)).Data[0];
    }

    return null;
  }

  public async getInteractiveNew(tableName: string, isAdmin: boolean = false): Promise<WriteExtTypedEntity<RoleExtendedDataWrite>> {
    if (this.exists(tableName)) {
      return isAdmin
        ? (await this.targetMap.get(tableName).interactiveAdmin.Get()).Data[0]
        : (await this.targetMap.get(tableName).interactiveResp.Get()).Data[0];
    }

    return null;
  }

  public getRoleEntitySchema(tableName: string,
    interactive: boolean = false, isAdmin: boolean = false): EntitySchema {
    if (!this.exists(tableName)) {
      return null;
    }

    if (!interactive) {
      return isAdmin
        ? this.targetMap.get(tableName).admin.GetSchema()
        : this.targetMap.get(tableName).resp.GetSchema();
    }

    return isAdmin
      ? this.targetMap.get(tableName).interactiveAdmin.GetSchema()
      : this.targetMap.get(tableName).interactiveResp.GetSchema();
  }

  public getMembershipEntitySchema(
    tableName: string,
    key: string
  ): EntitySchema {
    const membership = this.targetMap.get(tableName).membership;
    return membership.getSchema(key);
  }

  public async getDataModel(tableName: string, isAdmin: boolean): Promise<DataModel> {
    const dataModel = this.targetMap.get(tableName).dataModel;
    return dataModel?.getModel(undefined, isAdmin);
  }

  public async getComparisonConfig(): Promise<FkCandidateRouteDto[]> {
    if (this.config == null) {
      this.config = await this.project.getConfig();
    }

    // Configure role comparison
    // TODO 304148: this should not be hard-coded
    const url = 'roles/{roletype}/{uidrole}/compare/{compareroletype}/{uidcomparerole}';
    const candidates = this.config.CandidateConfig[url].filter(d => d.ParameterName == 'uidcomparerole').map(d => d.Candidates);
    return candidates;
  }

  public async getEditableFields(objectType: string, entity: IEntity, primary: boolean = false): Promise<string[]> {
    if (this.config == null) {
      this.config = await this.project.getConfig();
    }

    const list = primary
      ? this.config.OwnershipConfig.PrimaryFields
      : this.config.OwnershipConfig.EditableFields;
    return list[objectType]
      .filter(name => entity.GetSchema().Columns[name]);
  }

  public async getMemberships(
    tableName: string,
    id: string,
    navigationState?: CollectionLoadParameters
  ): Promise<ExtendedTypedEntityCollection<TypedEntity, unknown>> {
    if (!this.exists(tableName)) {
      return null;
    }
    return await this.targetMap.get(tableName).membership.get(id, navigationState);
  }

  public async getPrimaryMemberships(
    tableName: string,
    id: string,
    navigationState?: CollectionLoadParameters
  ): Promise<ExtendedTypedEntityCollection<TypedEntity, unknown>> {
    if (!this.exists(tableName)) {
      return null;
    }

    return await this.targetMap.get(tableName).membership.getPrimaryMembers(id, navigationState);
  }

  public canHavePrimaryMemberships(tableName: string): boolean {
    return this.targetMap.get(tableName).membership.hasPrimaryMemberships();
  }

  public canHaveDynamicMemberships(tableName: string): boolean {
    return this.targetMap.get(tableName).membership.supportsDynamicMemberships;
  }

  public getPrimaryMembershipSchema(tableName: string): EntitySchema {
    if (!this.exists(tableName)) {
      return null;
    }

    return this.targetMap.get(tableName).membership.getPrimaryMembersSchema();
  }

  public async getCandidates(
    tableName: string,
    id: string,
    navigationState?: CollectionLoadParameters & { xorigin?: XOrigin }
  ): Promise<ExtendedTypedEntityCollection<TypedEntity, unknown>> {
    return await this.targetMap.get(tableName).membership.getCandidates(id, navigationState);
  }

  public async getCandidatesDataModel(
    tableName: string,
    id: string
  ): Promise<DataModel> {
    return this.targetMap.get(tableName).membership.getCandidatesDataModel(id);
  }

  public GetUidPerson(tableName: string, item: TypedEntity): string {
    if (!this.exists(tableName)) {
      return null;
    }

    return this.targetMap.get(tableName).membership.GetUidPerson(item.GetEntity());
  }

  public async removeMembership(tableName: string, item: TypedEntity, role: string): Promise<void> {
    if (!this.exists(tableName)) {
      return null;
    }

    const membership = this.targetMap.get(tableName).membership;
    // the UID_Person is 1 of 2 primary keys of the membership - the one that is not equal to the UID of the role
    const uidPerson = item.GetEntity().GetKeys().filter(k => k !== role)[0];
    await membership.delete(role, uidPerson);
  }

  public async removeEntitlements(tableName: string, roleId: string, entity: IEntity): Promise<void> {
    this.targetMap.get(tableName).entitlements.delete(roleId, entity);
  }

  public async unsubscribe(item: TypedEntity): Promise<void> {
    await this.api.client.portal_itshop_unsubscribe_post({ UidPwo: [item.GetEntity().GetColumn('UID_PersonWantsOrg').GetValue()] });
  }

  public canHaveMemberships(tableName: string): boolean {
    if (!this.exists(tableName)) {
      return false;
    }

    return this.targetMap.get(tableName).membership ? true : false;
  }

  public canHaveEntitlements(tableName: string): boolean {
    if (!this.exists(tableName)) {
      return false;
    }

    return this.targetMap.get(tableName).entitlements ? true : false;
  }

  public async getEntitlements(
    tableName: string,
    id: string,
    navigationState?: CollectionLoadParameters
  ): Promise<ExtendedTypedEntityCollection<TypedEntity, unknown>> {
    if (!this.exists(tableName)) {
      return null;
    }
    return await this.targetMap.get(tableName).entitlements.getCollection(id, navigationState);
  }

  public async getEntitlementTypes(tableName: string, role: IEntity): Promise<RoleAssignmentData[]> {
    return await this.targetMap.get(tableName).entitlements.getEntitlementTypes(role);
  }

  public createEntitlementAssignmentEntity(role: IEntity, entlType: RoleAssignmentData): IEntity {
    return this.targetMap.get(role.TypeName).entitlements.createEntitlementAssignmentEntity(role, entlType);
  }

  public getEntitlementFkName(tableName: string): string {
    return this.targetMap.get(tableName).entitlements.getEntitlementFkName();
  }

  private async getEntities(tableName: string, navigationState: CollectionLoadParameters)
    : Promise<TypedEntityCollectionData<TypedEntity>> {
    const builder = new TypedEntityBuilder(this.targetMap.get(tableName).adminType);
    const data = await this.targetMap.get(tableName).admin.get(navigationState);

    return builder.buildReadWriteEntities(data, this.targetMap.get(tableName).adminSchema);
  }

  public getSplitTargets(): string[] {
    return [...this.targetMap].filter(m => m[1].canBeSplitTarget).map(m => m[0]);
  }
}
