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

import { Injectable } from '@angular/core';
import {
  OwnershipInformation,
  PortalAdminRoleAerole,
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
  RoleRecommendationResult,
  V2ApiClientMethodFactory,
} from '@imx-modules/imx-api-qer';
import {
  CollectionLoadParameters,
  DataModel,
  EntityCollectionData,
  EntitySchema,
  ExtendedTypedEntityCollection,
  FkCandidateRouteDto,
  IEntity,
  MethodDefinition,
  MethodDescriptor,
  TypedEntity,
  TypedEntityBuilder,
  TypedEntityCollectionData,
  WriteExtTypedEntity,
} from '@imx-modules/imx-qbm-dbts';
import {
  DataSourceToolbarExportMethod,
  DynamicMethodService,
  HELP_CONTEXTUAL,
  HelpContextualService,
  ImxTranslationProviderService,
  imx_SessionService,
} from 'qbm';
import { ProjectConfigurationService } from '../project-configuration/project-configuration.service';
import { QerApiService } from '../qer-api-client.service';
import { ApiWrapper } from './api-wrapper';
import { BaseTreeRoleRestoreHandler } from './restore/restore-handler';
import { BaseTreeEntitlement } from './role-entitlements/entitlement-handlers';
import { AERoleMembership, DepartmentMembership, LocalityMembership, ProfitCenterMembership } from './role-memberships/membership-handlers';
import { RoleObjectInfo, RoleTranslateKeys } from './role-object-info';

export const RoleManagementLocalityTag = 'Locality';
export const RoleManagementProfitCenterTag = 'ProfitCenter';
export const RoleManagementDepartmentTag = 'Department';
export const RoleManagementAERoleTag = 'AERole';
@Injectable({
  providedIn: 'root',
})
export class RoleService {
  // Sidesheet state vars
  public entity: IEntity;
  public ownershipInfo: OwnershipInformation;
  public isAdmin: boolean;
  public canEdit: boolean;

  public readonly targetMap: Map<string, RoleObjectInfo> = new Map();
  private readonly LocalityTag = RoleManagementLocalityTag;
  private readonly ProfitCenterTag = RoleManagementProfitCenterTag;
  private readonly DepartmentTag = RoleManagementDepartmentTag;
  private readonly AERoleTag = RoleManagementAERoleTag;
  protected config: QerProjectConfig & ProjectConfig;

  private readonly targets = [this.LocalityTag, this.ProfitCenterTag, this.DepartmentTag, this.AERoleTag];

  private factory: V2ApiClientMethodFactory;

