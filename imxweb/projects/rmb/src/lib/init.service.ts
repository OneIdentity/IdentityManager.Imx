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
import { Route, Router } from '@angular/router';
import { ProjectConfig } from '@imx-modules/imx-api-qbm';
import { RoleExtendedDataWrite } from '@imx-modules/imx-api-qer';

import { PortalAdminRoleOrg, PortalPersonRolemembershipsOrg, PortalRespOrg, V2ApiClientMethodFactory } from '@imx-modules/imx-api-rmb';
import {
  CollectionLoadParameters,
  EntityCollectionData,
  EntitySchema,
  ExtendedTypedEntityCollection,
  MethodDefinition,
  MethodDescriptor,
  WriteExtTypedEntity,
} from '@imx-modules/imx-qbm-dbts';
import { DynamicMethodService, ExtService, HELP_CONTEXTUAL, ImxTranslationProviderService, MenuService, imx_SessionService } from 'qbm';
import {
  BaseTreeEntitlement,
  BaseTreeRoleRestoreHandler,
  DataExplorerRegistryService,
  IdentityRoleMembershipsService,
  MyResponsibilitiesRegistryService,
  QerApiService,
  QerPermissionsService,
  RoleService,
  RolesOverviewComponent,
  isAuditor,
  isRoleAdmin,
  isRoleStatistics,
} from 'qer';
import { OrgDataModel } from './org-data-model';
import { OrgMembership } from './org-membership';
import { RmbApiService } from './rmb-api-client.service';
import { TeamRoleComponent } from './team-role/team-role.component';

@Injectable({ providedIn: 'root' })
export class InitService {
  protected readonly orgTag = 'Org';

  constructor(
    private readonly router: Router,
    private readonly api: RmbApiService,
    private readonly qerApi: QerApiService,
    private readonly session: imx_SessionService,
    private readonly translator: ImxTranslationProviderService,
    private readonly dynamicMethodService: DynamicMethodService,
    private readonly dataExplorerRegistryService: DataExplorerRegistryService,
    private readonly menuService: MenuService,
    private readonly roleService: RoleService,
    private readonly identityRoleMembershipService: IdentityRoleMembershipsService,
    private readonly myResponsibilitiesRegistryService: MyResponsibilitiesRegistryService,
    private readonly extService: ExtService,
    private readonly qerPermissionsService: QerPermissionsService,
  ) {}

