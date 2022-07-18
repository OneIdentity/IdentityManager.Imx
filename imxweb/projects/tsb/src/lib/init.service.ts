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
import { PortalPersonGroupmemberships, UnsConfig } from 'imx-api-tsb';
import { DynamicMethodService, ExtService, MenuService, TabItem } from 'qbm';
import {
  DataExplorerRegistryService,
  IdentityRoleMembershipsService,
  IRequestableEntitlementType,
  ObjectSheetService,
  RequestableEntitlementTypeService,
} from 'qer';
import { AccountsExtComponent } from './accounts/account-ext/accounts-ext.component';
import { DataExplorerAccountsComponent } from './accounts/accounts.component';
import { isTsbNameSpaceAdminBase } from './admin/tsb-permissions-helper';
import { DataExplorerGroupsComponent } from './groups/groups.component';
import { RequestableEntitlementType } from 'qer';
import { UnsGroupObjectSheetComponent } from './objectsheet-unsgroup/unsgroup.component';
import { TsbApiService } from './tsb-api-client.service';
import { ReportButtonExtComponent } from './report-button-ext/report-button-ext.component';
@Injectable({ providedIn: 'root' })
export class InitService {
  private cachedUnsConfig: Promise<UnsConfig>;

  constructor(
    private readonly objectsheetSvc: ObjectSheetService,
    private readonly router: Router,
    private readonly dataExplorerRegistryService: DataExplorerRegistryService,
    private readonly entlTypeService: RequestableEntitlementTypeService,
    private readonly tsbApiService: TsbApiService,
    private readonly dynamicMethodService: DynamicMethodService,
    private readonly menuService: MenuService,
    private readonly extService: ExtService,
    private readonly identityRoleService: IdentityRoleMembershipsService
  ) {
  }

  public async onInit(routes: Route[]): Promise<void> {
    this.objectsheetSvc.register('UNSGroup', UnsGroupObjectSheetComponent);
    this.extService.register('identityReports', {
      instance: ReportButtonExtComponent
    });
    this.extService.register('identityAssignment', {
      instance: AccountsExtComponent,
      inputData:
      {
        id: 'userAccounts',
        label: '#LDS#User accounts',
        checkVisibility: async _ => true
      }, sortOrder: 10
    } as TabItem);

    this.identityRoleService.addTarget({
      table: 'UNSAccountInUNSGroup',
      entitySchema: this.tsbApiService.typedClient.PortalPersonGroupmemberships.GetSchema(),
      type: PortalPersonGroupmemberships,
      controlInfo: {
        label: '#LDS#System entitlements',
        index: 20
      },
      get: async (uidPerson:string, parameter: any) => this.tsbApiService.client.portal_person_groupmemberships_get(
        uidPerson, parameter)
    });

    this.addRoutes(routes);
    this.setupMenu();

    this.entlTypeService.Register(() => this.loadUnsTypes());

    this.dataExplorerRegistryService.registerFactory(
      (preProps: string[], groups: string[]) => {
        if (!preProps.includes('ITSHOP') || !isTsbNameSpaceAdminBase(groups)) {
          return;
        }
        return {
          instance: DataExplorerAccountsComponent,
          sortOrder: 2,
          name: 'accounts',
          caption: '#LDS#User accounts',
          icon: 'account'
        };
      },
      (preProps: string[], groups: string[]) => {
        if (!preProps.includes('ITSHOP') || !isTsbNameSpaceAdminBase(groups)) {
          return;
        }
        return {
          instance: DataExplorerGroupsComponent,
          sortOrder: 3,
          name: 'groups',
          caption: '#LDS#System entitlements',
          icon: 'usergroup'
        };
      },
    );

    this.entlTypeService.Register(async () => [
      new RequestableEntitlementType('TSBAccountDef',
        this.tsbApiService.apiClient,
        'UID_TSBAccountDef',
        this.dynamicMethodService)
    ]);
  }

  private async loadUnsTypes(): Promise<IRequestableEntitlementType[]> {
    // cache the UnsConfig
    if (!this.cachedUnsConfig) {
      this.cachedUnsConfig = this.tsbApiService.client.portal_uns_config_get();
    }
    const config = await this.cachedUnsConfig;
    const types: IRequestableEntitlementType[] = [];
    for (const key of Object.keys(config.ShopAssign)) {
      types.push(new RequestableEntitlementType(key,
        this.tsbApiService.apiClient,
        config.ShopAssign[key].GroupColumnName,
        this.dynamicMethodService));
    }
    return types;
  }

  private addRoutes(routes: Route[]): void {
    const config = this.router.config;
    routes.forEach(route => {
      config.unshift(route);
    });
    this.router.resetConfig(config);
  }

  private setupMenu(): void {
    this.menuService.addMenuFactories(
      (preProps: string[], __: string[]) => {
        if (!preProps.includes('ITSHOP')) {
          return null;
        }

        return {
          id: 'ROOT_Responsibilities',
          title: '#LDS#Responsibilities',
          sorting: '30',
          items: [
            {
              id: 'QER_Responsibilities_AssignOwnership',
              route: 'claimgroup',
              title: '#LDS#Menu Entry System entitlement ownership',
              sorting: '30-20',
            }
          ]
        };
      },
      (preProps: string[], groups: string[]) => {
        if (!preProps.includes('ITSHOP') || !isTsbNameSpaceAdminBase(groups)) {
          return null;
        }

        return {
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
      }
    );
  }
}