  constructor(
    protected readonly api: QerApiService,
    public readonly session: imx_SessionService,
    public readonly translator: ImxTranslationProviderService,
    protected dynamicMethodSvc: DynamicMethodService,
    protected readonly project: ProjectConfigurationService,
    private helpContextualService: HelpContextualService,
  ) {
    this.targets.forEach((target) => {
      this.targetMap.set(target, { table: target, canBeSplitTarget: false, canBeSplitSource: false, canHaveStatistics: false });
    });

    this.factory = new V2ApiClientMethodFactory();

    this.setupLocality();
    this.setupProfitCenter();
    this.setupDepartment();
    this.setupAERole();
  }
  private setupLocality(): void {
    const localityRoleObject = this.targetMap.get(this.LocalityTag);
    if (!localityRoleObject) {
      return;
    }
    localityRoleObject.respType = PortalRespLocality;
    localityRoleObject.adminType = PortalAdminRoleLocality;
    localityRoleObject.resp = this.api.typedClient.PortalRespLocality;
    localityRoleObject.restore = new BaseTreeRoleRestoreHandler(
      () => this.api.client.portal_roles_Locality_restore_get(),
      () => this.api.client.portal_resp_Locality_restore_get(),
      (uid) => this.api.client.portal_roles_Locality_restore_byid_get(uid),
      (uid) => this.api.client.portal_resp_Locality_restore_byid_get(uid),
      (uidRole, actions) => this.api.client.portal_roles_Locality_restore_byid_post(uidRole, actions),
      (uidRole, actions) => this.api.client.portal_resp_Locality_restore_byid_post(uidRole, actions),
    );

    localityRoleObject.canBeSplitTarget = true;
    localityRoleObject.canBeSplitSource = true;
    localityRoleObject.admin = {
      get: async (parameter: any) => this.api.client.portal_admin_role_locality_get(parameter),
    };
    localityRoleObject.adminSchema = this.api.typedClient.PortalAdminRoleLocality.GetSchema();

    // Interactive Role Objects for Resp
    localityRoleObject.interactiveResp = new ApiWrapper(
      this.api.typedClient.PortalRespLocalityInteractive,
      this.api.typedClient.PortalRespLocalityInteractive,
    );

    // Interactive Role Objects for Admin
    localityRoleObject.interactiveAdmin = new ApiWrapper(
      this.api.typedClient.PortalAdminRoleLocalityInteractive,
      this.api.typedClient.PortalAdminRoleLocalityInteractive,
    );

    // Role Membership Objects
    localityRoleObject.membership = new LocalityMembership(this.api, this.session, this.translator);

    // CreationAllowed
    localityRoleObject.respCanCreate = async () => (await this.project.getConfig()).RoleMgmtConfig?.EnableNewLocality ?? true;
    localityRoleObject.adminCanCreate = async () => (await this.project.getConfig()).RoleMgmtConfig?.EnableNewLocality ?? true;

    localityRoleObject.translateKeys = {
      create: '#LDS#Create location',
      createHeading: '#LDS#Heading Create Location',
      editHeading: '#LDS#Heading Edit Location',
      createSnackbar: '#LDS#The location has been successfully created.',
      createChild: '#LDS#Create child location',
    };

    localityRoleObject.adminHasHierarchy = true;
    localityRoleObject.canUseRecommendations = true;

    localityRoleObject.adminHelpContextId = HELP_CONTEXTUAL.DataExplorerLocalityRoleEntitlements;
    localityRoleObject.respHelpContextId = HELP_CONTEXTUAL.MyResponsibilitiesLocalityRoleEntitlements;

    // Role Entitlement Objects
    localityRoleObject.entitlements = new BaseTreeEntitlement(
      this.api,
      this.session,
      this.dynamicMethodSvc,
      this.translator,
      'Locality',
      (e) => 'QER-V-Locality',
    );

    // Add export methods to Dept, Loc, Bus for resp since
    localityRoleObject.exportMethod = () => {
      return {
        getMethod: (withProperties: string, navigationState: CollectionLoadParameters, PageSize?: number) => {
          let method: MethodDescriptor<EntityCollectionData>;
          if (PageSize) {
            method = this.factory.portal_resp_locality_get({ ...navigationState, withProperties, PageSize, StartIndex: 0 });
          } else {
            method = this.factory.portal_resp_locality_get({ ...navigationState, withProperties });
          }
          return new MethodDefinition(method);
        },
      };
    };
  }

