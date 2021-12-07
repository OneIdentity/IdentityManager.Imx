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
import { Router, Route } from '@angular/router';

import { PortalAdminRoleOrg, PortalRespOrg } from 'imx-api-rmb';
import { QerApiService, RoleService, BaseTreeEntitlement, DataExplorerRegistryService, RolesOverviewComponent } from 'qer';
import { DynamicMethodService, ImxTranslationProviderService, imx_SessionService, MenuService } from 'qbm';
import { OrgMembership } from './org-membership';
import { RmbApiService } from './rmb-api-client.service';
import { OrgDataModel } from './org-data-model';


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
    private readonly roleService: RoleService
  ) {
  }

  public onInit(routes: Route[]): void {
    this.addRoutes(routes);

    this.roleService.targetMap.set(this.orgTag, {
      table: this.orgTag,
      respType: PortalRespOrg,
      resp: this.api.typedClient.PortalRespOrg,
      adminType: PortalAdminRoleOrg,
      admin: {
        get: async (parameter: any) => this.api.client.portal_admin_role_org_get(
          parameter?.OrderBy,
          parameter?.StartIndex,
          parameter?.PageSize,
          parameter?.filter,
          parameter?.withProperties,
          parameter?.search,
          parameter?.parentKey,
          parameter?.risk,
          parameter?.orgroot
        )
      },
      adminSchema: this.api.typedClient.PortalAdminRoleOrg.GetSchema(),
      dataModel: new OrgDataModel(this.api),
      interactiveResp: this.api.typedClient.PortalRespOrgInteractive_byid,
      interactiveAdmin: this.api.typedClient.PortalAdminRoleOrgInteractive_byid,
      entitlements: new BaseTreeEntitlement(this.qerApi, this.session, this.dynamicMethodService, this.translator,
        this.orgTag, e => e.GetColumn('UID_OrgRoot').GetValue()),
      membership: new OrgMembership(this.api, this.session, this.translator)
    });

    this.setupMenu();

    this.dataExplorerRegistryService.registerFactory(
      (preProps: string[], groups: string[]) => {
        if (!this.isRoleAdmin(groups)) {
          return;
        }
        return {
          instance: RolesOverviewComponent,
          data: {
            TableName: this.orgTag,
            Count: 0,
          },
          sortOrder: 7,
          name: 'businessroles',
          caption: '#LDS#Menu Entry Business roles',
        };
      }
    );
  }

  private setupMenu(): void {
    this.menuService.addMenuFactories(
      (preProps: string[], groups: string[]) => {
        if (!this.isRoleAdmin(groups)) {
          return null;
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
          ]
        };

        return menu;
      });
  }

  private isRoleAdmin(groups: string[]): boolean {
    return groups.find((group) => {
      const groupName = group.toUpperCase();
      return groupName === 'VI_4_ROLEADMIN_ADMIN';
    }) ? true : false;
  }

  private addRoutes(routes: Route[]): void {
    const config = this.router.config;
    routes.forEach(route => {
      config.unshift(route);
    });
    this.router.resetConfig(config);
  }
}
