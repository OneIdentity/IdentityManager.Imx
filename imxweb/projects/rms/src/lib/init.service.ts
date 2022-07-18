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
import { Router, Route } from '@angular/router';
import { RoleExtendedDataWrite } from 'imx-api-qer';

import { PortalAdminRoleEset, PortalPersonRolemembershipsEset, PortalRespEset } from 'imx-api-rms';
import { EntitySchema, ExtendedTypedEntityCollection, TypedEntity, WriteExtTypedEntity, CollectionLoadParameters } from 'imx-qbm-dbts';
import { DynamicMethodService, ImxTranslationProviderService, imx_SessionService, MenuService } from 'qbm';
import { DataExplorerRegistryService, IdentityRoleMembershipsService, RoleService, RolesOverviewComponent } from 'qer';
import { EsetDataModel } from './eset-data-model';
import { EsetEntitlements } from './eset-entitlements';
import { EsetMembership } from './eset-membership';
import { RmsApiService } from './rms-api-client.service';


@Injectable({ providedIn: 'root' })
export class InitService {

  private esetTag = 'ESet';

  constructor(
    private readonly router: Router,
    private readonly api: RmsApiService,
    private readonly session: imx_SessionService,
    private readonly translator: ImxTranslationProviderService,
    private readonly dynamicMethodSvc: DynamicMethodService,
    private readonly dataExplorerRegistryService: DataExplorerRegistryService,
    private readonly menuService: MenuService,
    private readonly roleService: RoleService,
    private readonly identityRoleMembershipService: IdentityRoleMembershipsService
  ) { }

  public onInit(routes: Route[]): void {
    this.addRoutes(routes);

    // wrapper class for interactive methods
    class ApiWrapper {

      constructor(private getByIdApi: {
        GetSchema(): EntitySchema,
        Get_byid(id: string): Promise<ExtendedTypedEntityCollection<TypedEntity, unknown>>
      }) { }

      Get(): Promise<ExtendedTypedEntityCollection<WriteExtTypedEntity<RoleExtendedDataWrite>, unknown>> {
        throw new Error("Creation of new system roles is not yet supported.");
      }

      GetSchema() { return this.getByIdApi.GetSchema(); }

      async Get_byid(id: string): Promise<ExtendedTypedEntityCollection<WriteExtTypedEntity<RoleExtendedDataWrite>, unknown>> {
        const data = await this.getByIdApi.Get_byid(id);
        const result: ExtendedTypedEntityCollection<WriteExtTypedEntity<RoleExtendedDataWrite>, unknown> = {
          ...data,
          Data: data.Data.map(d => { return new WriteExtTypedEntity<RoleExtendedDataWrite>(d.GetEntity()) })
        };
        return result;
      }
    }

    this.roleService.targetMap.set(this.esetTag, {
      canBeSplitTarget: false,
      canBeSplitSource: false,
      table: this.esetTag,
      respType: PortalRespEset,
      resp: this.api.typedClient.PortalRespEset,
      adminType: PortalAdminRoleEset,
      admin: {
        get: async (parameter: any) => this.api.client.portal_admin_role_eset_get(parameter)
      },
      adminSchema: this.api.typedClient.PortalAdminRoleEset.GetSchema(),
      dataModel: new EsetDataModel(this.api),
      interactiveResp: new ApiWrapper(
        this.api.typedClient.PortalRespEsetInteractive
      ),
      interactiveAdmin: new ApiWrapper(
        this.api.typedClient.PortalAdminRoleEsetInteractive
      ),
      entitlements: new EsetEntitlements(this.api, this.dynamicMethodSvc, this.translator),
      membership: new EsetMembership(this.api, this.session, this.translator)
    });

    this.identityRoleMembershipService.addTarget({
      table: this.esetTag,
      type: PortalPersonRolemembershipsEset,
      entitySchema: this.api.typedClient.PortalPersonRolemembershipsEset.GetSchema(),
      controlInfo: {
        label: '#LDS#Menu Entry System roles',
        index: 80,
      },
      get: async (uidPerson: string, parameter: CollectionLoadParameters) => this.api.client.portal_person_rolememberships_ESet_get(
          uidPerson,
          parameter),
      withAnalysis: true
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
            TableName: this.esetTag,
            Count: 0,
          },
          sortOrder: 8,
          name: 'systemroles',
          caption: '#LDS#Menu Entry System roles',
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