  private setupProfitCenter(): void {
    const profitCenterRoleObject = this.targetMap.get(this.ProfitCenterTag);
    if (!profitCenterRoleObject) {
      return;
    }
    profitCenterRoleObject.respType = PortalRespProfitcenter;
    profitCenterRoleObject.adminType = PortalAdminRoleProfitcenter;
    profitCenterRoleObject.resp = this.api.typedClient.PortalRespProfitcenter;
    profitCenterRoleObject.restore = new BaseTreeRoleRestoreHandler(
      () => this.api.client.portal_roles_ProfitCenter_restore_get(),
      () => this.api.client.portal_resp_ProfitCenter_restore_get(),
      (uid) => this.api.client.portal_roles_ProfitCenter_restore_byid_get(uid),
      (uid) => this.api.client.portal_resp_ProfitCenter_restore_byid_get(uid),
      (uidRole, actions) => this.api.client.portal_roles_ProfitCenter_restore_byid_post(uidRole, actions),
      (uidRole, actions) => this.api.client.portal_resp_ProfitCenter_restore_byid_post(uidRole, actions),
    );
    profitCenterRoleObject.canBeSplitTarget = true;
    profitCenterRoleObject.canBeSplitSource = true;
    profitCenterRoleObject.admin = {
      get: async (parameter: any) => this.api.client.portal_admin_role_profitcenter_get(parameter),
    };
    profitCenterRoleObject.adminSchema = this.api.typedClient.PortalAdminRoleProfitcenter.GetSchema();

    // Interactive Role Objects for Resp
    profitCenterRoleObject.interactiveResp = new ApiWrapper(
      this.api.typedClient.PortalRespProfitcenterInteractive,
      this.api.typedClient.PortalRespProfitcenterInteractive,
    );

    // Interactive Role Objects for Admin
    profitCenterRoleObject.interactiveAdmin = new ApiWrapper(
      this.api.typedClient.PortalAdminRoleProfitcenterInteractive,
      this.api.typedClient.PortalAdminRoleProfitcenterInteractive,
    );

    // Role Membership Objects
    profitCenterRoleObject.membership = new ProfitCenterMembership(this.api, this.session, this.translator);

    // CreationAllowed
    profitCenterRoleObject.respCanCreate = async () => (await this.project.getConfig()).RoleMgmtConfig?.EnableNewProfitcenter ?? true;
    profitCenterRoleObject.adminCanCreate = async () => (await this.project.getConfig()).RoleMgmtConfig?.EnableNewProfitcenter ?? true;

    profitCenterRoleObject.translateKeys = {
      create: '#LDS#Create cost center',
      createHeading: '#LDS#Heading Create Cost Center',
      editHeading: '#LDS#Heading Edit Cost Center',
      createSnackbar: '#LDS#The cost center has been successfully created.',
      createChild: '#LDS#Create child cost center',
    };

    profitCenterRoleObject.adminHasHierarchy = true;
    profitCenterRoleObject.canUseRecommendations = true;

    profitCenterRoleObject.adminHelpContextId = HELP_CONTEXTUAL.DataExplorerProfitCenterRoleEntitlements;
    profitCenterRoleObject.respHelpContextId = HELP_CONTEXTUAL.MyResponsibilitiesProfitCenterRoleEntitlements;

    // Role Entitlement Objects
    profitCenterRoleObject.entitlements = new BaseTreeEntitlement(
      this.api,
      this.session,
      this.dynamicMethodSvc,
      this.translator,
      'ProfitCenter',
      (e) => 'QER-V-ProfitCenter',
    );

    // Add export methods to Dept, Loc, Bus for resp since
    profitCenterRoleObject.exportMethod = () => {
      return {
        getMethod: (withProperties: string, navigationState: CollectionLoadParameters, PageSize?: number) => {
          let method: MethodDescriptor<EntityCollectionData>;
          if (PageSize) {
            method = this.factory.portal_resp_profitcenter_get({ ...navigationState, withProperties, PageSize, StartIndex: 0 });
          } else {
            method = this.factory.portal_resp_profitcenter_get({ ...navigationState, withProperties });
          }
          return new MethodDefinition(method);
        },
      };
    };
  }

