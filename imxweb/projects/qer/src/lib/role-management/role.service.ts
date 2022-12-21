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
 * Copyright 2022 One Identity LLC.
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
  OwnershipInformation,
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
import { BaseTreeRoleRestoreHandler } from './restore/restore-handler';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  // Sidesheet state vars
  public entity: IEntity;
  public ownershipInfo: OwnershipInformation;
  public isAdmin: boolean;

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

    this.targetMap.get(this.LocalityTag).restore = new BaseTreeRoleRestoreHandler(
      () => this.api.client.portal_roles_Locality_restore_get(),
      () => this.api.client.portal_resp_Locality_restore_get(),
      uid => this.api.client.portal_roles_Locality_restore_byid_get(uid),
      uid => this.api.client.portal_resp_Locality_restore_byid_get(uid),
      (uidRole, actions) => this.api.client.portal_roles_Locality_restore_byid_post(uidRole, actions),
      (uidRole, actions) => this.api.client.portal_resp_Locality_restore_byid_post(uidRole, actions)
    );

    this.targetMap.get(this.ProfitCenterTag).restore = new BaseTreeRoleRestoreHandler(
      () => this.api.client.portal_roles_ProfitCenter_restore_get(),
      () => this.api.client.portal_resp_ProfitCenter_restore_get(),
      uid => this.api.client.portal_roles_ProfitCenter_restore_byid_get(uid),
      uid => this.api.client.portal_resp_ProfitCenter_restore_byid_get(uid),
      (uidRole, actions) => this.api.client.portal_roles_ProfitCenter_restore_byid_post(uidRole, actions),
      (uidRole, actions) => this.api.client.portal_resp_ProfitCenter_restore_byid_post(uidRole, actions)
    );

    this.targetMap.get(this.DepartmentTag).restore = new BaseTreeRoleRestoreHandler(
      () => this.api.client.portal_roles_Department_restore_get(),
      () => this.api.client.portal_resp_Department_restore_get(),
      uid => this.api.client.portal_roles_Department_restore_byid_get(uid),
      uid => this.api.client.portal_resp_Department_restore_byid_get(uid),
      (uidRole, actions) => this.api.client.portal_roles_Department_restore_byid_post(uidRole, actions),
      (uidRole, actions) => this.api.client.portal_resp_Department_restore_byid_post(uidRole, actions)
    );

    this.targetMap.get(this.LocalityTag).canBeSplitTarget = true;
    this.targetMap.get(this.ProfitCenterTag).canBeSplitTarget = true;
    this.targetMap.get(this.DepartmentTag).canBeSplitTarget = true;

    this.targetMap.get(this.LocalityTag).canBeSplitSource = true;
    this.targetMap.get(this.ProfitCenterTag).canBeSplitSource = true;
    this.targetMap.get(this.DepartmentTag).canBeSplitSource = true;

    // Role Objects for Admin (useable by tree)
    this.targetMap.get(this.LocalityTag).admin =
    {
      get: async (parameter: any) => this.api.client.portal_admin_role_locality_get(parameter)
    };
    this.targetMap.get(this.ProfitCenterTag).admin = {
      get: async (parameter: any) => this.api.client.portal_admin_role_profitcenter_get(parameter)
    };
    this.targetMap.get(this.DepartmentTag).admin = {
      get: async (parameter: any) => this.api.client.portal_admin_role_department_get(parameter)
    };


    // Entity Schema for Admin
    this.targetMap.get(this.LocalityTag).adminSchema = this.api.typedClient.PortalAdminRoleLocality.GetSchema();
    this.targetMap.get(this.ProfitCenterTag).adminSchema = this.api.typedClient.PortalAdminRoleProfitcenter.GetSchema();
    this.targetMap.get(this.DepartmentTag).adminSchema = this.api.typedClient.PortalAdminRoleDepartment.GetSchema();

    // wrapper class for interactive methods
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
      this.api.typedClient.PortalRespLocalityInteractive);

    this.targetMap.get(this.ProfitCenterTag).interactiveResp = new ApiWrapper(
      this.api.typedClient.PortalRespProfitcenterInteractive,
      this.api.typedClient.PortalRespProfitcenterInteractive);

    this.targetMap.get(this.DepartmentTag).interactiveResp = new ApiWrapper(
      this.api.typedClient.PortalRespDepartmentInteractive,
      this.api.typedClient.PortalRespDepartmentInteractive);

    this.targetMap.get(this.AERoleTag).interactiveResp = new ApiWrapper(
      this.api.typedClient.PortalRespAeroleInteractive,
      this.api.typedClient.PortalRespAeroleInteractive);

    // Interactive Role Objects for Admin
    this.targetMap.get(this.LocalityTag).interactiveAdmin = new ApiWrapper(
      this.api.typedClient.PortalAdminRoleLocalityInteractive,
      this.api.typedClient.PortalAdminRoleLocalityInteractive);

    this.targetMap.get(this.ProfitCenterTag).interactiveAdmin = new ApiWrapper(
      this.api.typedClient.PortalAdminRoleProfitcenterInteractive,
      this.api.typedClient.PortalAdminRoleProfitcenterInteractive);

    this.targetMap.get(this.DepartmentTag).interactiveAdmin = new ApiWrapper(
      this.api.typedClient.PortalAdminRoleDepartmentInteractive,
      this.api.typedClient.PortalAdminRoleDepartmentInteractive);

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

  public getRoleTypeInfo(): RoleObjectInfo {
    return this.targetMap.get(this.ownershipInfo.TableName);
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

  public setSidesheetData(args: {
    ownershipInfo: OwnershipInformation,
    entity: IEntity,
    isAdmin: boolean
  }): void {
    this.ownershipInfo = args.ownershipInfo;
    this.isAdmin = args.isAdmin;
    this.entity = args.entity;
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

  public async getInteractiveInternal(): Promise<TypedEntity> {
    // This function is used to use the target map along with all state variables to get an interactive entity
    if (this.exists(this.ownershipInfo.TableName)) {
      const id = this.entity.GetKeys().join(',');
      return this.isAdmin
      ? (await this.targetMap.get(this.ownershipInfo.TableName).interactiveAdmin.Get_byid(id)).Data[0]
      : (await this.targetMap.get(this.ownershipInfo.TableName).interactiveResp.Get_byid(id)).Data[0];
    } else {
      return null;
    }
  }

  public async getInteractive(tableName: string, id: string, isAdmin: boolean = false): Promise<TypedEntity> {
    if (this.exists(tableName)) {
      return isAdmin
        ? (await this.targetMap.get(tableName).interactiveAdmin.Get_byid(id)).Data[0]
        : (await this.targetMap.get(tableName).interactiveResp.Get_byid(id)).Data[0];
    }

    return null;
  }

  public async getInteractiveNew(tableName: string): Promise<WriteExtTypedEntity<RoleExtendedDataWrite>> {
    if (this.exists(tableName)) {
      return this.isAdmin
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
    key: string
  ): EntitySchema {
    const membership = this.targetMap.get(this.ownershipInfo.TableName).membership;
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

  // Determine if any tables match, if so then we can compare
  public async canCompare(): Promise<boolean> {
    return (await this.getComparisonConfig()).filter(x => x.FkParentTableName === this.ownershipInfo.TableName).length > 0;
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

  public async getMemberships(args: {
    id: string,
    navigationState?: CollectionLoadParameters
  }): Promise<ExtendedTypedEntityCollection<TypedEntity, unknown>> {
    if (!this.exists(this.ownershipInfo.TableName)) {
      return null;
    }
    return await this.targetMap.get(this.ownershipInfo.TableName).membership.get(args.id, args.navigationState);
  }

  public async getPrimaryMemberships(args: {
    id: string,
    navigationState?: CollectionLoadParameters
  }): Promise<ExtendedTypedEntityCollection<TypedEntity, unknown>> {
    if (!this.exists(this.ownershipInfo.TableName)) {
      return null;
    }

    return await this.targetMap.get(this.ownershipInfo.TableName).membership.getPrimaryMembers(args.id, args?.navigationState);
  }

  public canHavePrimaryMemberships(tableName: string): boolean {
    return this.targetMap.get(tableName).membership.hasPrimaryMemberships();
  }

  public canHaveDynamicMemberships(tableName: string): boolean {
    return this.targetMap.get(tableName).membership.supportsDynamicMemberships;
  }

  public getPrimaryMembershipSchema(): EntitySchema {
    if (!this.exists(this.ownershipInfo.TableName)) {
      return null;
    }

    return this.targetMap.get(this.ownershipInfo.TableName).membership.getPrimaryMembersSchema();
  }

  public async getCandidates(
    id: string,
    navigationState?: CollectionLoadParameters & { xorigin?: XOrigin }
  ): Promise<ExtendedTypedEntityCollection<TypedEntity, unknown>> {
    return await this.targetMap.get(this.ownershipInfo.TableName).membership.getCandidates(id, navigationState);
  }

  public async getCandidatesDataModel(
    id: string
  ): Promise<DataModel> {
    return this.targetMap.get(this.ownershipInfo.TableName).membership.getCandidatesDataModel(id);
  }

  public getUidPerson(item: TypedEntity): string {
    if (!this.exists(this.ownershipInfo.TableName)) {
      return null;
    }

    return this.targetMap.get(this.ownershipInfo.TableName).membership.GetUidPerson(item.GetEntity());
  }

  public getUidRole(item: TypedEntity): string {
    if (!this.exists(this.ownershipInfo.TableName)) {
      return null;
    }

    return this.targetMap.get(this.ownershipInfo.TableName).membership.GetUidRole(item.GetEntity());
  }

  public async removeMembership(item: TypedEntity, role: string): Promise<void> {
    if (!this.exists(this.ownershipInfo.TableName)) {
      return null;
    }

    const membership = this.targetMap.get(this.ownershipInfo.TableName).membership;
    // the UID_Person is 1 of 2 primary keys of the membership - the one that is not equal to the UID of the role
    const uidPerson = item.GetEntity().GetKeys().filter(k => k !== role)[0];
    await membership.delete(role, uidPerson);
  }

  public async removeEntitlements(roleId: string, entity: IEntity): Promise<void> {
    this.targetMap.get(this.ownershipInfo.TableName).entitlements.delete(roleId, entity);
  }

  public async unsubscribe(item: TypedEntity): Promise<void> {
    await this.api.client.portal_itshop_unsubscribe_post({ UidPwo: [item.GetEntity().GetColumn('UID_PersonWantsOrg').GetValue()] });
  }

  public canHaveMemberships(): boolean {
    if (!this.exists(this.ownershipInfo.TableName)) {
      return false;
    }

    return this.targetMap.get(this.ownershipInfo.TableName).membership ? true : false;
  }

  public canHaveEntitlements(): boolean {
    if (!this.exists(this.ownershipInfo.TableName)) {
      return false;
    }

    return this.targetMap.get(this.ownershipInfo.TableName).entitlements ? true : false;
  }

  public async getEntitlements(args: {
    id: string,
    navigationState?: CollectionLoadParameters
  }): Promise<ExtendedTypedEntityCollection<TypedEntity, unknown>> {
    if (!this.exists(this.ownershipInfo.TableName)) {
      return null;
    }
    return await this.targetMap.get(this.ownershipInfo.TableName).entitlements.getCollection(args.id, args.navigationState);
  }

  public async getEntitlementTypes(role: IEntity): Promise<RoleAssignmentData[]> {
    return await this.targetMap.get(this.ownershipInfo.TableName).entitlements.getEntitlementTypes(role);
  }

  public createEntitlementAssignmentEntity(role: IEntity, entlType: RoleAssignmentData): IEntity {
    return this.targetMap.get(role.TypeName).entitlements.createEntitlementAssignmentEntity(role, entlType);
  }

  public getEntitlementFkName(): string {
    return this.targetMap.get(this.ownershipInfo.TableName).entitlements.getEntitlementFkName();
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
