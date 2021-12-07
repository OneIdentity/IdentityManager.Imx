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
  OwnershipInformation,
  PortalAdminRoleDepartment,
  PortalAdminRoleLocality,
  PortalAdminRoleProfitcenter,
  PortalRespAerole,
  PortalRespDepartment,
  PortalRespLocality,
  PortalRespProfitcenter,
  QerProjectConfig,
  RoleAssignmentData,
} from 'imx-api-qer';
import { CollectionLoadParameters, EntitySchema, ExtendedTypedEntityCollection, TypedEntity, IEntity, TypedEntityCollectionData, XOrigin, DataModel, TypedEntityBuilder, EntityCollectionData } from 'imx-qbm-dbts';
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
  public readonly targetMap: Map<string, RoleObjectInfo> = new Map();

  protected readonly LocalityTag = 'Locality';
  protected readonly ProfitCenterTag = 'ProfitCenter';
  protected readonly DepartmentTag = 'Department';
  protected readonly AERoleTag = 'AERole';
  protected config: QerProjectConfig;

  private readonly targets = [this.LocalityTag, this.ProfitCenterTag, this.DepartmentTag, this.AERoleTag];

  constructor(protected readonly api: QerApiService,
              public readonly session: imx_SessionService,
              public readonly translator: ImxTranslationProviderService,
              dynamicMethodSvc: DynamicMethodService,
              protected readonly project: ProjectConfigurationService) {
    this.targets.forEach((target) => {
      this.targetMap.set(target, { table: target });
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
        parameter?.parentKey,
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
        parameter?.parentKey,
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
        parameter?.parentKey,
        parameter?.risk
      )
    };


    // Entity Schema for Admin
    this.targetMap.get(this.LocalityTag).adminSchema = this.api.typedClient.PortalAdminRoleLocality.GetSchema();
    this.targetMap.get(this.ProfitCenterTag).adminSchema = this.api.typedClient.PortalAdminRoleProfitcenter.GetSchema();
    this.targetMap.get(this.DepartmentTag).adminSchema = this.api.typedClient.PortalAdminRoleDepartment.GetSchema();

    // Interactive Role Objects for Resp
    this.targetMap.get(this.LocalityTag).interactiveResp = this.api.typedClient.PortalRespLocalityInteractive_byid;
    this.targetMap.get(this.ProfitCenterTag).interactiveResp = this.api.typedClient.PortalRespProfitcenterInteractive_byid;
    this.targetMap.get(this.DepartmentTag).interactiveResp = this.api.typedClient.PortalRespDepartmentInteractive_byid;
    this.targetMap.get(this.AERoleTag).interactiveResp = this.api.typedClient.PortalRespAeroleInteractive_byid;

    // Interactive Role Objects for Admin
    this.targetMap.get(this.LocalityTag).interactiveAdmin = this.api.typedClient.PortalAdminRoleLocalityInteractive_byid;
    this.targetMap.get(this.ProfitCenterTag).interactiveAdmin = this.api.typedClient.PortalAdminRoleProfitcenterInteractive_byid;
    this.targetMap.get(this.DepartmentTag).interactiveAdmin = this.api.typedClient.PortalAdminRoleDepartmentInteractive_byid;

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

  public dataDirty(flag: boolean): void {
    this.dataDirtySubject.next(flag);
  }

  public exists(ownershipInfo: OwnershipInformation): boolean {
    return this.targetMap.has(ownershipInfo.TableName);
  }

  public async get(
    ownershipInfo: OwnershipInformation,
    isAdmin: boolean = false,
    navigationState?: CollectionLoadParameters
  ): Promise<TypedEntityCollectionData<TypedEntity>> {
    if (this.exists(ownershipInfo)) {
      return isAdmin
        ? await this.getEntities(ownershipInfo, navigationState)
        : await this.targetMap.get(ownershipInfo.TableName).resp.Get(navigationState);
    }
    return null;
  }

  public getType(ownershipInfo: OwnershipInformation, admin: boolean = false): any {
    return admin ? this.targetMap.get(ownershipInfo.TableName).adminType
      : this.targetMap.get(ownershipInfo.TableName).respType;
  }

  public async getEntitiesForTree(
    ownershipInfo: OwnershipInformation,
    navigationState: CollectionLoadParameters)
    : Promise<EntityCollectionData> {
    return this.targetMap.get(ownershipInfo.TableName).admin.get(navigationState);
  }

  public async getInteractive(ownershipInfo: OwnershipInformation, id: string, isAdmin: boolean = false): Promise<TypedEntity> {
    if (this.exists(ownershipInfo)) {
      return isAdmin
        ? (await this.targetMap.get(ownershipInfo.TableName).interactiveAdmin.Get_byid(id)).Data[0]
        : (await this.targetMap.get(ownershipInfo.TableName).interactiveResp.Get_byid(id)).Data[0];
    }

    return null;
  }

  public getRoleEntitySchema(ownershipInfo: OwnershipInformation,
                             interactive: boolean = false, isAdmin: boolean = false): EntitySchema {
    if (!this.exists(ownershipInfo)) {
      return null;
    }

    if (!interactive) {
      return isAdmin
        ? this.targetMap.get(ownershipInfo.TableName).admin.GetSchema()
        : this.targetMap.get(ownershipInfo.TableName).resp.GetSchema();
    }

    return isAdmin
      ? this.targetMap.get(ownershipInfo.TableName).interactiveAdmin.GetSchema()
      : this.targetMap.get(ownershipInfo.TableName).interactiveResp.GetSchema();
  }

  public getMembershipEntitySchema(
    ownershipInfo: OwnershipInformation,
    key: string
  ): EntitySchema {
    const membership = this.targetMap.get(ownershipInfo.TableName).membership;
    return membership.getSchema(key);
  }

  public async getDataModel(ownershipInfo: OwnershipInformation, isAdmin: boolean): Promise<DataModel> {
    const dataModel = this.targetMap.get(ownershipInfo.TableName).dataModel;
    return dataModel?.getModel(undefined, isAdmin);
  }

  public async getEditableFields(objectType: string, entity: IEntity): Promise<string[]> {
    if (this.config == null) {
      this.config = await this.project.getConfig();
    }

    return this.config.OwnershipConfig.EditableFields[objectType]
      .filter(name => entity.GetSchema().Columns[name]);
  }

  public async getMemberships(
    ownershipInfo: OwnershipInformation,
    id: string,
    navigationState?: CollectionLoadParameters
  ): Promise<ExtendedTypedEntityCollection<TypedEntity, unknown>> {
    if (!this.exists(ownershipInfo)) {
      return null;
    }
    return await this.targetMap.get(ownershipInfo.TableName).membership.get(id, navigationState);
  }

  public async getPrimaryMemberships(
    ownershipInfo: OwnershipInformation,
    id: string,
    navigationState?: CollectionLoadParameters
  ): Promise<ExtendedTypedEntityCollection<TypedEntity, unknown>> {
    if (!this.exists(ownershipInfo)) {
      return null;
    }

    return await this.targetMap.get(ownershipInfo.TableName).membership.getPrimaryMembers(id, navigationState);
  }

  public canHavePrimaryMemberships(ownershipInfo: OwnershipInformation): boolean {
    return this.targetMap.get(ownershipInfo.TableName).membership.hasPrimaryMemberships();
  }

  public getPrimaryMembershipSchema(ownershipInfo: OwnershipInformation): EntitySchema {
    if (!this.exists(ownershipInfo)) {
      return null;
    }

    return this.targetMap.get(ownershipInfo.TableName).membership.getPrimaryMembersSchema();
  }

  public async getCandidates(
    ownershipInfo: OwnershipInformation,
    id: string,
    navigationState?: CollectionLoadParameters & { xorigin?: XOrigin }
  ): Promise<ExtendedTypedEntityCollection<TypedEntity, unknown>> {
    return await this.targetMap.get(ownershipInfo.TableName).membership.getCandidates(id, navigationState);
  }

  public GetUidPerson(ownershipInfo: OwnershipInformation, item: TypedEntity): string {
    if (!this.exists(ownershipInfo)) {
      return null;
    }

    return this.targetMap.get(ownershipInfo.TableName).membership.GetUidPerson(item.GetEntity());
  }

  public async removeMembership(ownershipInfo: OwnershipInformation, item: TypedEntity, role: string): Promise<void> {
    if (!this.exists(ownershipInfo)) {
      return null;
    }

    const membership = this.targetMap.get(ownershipInfo.TableName).membership;
    // the UID_Person is 1 of 2 primary keys of the membership - the one that is not equal to the UID of the role
    const uidPerson = item.GetEntity().GetKeys().filter(k => k !== role)[0];
    await membership.delete(role, uidPerson);
  }

  public async removeEntitlements(ownershipInfo: OwnershipInformation, roleId: string, entity: IEntity): Promise<void> {
    this.targetMap.get(ownershipInfo.TableName).entitlements.delete(roleId, entity);
  }

  public async unsubscribe(item: TypedEntity): Promise<void> {
    await this.api.client.portal_itshop_unsubscribe_post({ UidPwo: [item.GetEntity().GetColumn('UID_PersonWantsOrg').GetValue()] });
  }

  public canHaveMemberships(ownershipInfo: OwnershipInformation): boolean {
    if (!this.exists(ownershipInfo)) {
      return false;
    }

    return this.targetMap.get(ownershipInfo.TableName).membership ? true : false;
  }

  public canHaveEntitlements(ownershipInfo: OwnershipInformation): boolean {
    if (!this.exists(ownershipInfo)) {
      return false;
    }

    return this.targetMap.get(ownershipInfo.TableName).entitlements ? true : false;
  }

  public async getEntitlements(
    ownershipInfo: OwnershipInformation,
    id: string,
    navigationState?: CollectionLoadParameters
  ): Promise<ExtendedTypedEntityCollection<TypedEntity, unknown>> {
    if (!this.exists(ownershipInfo)) {
      return null;
    }
    return await this.targetMap.get(ownershipInfo.TableName).entitlements.getCollection(id, navigationState);
  }

  public async getEntitlementTypes(ownershipInfo: OwnershipInformation, role: IEntity): Promise<RoleAssignmentData[]> {
    return await this.targetMap.get(ownershipInfo.TableName).entitlements.getEntitlementTypes(role);
  }

  public createEntitlementAssignmentEntity(role: IEntity, entlType: RoleAssignmentData): IEntity {
    return this.targetMap.get(role.TypeName).entitlements.createEntitlementAssignmentEntity(role, entlType);
  }

  public getEntitlementFkName(ownershipInfo: OwnershipInformation): string {
    return this.targetMap.get(ownershipInfo.TableName).entitlements.getEntitlementFkName();
  }

  private async getEntities(ownershipInfo: OwnershipInformation, navigationState: CollectionLoadParameters)
    : Promise<TypedEntityCollectionData<TypedEntity>> {
    const builder = new TypedEntityBuilder(this.targetMap.get(ownershipInfo.TableName).adminType);
    const data = await this.targetMap.get(ownershipInfo.TableName).admin.get(navigationState);

    return builder.buildReadWriteEntities(data, this.targetMap.get(ownershipInfo.TableName).adminSchema);
  }
}