  private setupDepartment(): void {
    const departmentRoleObject = this.targetMap.get(this.DepartmentTag);
    if (!departmentRoleObject) {
      return;
    }
    departmentRoleObject.respType = PortalRespDepartment;
    departmentRoleObject.adminType = PortalAdminRoleDepartment;
    departmentRoleObject.resp = this.api.typedClient.PortalRespDepartment;

    departmentRoleObject.restore = new BaseTreeRoleRestoreHandler(
      () => this.api.client.portal_roles_Department_restore_get(),
      () => this.api.client.portal_resp_Department_restore_get(),
      (uid) => this.api.client.portal_roles_Department_restore_byid_get(uid),
      (uid) => this.api.client.portal_resp_Department_restore_byid_get(uid),
      (uidRole, actions) => this.api.client.portal_roles_Department_restore_byid_post(uidRole, actions),
      (uidRole, actions) => this.api.client.portal_resp_Department_restore_byid_post(uidRole, actions),
    );

    departmentRoleObject.canBeSplitTarget = true;
    departmentRoleObject.canBeSplitSource = true;
    departmentRoleObject.canHaveStatistics = true;
    // Role Objects for Admin (useable by tree)
    departmentRoleObject.admin = {
      get: async (parameter: any) => this.api.client.portal_admin_role_department_get(parameter),
    };

    // Entity Schema for Admin
    departmentRoleObject.adminSchema = this.api.typedClient.PortalAdminRoleDepartment.GetSchema();

    // Interactive Role Objects for Resp
    departmentRoleObject.interactiveResp = new ApiWrapper(
      this.api.typedClient.PortalRespDepartmentInteractive,
      this.api.typedClient.PortalRespDepartmentInteractive,
    );

    // Interactive Role Objects for Admin
    departmentRoleObject.interactiveAdmin = new ApiWrapper(
      this.api.typedClient.PortalAdminRoleDepartmentInteractive,
      this.api.typedClient.PortalAdminRoleDepartmentInteractive,
    );

    // Role Membership Objects
    departmentRoleObject.membership = new DepartmentMembership(this.api, this.session, this.translator);

    // CreationAllowed
    departmentRoleObject.respCanCreate = async () => (await this.project.getConfig()).RoleMgmtConfig?.EnableNewDepartment ?? true;
    departmentRoleObject.adminCanCreate = async () => (await this.project.getConfig()).RoleMgmtConfig?.EnableNewDepartment ?? true;

    departmentRoleObject.translateKeys = {
      create: '#LDS#Create department',
      createHeading: '#LDS#Heading Create Department',
      editHeading: '#LDS#Heading Edit Department',
      createSnackbar: '#LDS#The department has been successfully created.',
      createChild: '#LDS#Create child department',
    };

    departmentRoleObject.adminHasHierarchy = true;
    departmentRoleObject.canUseRecommendations = true;

    departmentRoleObject.adminHelpContextId = HELP_CONTEXTUAL.DataExplorerDepartmentRoleEntitlements;
    departmentRoleObject.respHelpContextId = HELP_CONTEXTUAL.MyResponsibilitiesDepartmentRoleEntitlements;

    // Role Entitlement Objects
    departmentRoleObject.entitlements = new BaseTreeEntitlement(
      this.api,
      this.session,
      this.dynamicMethodSvc,
      this.translator,
      'Department',
      (e) => 'QER-V-Department',
    );

    // Add export methods to Dept, Loc, Bus for resp since
    departmentRoleObject.exportMethod = () => {
      return {
        getMethod: (withProperties: string, navigationState: CollectionLoadParameters, PageSize?: number) => {
          let method: MethodDescriptor<EntityCollectionData>;
          if (PageSize) {
            method = this.factory.portal_resp_department_get({ ...navigationState, withProperties, PageSize, StartIndex: 0 });
          } else {
            method = this.factory.portal_resp_department_get({ ...navigationState, withProperties });
          }
          return new MethodDefinition(method);
        },
      };
    };
  }