  public onInit(routes: Route[]): void {
    this.addRoutes(routes);

    // wrapper class for interactive methods
    class ApiWrapper {
      constructor(
        private getApi: {
          GetSchema(): EntitySchema;
          Get(): Promise<ExtendedTypedEntityCollection<WriteExtTypedEntity<RoleExtendedDataWrite>, unknown>>;
        },
        private getByIdApi: {
          Get_byid(id: string): Promise<ExtendedTypedEntityCollection<WriteExtTypedEntity<RoleExtendedDataWrite>, unknown>>;
        },
      ) {}

      Get(): Promise<ExtendedTypedEntityCollection<WriteExtTypedEntity<RoleExtendedDataWrite>, unknown>> {
        return this.getApi.Get();
      }

      GetSchema() {
        return this.getApi.GetSchema();
      }

      Get_byid(id: string): Promise<ExtendedTypedEntityCollection<WriteExtTypedEntity<RoleExtendedDataWrite>, unknown>> {
        return this.getByIdApi.Get_byid(id);
      }
    }

    const restore = new BaseTreeRoleRestoreHandler(
      () => this.api.client.portal_roles_Org_restore_get(),
      () => this.api.client.portal_resp_Org_restore_get(),
      (uid) => this.api.client.portal_roles_Org_restore_byid_get(uid),
      (uid) => this.api.client.portal_resp_Org_restore_byid_get(uid),
      (uidRole, actions) => this.api.client.portal_roles_Org_restore_byid_post(uidRole, actions),
      (uidRole, actions) => this.api.client.portal_resp_Org_restore_byid_post(uidRole, actions),
    );

    this.roleService.targetMap.set(this.orgTag, {
      canBeSplitTarget: true,
      canBeSplitSource: true,
      table: this.orgTag,
      respType: PortalRespOrg,
      resp: this.api.typedClient.PortalRespOrg,
      adminType: PortalAdminRoleOrg,
      adminHasHierarchy: true,
      admin: {
        get: async (parameter: any) => this.api.client.portal_admin_role_org_get(parameter),
      },
      adminSchema: this.api.typedClient.PortalAdminRoleOrg.GetSchema(),
      dataModel: new OrgDataModel(this.api),
      interactiveResp: new ApiWrapper(this.api.typedClient.PortalRespOrgInteractive, this.api.typedClient.PortalRespOrgInteractive),
      interactiveAdmin: new ApiWrapper(
        this.api.typedClient.PortalAdminRoleOrgInteractive,
        this.api.typedClient.PortalAdminRoleOrgInteractive,
      ),
      adminCanCreate: async () => {
        return (await this.api.client.portal_roles_config_businessroles_get()).EnableNewOrg;
      },
      respCanCreate: async () => {
        return (await this.api.client.portal_roles_config_businessroles_get()).EnableNewOrg;
      },
      entitlements: new BaseTreeEntitlement(this.qerApi, this.session, this.dynamicMethodService, this.translator, this.orgTag, (e) =>
        e.GetColumn('UID_OrgRoot').GetValue(),
      ),
      membership: new OrgMembership(this.api, this.session, this.translator),
      canUseRecommendations: true,
      restore,
      exportMethod: (isAdmin: boolean) => {
        const factory = new V2ApiClientMethodFactory();
        return {
          getMethod: (withProperties: string, navigationState: CollectionLoadParameters, PageSize?: number) => {
            let method: MethodDescriptor<EntityCollectionData>;
            if (PageSize) {
              method = isAdmin
                ? factory.portal_admin_role_org_get({ ...navigationState, withProperties, PageSize, StartIndex: 0 })
                : factory.portal_resp_org_get({ ...navigationState, withProperties, PageSize, StartIndex: 0 });
            } else {
              method = isAdmin
                ? factory.portal_admin_role_org_get({ ...navigationState, withProperties })
                : factory.portal_resp_org_get({ ...navigationState, withProperties });
            }
            return new MethodDefinition(method);
          },
        };
      },
      translateKeys: {
        create: '#LDS#Create business role',
        createChild: '#LDS#Create child business role',
        createHeading: '#LDS#Heading Create Business Role',
        editHeading: '#LDS#Heading Edit Business Role',
        createSnackbar: '#LDS#The business role has been successfully created.',
      },
      adminHelpContextId: HELP_CONTEXTUAL.DataExplorerBusinessRolesRoleEntitlements,
      respHelpContextId: HELP_CONTEXTUAL.MyResponsibilitiesBusinessRolesRoleEntitlements,
    });

    this.identityRoleMembershipService.addTarget({
      table: this.orgTag,
      type: PortalPersonRolemembershipsOrg,
      entitySchema: this.api.typedClient.PortalPersonRolemembershipsOrg.GetSchema(),
      controlInfo: {
        label: '#LDS#Menu Entry Business roles',
        index: 70,
      },
      get: async (uidPerson: string, parameter: CollectionLoadParameters) =>
        this.api.client.portal_person_rolememberships_Org_get(uidPerson, parameter),
      withAnalysis: true,
    });

    this.setupMenu();

    this.dataExplorerRegistryService.registerFactory(
      (preProps: string[], features: string[], projectConfig: ProjectConfig, groups: string[]) => {
        if (!isRoleAdmin(features) && !isRoleStatistics(features) && !isAuditor(groups)) {
          return undefined;
        }
        return {
          instance: RolesOverviewComponent,
          data: {
            TableName: this.orgTag,
            Count: 0,
          },
          contextId: HELP_CONTEXTUAL.DataExplorerBusinessRoles,
          sortOrder: 7,
          name: 'businessroles',
          caption: '#LDS#Menu Entry Business roles',
        };
      },
    );

    this.myResponsibilitiesRegistryService.registerFactory((preProps: string[], features: string[]) => ({
      instance: RolesOverviewComponent,
      sortOrder: 7,
      name: this.orgTag,
      caption: '#LDS#Menu Entry Business roles',
      data: {
        TableName: this.orgTag,
        Count: 0,
      },
      contextId: HELP_CONTEXTUAL.MyResponsibilitiesBusinessRoles,
    }));
    this.extService.register('Dashboard-MediumTiles', { instance: TeamRoleComponent });
  }

  private setupMenu(): void {
    this.menuService.addMenuFactories((preProps: string[], features: string[], projectConfig: ProjectConfig, groups: string[]) => {
      if (!isRoleAdmin(features) && !isRoleStatistics(features) && !isAuditor(groups)) {
        return undefined;
      }
      const menu = {
        id: 'ROOT_Data',
        title: '#LDS#Data administration',
        sorting: '40',
        items: [
          {
            id: 'QER_DataExplorer',
            navigationCommands: { commands: ['admin', 'dataexplorer'] },
            title: '#LDS#Menu Entry Data Explorer',
            sorting: '40-10',
          },
        ],
      };

      return menu;
    });
  }

  private addRoutes(routes: Route[]): void {
    const config = this.router.config;
    routes.forEach((route) => {
      config.unshift(route);
    });
    this.router.resetConfig(config);
  }
}
