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
import { ExtService, HELP_CONTEXTUAL, MenuService } from 'qbm';
import { CartItemsExtensionService, DataExplorerRegistryService, MyResponsibilitiesRegistryService } from 'qer';
import { AccessRequestService } from './access-request/access-request.service';
import { AccessComponent } from './access/access.component';
import { UserAccessComponent } from './access/user-access.component';
import { DugOverviewComponent } from './dug-overview/dug-overview.component';
import { DugOwnershipComponent } from './dug-ownership/dug-ownership.component';
import { IdentityComponent } from './identity/identity.component';
import { QamApiService } from './qam-api-client.service';

@Injectable({ providedIn: 'root' })
export class InitService {
  protected readonly dgeTag = 'QAMDuG';

  constructor(
    private readonly router: Router,
    private readonly extService: ExtService,
    private readonly cartItemExtService: CartItemsExtensionService,
    private readonly menuService: MenuService,
    private readonly myResponsibilitiesRegistryService: MyResponsibilitiesRegistryService,
    private readonly dataExplorerRegistryService: DataExplorerRegistryService,
    private readonly qamClientService: QamApiService
  ) {}

  public onInit(routes: Route[]): void {
    // register the extension on the group sidesheet
    this.extService.register('groupSidesheet', {
      instance: AccessComponent,
      inputData: {
        id: 'access',
        label: '#LDS#Access',
        checkVisibility: async (ref) => this.supportsAccess(ref),
      },
    });

    // register the extension on the account sidesheet
    this.extService.register('accountSidesheet', {
      instance: AccessComponent,
      inputData: {
        id: 'access',
        label: '#LDS#Access',
        checkVisibility: async (ref) => this.supportsAccess(ref),
      },
    });

    // register the extension on the identity sidesheet
    this.extService.register('identitySidesheet', {
      instance: IdentityComponent,
      inputData: {
        id: 'access',
        label: '#LDS#Resource Access',
        checkVisibility: async (ref) => true,
      },
    });

    // register the extension on the profile
    this.extService.register('profile', {
      instance: UserAccessComponent,
      inputData: {
        id: 'access',
        label: '#LDS#Resource Access',
        checkVisibility: async (_) => true,
      },
    });

    this.cartItemExtService.register('AccessRequestService', AccessRequestService);

    this.myResponsibilitiesRegistryService.registerFactory(() => ({
      instance: DugOverviewComponent,
      sortOrder: 7,
      name: this.dgeTag,
      caption: '#LDS#Menu Entry Governed Data',
      data: {
        TableName: this.dgeTag,
        Count: 0,
      },
      contextId: HELP_CONTEXTUAL.GovernedData,
    }));

    this.dataExplorerRegistryService.registerFactory(
      (preProps: string[], features: string[], projectConfig: ProjectConfig, groups: string[],) => {
       if (!this.qamClientService.isPersonDGEAdmin(groups)) {
         return;
       }
       return {
         instance: DugOverviewComponent,
         sortOrder: 1,
         name: this.dgeTag,
         caption: '#LDS#Governed Data Overview',
         data: {
           TableName: this.dgeTag,
           Count: 0,
         },
         contextId: HELP_CONTEXTUAL.GovernedDataOverview,
       };
     },
   );

   this.dataExplorerRegistryService.registerFactory(
    (preProps: string[], features: string[], projectConfig: ProjectConfig, groups: string[],) => {
     if (!this.qamClientService.isPersonDGEAdmin(groups)) {
       return;
     }
     return {
      instance: DugOwnershipComponent,
      sortOrder: 8,
      name: 'QAMDuGOWNER',
      caption: '#LDS#Governed Data Ownership',
      data: {
        TableName: this.dgeTag,
        Count: 0,
      },
      contextId: HELP_CONTEXTUAL.GovernedDataOwnership,
     };
   },
 );

    this.addRoutes(routes);
  }

  private supportsAccess(referrer: any): boolean {
    return referrer ? ['SPSIdentity', 'SPSGroup', 'ADSAccount', 'ADSGroup'].includes(referrer.objecttable) : false;
  }

  private addRoutes(routes: Route[]): void {
    const config = this.router.config;
    routes.forEach((route) => {
      config.unshift(route);
    });
    this.router.resetConfig(config);
  }
}