  private setupAERole(): void {
    const aeRoleObject = this.targetMap.get(this.AERoleTag);
    if (!aeRoleObject) {
      return;
    }
    // Type of Role Objects
    aeRoleObject.respType = PortalRespAerole;
    aeRoleObject.adminType = PortalAdminRoleAerole;
    // Role Objects for Resp
    aeRoleObject.resp = this.api.typedClient.PortalRespAerole;

    // Interactive Role Objects for Resp
    aeRoleObject.interactiveResp = new ApiWrapper(
      this.api.typedClient.PortalRespAeroleInteractive,
      this.api.typedClient.PortalRespAeroleInteractive,
    );

    // Role Membership Objects
    aeRoleObject.membership = new AERoleMembership(this.api, this.session, this.translator);

    // CreationAllowed
    aeRoleObject.respCanCreate = async () => (await this.project.getConfig()).RoleMgmtConfig?.EnableNewAeRole ?? true;
    aeRoleObject.adminCanCreate = async () => (await this.project.getConfig()).RoleMgmtConfig?.EnableNewAeRole ?? true;

    aeRoleObject.translateKeys = {
      create: '#LDS#Create application role',
      createHeading: '#LDS#Heading Create Application Role',
      editHeading: '#LDS#Heading Edit Application Role',
      createSnackbar: '#LDS#The application role has been successfully created.',
    };

    aeRoleObject.adminHasHierarchy = true;
    aeRoleObject.canUseRecommendations = true;

    aeRoleObject.adminHelpContextId = HELP_CONTEXTUAL.DataExplorerAERoleRoleEntitlements;
    aeRoleObject.respHelpContextId = HELP_CONTEXTUAL.MyResponsibilitiesAERoleRoleEntitlements;

    // Add export methods to Dept, Loc, Bus for resp since
    aeRoleObject.exportMethod = () => {
      return {
        getMethod: (withProperties: string, navigationState: CollectionLoadParameters, PageSize?: number) => {
          let method: MethodDescriptor<EntityCollectionData>;
          if (PageSize) {
            method = this.factory.portal_resp_aerole_get({ ...navigationState, withProperties, PageSize, StartIndex: 0 });
          } else {
            method = this.factory.portal_resp_aerole_get({ ...navigationState, withProperties });
          }
          return new MethodDefinition(method);
        },
      };
    };

    aeRoleObject.admin = {
      get: async (parameter: any) => this.api.client.portal_admin_role_aerole_get(parameter),
    };
    aeRoleObject.interactiveAdmin = new ApiWrapper(
      this.api.typedClient.PortalAdminRoleAeroleInteractive,
      this.api.typedClient.PortalAdminRoleAeroleInteractive,
    );
    aeRoleObject.entitlements = new BaseTreeEntitlement(
      this.api,
      this.session,
      this.dynamicMethodSvc,
      this.translator,
      'AERole',
      (e) => 'QER-V-AERole',
    );
  }

  public getRoleTypeInfo(): RoleObjectInfo | undefined {
    if (!this.ownershipInfo.TableName || !this.exists(this.ownershipInfo.TableName)) {
      return undefined;
    }
    return this.targetMap.get(this.ownershipInfo.TableName);
  }

  public hasHierarchy(tablename: string | undefined, isAdmin: boolean): boolean {
    if (tablename == null) {
      return false;
    }
    const table = this.targetMap.get(tablename);
    return (isAdmin ? table?.adminHasHierarchy : table?.respHasHierarchiy) === true;
  }

  public exists(tableName: string | undefined): boolean {
    return tableName != null && this.targetMap.has(tableName);
  }

  public async get(
    tableName: string,
    isAdmin: boolean = false,
    navigationState?: CollectionLoadParameters,
  ): Promise<TypedEntityCollectionData<TypedEntity> | undefined> {
    if (!this.exists(tableName)) {
      return undefined;
    }
    return isAdmin
      ? await this.getEntities(tableName, navigationState ?? {})
      : await this.targetMap.get(tableName)?.resp?.Get(navigationState ?? {});
  }

  public getExportMethod(tableName: string | undefined, isAdmin: boolean): DataSourceToolbarExportMethod | undefined {
    const roleObject = tableName == null ? undefined : this.targetMap.get(tableName);
    if (!roleObject || !roleObject.exportMethod) {
      return;
    }
    return roleObject.exportMethod(isAdmin);
  }

  public async getRecommendations(roletype: string, uidRole: string): Promise<RoleRecommendationResult> {
    return this.api.client.portal_roles_recommendations_get(roletype, uidRole);
  }

  public setSidesheetData(args: { ownershipInfo: OwnershipInformation; entity: IEntity; isAdmin: boolean; canEdit: boolean }): void {
    this.ownershipInfo = args.ownershipInfo;
    this.isAdmin = args.isAdmin;
    this.entity = args.entity;
    this.canEdit = args.canEdit;
  }

  public getType(tableName: string | undefined, admin: boolean = false): any | undefined {
    if (tableName == null) {
      return undefined;
    }
    return admin ? this.targetMap.get(tableName)?.adminType : this.targetMap.get(tableName)?.respType;
  }

  public async getEntitiesForTree(
    tableName: string | undefined,
    navigationState: CollectionLoadParameters,
  ): Promise<EntityCollectionData | undefined> {
    return tableName == null ? undefined : this.targetMap.get(tableName)?.admin?.get(navigationState);
  }

