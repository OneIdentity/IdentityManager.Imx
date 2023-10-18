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

import { Injectable } from '@angular/core';
import { Route, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { UnsConfig } from 'imx-api-tsb';
import { CachedPromise } from 'imx-qbm-dbts';
import {
  AuthenticationService,
  CacheService,
  DynamicMethodService,
  ExtService,
  HELP_CONTEXTUAL,
  ISessionState,
  MenuService,
  TabItem
} from 'qbm';
import {
  DataExplorerRegistryService,
  IRequestableEntitlementType,
  MyResponsibilitiesRegistryService,
  QerPermissionsService,
  RequestableEntitlementType,
  RequestableEntitlementTypeService,
} from 'qer';
import { AccountsExtComponent } from './accounts/account-ext/accounts-ext.component';
import { DataExplorerAccountsComponent } from './accounts/accounts.component';
import { isTsbNameSpaceAdminBase } from './admin/tsb-permissions-helper';
import { DataExplorerGroupsComponent } from './groups/groups.component';
import { ReportButtonExtComponent } from './report-button-ext/report-button-ext.component';
import { TsbApiService } from './tsb-api-client.service';
import { GroupMembershipsExtComponent } from './groups/group-memberships-ext/group-memberships-ext.component';
import { ProjectConfig } from 'imx-api-qbm';

@Injectable({ providedIn: 'root' })
export class InitService {
  private cachedUnsConfig: CachedPromise<UnsConfig>;
  private onSessionResponse: Subscription;

  constructor(
    private readonly authentication: AuthenticationService,
    private readonly router: Router,
    private readonly dataExplorerRegistryService: DataExplorerRegistryService,
    private readonly entlTypeService: RequestableEntitlementTypeService,
    private readonly tsbApiService: TsbApiService,
    private readonly dynamicMethodService: DynamicMethodService,
    private readonly menuService: MenuService,
    private readonly extService: ExtService,
    private readonly cacheService: CacheService,
    private readonly myResponsibilitiesRegistryService: MyResponsibilitiesRegistryService,
    private readonly permissions: QerPermissionsService
  ) {}

  public ngOnDestroy(): void {
    if (this.onSessionResponse) {
      this.onSessionResponse.unsubscribe();
    }
  }

  public async onInit(routes: Route[]): Promise<void> {
    this.cachedUnsConfig = this.cacheService.buildCache(() => this.tsbApiService.client.portal_uns_config_get());

    this.onSessionResponse = this.authentication.onSessionResponse.subscribe(async (sessionState: ISessionState) => {
      if (sessionState.IsLoggedIn) {
        if(await this.permissions.isPersonManager()){
          this.extService.register('identityReportsManager', {
            instance: ReportButtonExtComponent,
            inputData: {
              caption: '#LDS#Download report on user accounts of identities you are directly responsible for'
            }
          });
        }
      }
    });
    this.extService.register('identityAssignment', {
      instance: AccountsExtComponent,
      inputData: {
        id: 'userAccounts',
        label: '#LDS#User accounts',
        checkVisibility: async (_) => true,
      },
      sortOrder: 10,
    } as TabItem);

     this.extService.register('identityAssignment', {
       instance: GroupMembershipsExtComponent,
       inputData: {
         id: 'groups',
         label: '#LDS#System entitlements',
         checkVisibility: async (_) => true,
       },
       sortOrder: 10,
     } as TabItem);


    this.addRoutes(routes);
    this.setupMenu();

    this.entlTypeService.Register(() => this.loadUnsTypes());

    this.dataExplorerRegistryService.registerFactory(
      (preProps: string[], features: string[], projectConfig: ProjectConfig, groups: string[]) => {
        if (!preProps.includes('ITSHOP') || !isTsbNameSpaceAdminBase(groups)) {
          return;
        }
        return {
          instance: DataExplorerAccountsComponent,
          sortOrder: 2,
          name: 'accounts',
          caption: '#LDS#User accounts',
          icon: 'account',
        };
      },
      (preProps: string[], features: string[], projectConfig: ProjectConfig, groups: string[]) => {
        if (!preProps.includes('ITSHOP') || !isTsbNameSpaceAdminBase(groups)) {
          return;
        }
        return {
          instance: DataExplorerGroupsComponent,
          sortOrder: 3,
          name: 'groups',
          caption: '#LDS#System entitlements',
          icon: 'usergroup',
          contextId: HELP_CONTEXTUAL.DataExplorerGroups
        };
      }
    );

    this.entlTypeService.Register(async () => [
      new RequestableEntitlementType('TSBAccountDef', this.tsbApiService.apiClient, 'UID_TSBAccountDef', this.dynamicMethodService),
    ]);
    this.myResponsibilitiesRegistryService.registerFactory((preProps: string[], features: string[]) => ({
      instance: DataExplorerGroupsComponent,
      sortOrder: 3,
      name: 'UNSGroup',
      caption: '#LDS#System entitlements',
      icon: 'usergroup',
      contextId: HELP_CONTEXTUAL.MyResponsibilitiesGroups
    }));
  }

  private async loadUnsTypes(): Promise<IRequestableEntitlementType[]> {
    const config = await this.cachedUnsConfig.get();
    const types: IRequestableEntitlementType[] = [];
    for (const key of Object.keys(config.ShopAssign)) {
      types.push(
        new RequestableEntitlementType(key, this.tsbApiService.apiClient, config.ShopAssign[key].GroupColumnName, this.dynamicMethodService)
      );
    }
    return types;
  }

  private addRoutes(routes: Route[]): void {
    const config = this.router.config;
    routes.forEach((route) => {
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
            },
          ],
        };
      },
      (preProps: string[], features: string[], projectConfig: ProjectConfig, groups: string[]) => {
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
          ],
        };
      }
    );
  }
}