  public async getInteractiveInternal(): Promise<TypedEntity | undefined> {
    // This function is used to use the target map along with all state variables to get an interactive entity
    if (!this.ownershipInfo.TableName || !this.exists(this.ownershipInfo.TableName)) {
      return undefined;
    }
    const id = this.entity.GetKeys().join(',');
    return this.isAdmin
      ? (await this.targetMap.get(this.ownershipInfo.TableName)?.interactiveAdmin?.Get_byid(id))?.Data[0]
      : (await this.targetMap.get(this.ownershipInfo.TableName)?.interactiveResp?.Get_byid(id))?.Data[0];
  }

  public async getInteractive(tableName: string, id: string, isAdmin: boolean = false): Promise<TypedEntity | undefined> {
    if (!this.exists(tableName)) {
      return undefined;
    }
    return isAdmin
      ? (await this.targetMap.get(tableName)?.interactiveAdmin?.Get_byid(id))?.Data[0]
      : (await this.targetMap.get(tableName)?.interactiveResp?.Get_byid(id))?.Data[0];
  }

  public async getInteractiveNew(tableName: string | undefined): Promise<WriteExtTypedEntity<RoleExtendedDataWrite> | undefined> {
    if (tableName == null || !this.exists(tableName)) {
      return undefined;
    }
    return this.isAdmin
      ? (await this.targetMap.get(tableName)?.interactiveAdmin?.Get())?.Data[0]
      : (await this.targetMap.get(tableName)?.interactiveResp?.Get())?.Data[0];
  }

  public getRoleEntitySchema(
    tableName: string | undefined,
    interactive: boolean = false,
    isAdmin: boolean = false,
  ): EntitySchema | undefined {
    if (!this.exists(tableName)) {
      return undefined;
    }

    if (!interactive) {
      return tableName == null
        ? undefined
        : isAdmin
          ? this.targetMap.get(tableName)?.admin?.GetSchema()
          : this.targetMap.get(tableName)?.resp?.GetSchema();
    }

    return tableName == null
      ? undefined
      : isAdmin
        ? this.targetMap.get(tableName)?.interactiveAdmin?.GetSchema()
        : this.targetMap.get(tableName)?.interactiveResp?.GetSchema();
  }

  public getMembershipEntitySchema(): EntitySchema | undefined {
    return this.targetMap.get(this.ownershipInfo.TableName || '')?.membership?.GetSchema() ?? undefined;
  }

  public async getDataModel(tableName: string | undefined, isAdmin: boolean): Promise<DataModel> {
    if (tableName == null) {
      return {};
    }
    const dataModel = this.targetMap.get(tableName)?.dataModel;
    return dataModel?.getModel([], isAdmin) ?? {};
  }

  public async canCreate(tableName: string | undefined, isAdmin: boolean, userCanCreateAeRole: boolean): Promise<boolean> {
    if (tableName === this.AERoleTag && !userCanCreateAeRole) {
      // special case, that the user can't create application roles at all
      return false;
    }

    return (
      tableName != null &&
      (isAdmin
        ? (await this.targetMap.get(tableName)?.adminCanCreate?.()) ?? false
        : (await this.targetMap.get(tableName)?.respCanCreate?.()) ?? false)
    );
  }

  public async getComparisonConfig(): Promise<FkCandidateRouteDto[]> {
    if (this.config == null) {
      this.config = await this.project.getConfig();
    }

    // Configure role comparison
    // TODO 304148: this should not be hard-coded
    const url = 'roles/{roletype}/{uidrole}/compare/{compareroletype}/{uidcomparerole}';
    const candidates = this.config.CandidateConfig?.[url]
      ?.filter((d) => d.ParameterName == 'uidcomparerole')
      .map((d) => d.Candidates ?? {});
    return candidates ?? [];
  }

  // Determine if any tables match, if so then we can compare
  public async canCompare(): Promise<boolean> {
    return (await this.getComparisonConfig()).filter((x) => x.FkParentTableName === this.ownershipInfo.TableName).length > 0;
  }

  public async getEditableFields(objectType: string | undefined, entity: IEntity | undefined, primary: boolean = false): Promise<string[]> {
    if (this.config == null) {
      this.config = await this.project.getConfig();
    }

    const list = primary ? this.config.OwnershipConfig?.PrimaryFields ?? {} : this.config.OwnershipConfig?.EditableFields ?? {};
    return objectType == null ? [] : list[objectType].filter((name) => entity?.GetSchema().Columns[name]);
  }

  public async getMemberships(args: {
    id: string | undefined;
    navigationState?: CollectionLoadParameters;
  }): Promise<ExtendedTypedEntityCollection<TypedEntity, unknown> | undefined> {
    if (args.id == null || !this.ownershipInfo.TableName || !this.exists(this.ownershipInfo.TableName)) {
      return undefined;
    }
    return await this.targetMap.get(this.ownershipInfo.TableName)?.membership?.get(args.id, args.navigationState ?? {});
  }

  public async getPrimaryMemberships(args: {
    id: string | undefined;
    navigationState?: CollectionLoadParameters;
  }): Promise<ExtendedTypedEntityCollection<TypedEntity, unknown> | undefined> {
    if (args.id == null || !this.ownershipInfo.TableName || !this.exists(this.ownershipInfo.TableName)) {
      return undefined;
    }

    return await this.targetMap.get(this.ownershipInfo.TableName)?.membership?.getPrimaryMembers(args.id, args?.navigationState ?? {});
  }

  public canHavePrimaryMemberships(tableName: string): boolean {
    return this.targetMap.get(tableName)?.membership?.hasPrimaryMemberships() ?? false;
  }

  public canHaveDynamicMemberships(tableName: string | undefined): boolean {
    return tableName != null && (this.targetMap.get(tableName)?.membership?.supportsDynamicMemberships ?? false);
  }

  public getPrimaryMembershipSchema(): EntitySchema | undefined {
    if (!this.ownershipInfo.TableName || !this.exists(this.ownershipInfo.TableName)) {
      return undefined;
    }

    return this.targetMap.get(this.ownershipInfo.TableName)?.membership?.getPrimaryMembersSchema();
  }

  public async getCandidates(
    id: string | undefined,
    navigationState?: CollectionLoadParameters,
  ): Promise<ExtendedTypedEntityCollection<TypedEntity, unknown> | undefined> {
    if (id == null || !this.ownershipInfo.TableName || !this.exists(this.ownershipInfo.TableName)) {
      return undefined;
    }

    return this.targetMap.get(this.ownershipInfo.TableName)?.membership?.getCandidates(id, navigationState ?? {});
  }

  public async getCandidatesDataModel(id: string | undefined): Promise<DataModel> {
    if (id == null || !this.ownershipInfo.TableName || !this.exists(this.ownershipInfo.TableName)) {
      return {};
    }

    return this.targetMap.get(this.ownershipInfo.TableName)?.membership?.getCandidatesDataModel(id) ?? {};
  }

  public getUidPerson(item: TypedEntity): string {
    if (!this.ownershipInfo.TableName || !this.exists(this.ownershipInfo.TableName)) {
      return '';
    }

    return this.targetMap.get(this.ownershipInfo.TableName)?.membership?.GetUidPerson(item.GetEntity()) || '';
  }

  public getUidRole(item: TypedEntity | undefined): string {
    if (!this.ownershipInfo.TableName || !this.exists(this.ownershipInfo.TableName) || !item?.GetEntity()) {
      return '';
    }

    return this.targetMap.get(this.ownershipInfo.TableName)?.membership?.GetUidRole(item?.GetEntity()) || '';
  }

  public async removeMembership(item: TypedEntity, role: string | undefined): Promise<void> {
    if (!this.ownershipInfo.TableName || !this.exists(this.ownershipInfo.TableName)) {
      return;
    }

    const membership = this.targetMap.get(this.ownershipInfo.TableName)?.membership;
    // the UID_Person is 1 of 2 primary keys of the membership - the one that is not equal to the UID of the role
    const uidPerson = item
      .GetEntity()
      .GetKeys()
      .filter((k) => k !== role)[0];
    if (role) {
      await membership?.delete(role, uidPerson);
    }
  }

  public async removeEntitlements(roleId: string, entity: IEntity): Promise<void> {
    if (!this.ownershipInfo.TableName || !this.exists(this.ownershipInfo.TableName)) {
      return;
    }
    this.targetMap.get(this.ownershipInfo.TableName)?.entitlements?.delete(roleId, entity);
  }

  public async unsubscribe(item: TypedEntity): Promise<void> {
    await this.api.client.portal_itshop_unsubscribe_post({ UidPwo: [item.GetEntity().GetColumn('UID_PersonWantsOrg').GetValue()] });
  }

  public canHaveMemberships(): boolean {
    if (!this.ownershipInfo.TableName || !this.exists(this.ownershipInfo.TableName)) {
      return false;
    }

    return this.targetMap.get(this.ownershipInfo.TableName)?.membership ? true : false;
  }

  public canHaveStatistics(): boolean {
    if (!this.ownershipInfo.TableName || !this.exists(this.ownershipInfo.TableName)) {
      return false;
    }

    return this.targetMap.get(this.ownershipInfo.TableName)?.canHaveStatistics ?? false;
  }

  public canHaveEntitlements(): boolean {
    if (!this.ownershipInfo.TableName || !this.exists(this.ownershipInfo.TableName)) {
      return false;
    }

    return this.targetMap.get(this.ownershipInfo.TableName)?.entitlements ? true : false;
  }

  public async getEntitlements(args: {
    id: string | undefined;
    navigationState?: CollectionLoadParameters;
    objectKey?: string;
  }): Promise<ExtendedTypedEntityCollection<TypedEntity, unknown> | undefined> {
    if (args.id == null || !this.ownershipInfo.TableName || !this.exists(this.ownershipInfo.TableName)) {
      return undefined;
    }
    return await this.targetMap
      .get(this.ownershipInfo.TableName)
      ?.entitlements?.getCollection(args.id, args.navigationState ?? {}, args.objectKey);
  }

  public async getEntitlementTypes(role: IEntity | undefined): Promise<RoleAssignmentData[] | undefined> {
    if (
      !this.ownershipInfo.TableName ||
      !this.exists(this.ownershipInfo.TableName) ||
      !this.targetMap.get(this.ownershipInfo.TableName)?.entitlements
    ) {
      return [];
    }
    return await this.targetMap.get(this.ownershipInfo.TableName)?.entitlements?.getEntitlementTypes(role);
  }

  public createEntitlementAssignmentEntity(role: IEntity, entlType: RoleAssignmentData): IEntity | undefined {
    return this.targetMap.get(role.TypeName)?.entitlements?.createEntitlementAssignmentEntity(role, entlType);
  }

  public getEntitlementFkName(): string | undefined {
    if (!this.ownershipInfo.TableName || !this.exists(this.ownershipInfo.TableName)) {
      return '';
    }
    return this.targetMap.get(this.ownershipInfo.TableName)?.entitlements?.entitlementFkName;
  }

  private async getEntities(
    tableName: string,
    navigationState: CollectionLoadParameters,
  ): Promise<TypedEntityCollectionData<TypedEntity> | undefined> {
    const builder = new TypedEntityBuilder(this.targetMap.get(tableName)?.adminType);
    const data = await this.targetMap.get(tableName)?.admin?.get(navigationState ?? {});

    const adminSchema = this.targetMap.get(tableName)?.adminSchema;
    if (!adminSchema) {
      return undefined;
    }

    return builder.buildReadWriteEntities(data, adminSchema);
  }

  public getSplitTargets(): string[] {
    return [...this.targetMap].filter((m) => m[1].canBeSplitTarget).map((m) => m[0]);
  }

  public getRoleTranslateKeys(tableName: string | undefined): RoleTranslateKeys {
    return tableName == null ? {} : this.targetMap.get(tableName)?.translateKeys ?? {};
  }

  public getHelpContextId() {
    return this.ownershipInfo.TableName
      ? this.isAdmin
        ? this.targetMap.get(this.ownershipInfo.TableName)?.adminHelpContextId
        : this.targetMap.get(this.ownershipInfo.TableName)?.respHelpContextId
      : undefined;
  }
}
