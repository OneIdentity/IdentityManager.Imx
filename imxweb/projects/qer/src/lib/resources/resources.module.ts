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

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { Router, Routes } from '@angular/router';
import { EuiCoreModule } from '@elemental-ui/core';
import { TranslateModule } from '@ngx-translate/core';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  BusyIndicatorModule,
  CdrModule,
  ClassloggerService,
  ConfirmationModule,
  DataSourceToolbarModule,
  DataTableModule,
  HELP_CONTEXTUAL,
  HelpContextualModule,
  LdsReplaceModule,
  MenuService,
  RouteGuardService,
  SideNavigationExtension,
  SideNavigationFactory,
} from 'qbm';
import { ObjectHyperviewModule } from '../object-hyperview/object-hyperview.module';
import { isAuditor, isResourceAdmin } from '../admin/qer-permissions-helper';
import { DataExplorerRegistryService } from '../data-explorer-view/data-explorer-registry.service';
import { MyResponsibilitiesRegistryService } from '../my-responsibilities-view/my-responsibilities-registry.service';
import { ResourceSidesheetComponent } from './resource-sidesheet/resource-sidesheet.component';
import { ResourcesComponent } from './resources.component';
import { ResourcesService } from './resources.service';
import { ProjectConfig } from 'imx-api-qbm';

const routes: Routes = [
  {
    path: 'resp/QERResource',
    component: ResourcesComponent,
    canActivate: [RouteGuardService],
    resolve: [RouteGuardService],
  },
  {
    path: 'resp/QERReuseUS',
    component: ResourcesComponent,
    canActivate: [RouteGuardService],
    resolve: [RouteGuardService],
  },
  {
    path: 'resp/QERReuse',
    component: ResourcesComponent,
    canActivate: [RouteGuardService],
    resolve: [RouteGuardService],
  },
  {
    path: 'resp/QERAssign',
    component: ResourcesComponent,
    canActivate: [RouteGuardService],
    resolve: [RouteGuardService],
  },
];
@NgModule({
  declarations: [ResourcesComponent, ResourceSidesheetComponent],
  imports: [
    CommonModule,
    MatCardModule,
    BusyIndicatorModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatButtonModule,
    ObjectHyperviewModule,
    DataSourceToolbarModule,
    ReactiveFormsModule,
    DataTableModule,
    ConfirmationModule,
    CdrModule,
    LdsReplaceModule,
    TranslateModule,
    EuiCoreModule,
    HelpContextualModule
  ],
})
export class ResourcesModule {
  constructor(
    private readonly dataExplorerRegistryService: DataExplorerRegistryService,
    private readonly menuService: MenuService,
    private readonly router: Router,
    private readonly myResponsibilitiesRegistryService: MyResponsibilitiesRegistryService,
    logger: ClassloggerService
  ) {
    logger.info(this, '▶️ resources module loaded');
    const config = this.router.config;
    routes.forEach((route) => {
      // because these both routes have a placeholder, add them next to the last route (the wildcard-route)
      config.splice(config.length - 1, 0, route);
    });
    this.router.resetConfig(config);
    this.init();
    this.setupMenu();
  }

  private setupMenu(): void {
    this.menuService.addMenuFactories((preProps: string[], features: string[], projectConfig: ProjectConfig, groups: string[]) => {
      if (isResourceAdmin(features) || isAuditor(groups)) {
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
      return null;
    });
  }

  private init(): void {
    this.dataExplorerRegistryService.registerFactory(
      this.buildFactory({
        instance: ResourcesComponent,
        data: {
          TableName: ResourcesService.QERResource,
          Count: 0,
        },
        contextId: HELP_CONTEXTUAL.DataExplorerQERResource,
        sortOrder: 9,
        name: ResourcesService.QERResource,
        caption: '#LDS#Resources',
      }),
      this.buildFactory({
        instance: ResourcesComponent,
        data: {
          TableName: ResourcesService.QERReuseUS,
          Count: 0,
        },
        contextId: HELP_CONTEXTUAL.DataExplorerQERReuseUS,
        sortOrder: 10,
        name: ResourcesService.QERReuseUS,
        caption: '#LDS#Multi requestable/unsubscribable resources',
      }),
      this.buildFactory({
        instance: ResourcesComponent,
        data: {
          TableName: ResourcesService.QERReuse,
          Count: 0,
        },
        contextId: HELP_CONTEXTUAL.DataExplorerQERReuse,
        sortOrder: 11,
        name: ResourcesService.QERReuse,
        caption: '#LDS#Multi-request resources',
      }),
      this.buildFactory({
        instance: ResourcesComponent,
        data: {
          TableName: ResourcesService.QERAssign,
          Count: 0,
        },
        contextId: HELP_CONTEXTUAL.DataExplorerQERAssign,
        sortOrder: 12,
        name: ResourcesService.QERAssign,
        caption: '#LDS#Assignment resources',
      })
    );
    this.myResponsibilitiesRegistryService.registerFactory(
      this.myResponsibilitiesBuildFactory({
        instance: ResourcesComponent,
        sortOrder: 9,
        name: ResourcesService.QERResource,
        caption: '#LDS#Resources',
        contextId: HELP_CONTEXTUAL.MyResponsibilitiesQERResource
      }),
      this.myResponsibilitiesBuildFactory({
        instance: ResourcesComponent,
        sortOrder: 11,
        name: ResourcesService.QERReuse,
        caption: '#LDS#Multi-request resources',
        contextId: HELP_CONTEXTUAL.MyResponsibilitiesQERReuse
      }),
      this.myResponsibilitiesBuildFactory({
        instance: ResourcesComponent,
        sortOrder: 12,
        name: ResourcesService.QERAssign,
        caption: '#LDS#Assignment resources',
        contextId: HELP_CONTEXTUAL.MyResponsibilitiesQERAssign
      }),
      this.myResponsibilitiesBuildFactory({
        instance: ResourcesComponent,
        sortOrder: 10,
        name: ResourcesService.QERReuseUS,
        caption: '#LDS#Multi requestable/unsubscribable resources',
        contextId: HELP_CONTEXTUAL.MyResponsibilitiesQERReuseUS
      })
    );
  }

  private buildFactory(data: SideNavigationExtension): SideNavigationFactory {
    return (preProps: string[], features: string[], projectConfig: ProjectConfig, groups: string[]) => {
      if (isResourceAdmin(features) || isAuditor(groups)) {
        return data;
      }
      return;
    };
  }

  private myResponsibilitiesBuildFactory(data: SideNavigationExtension): SideNavigationFactory {
    return (preProps: string[], features: string[]) => data;
  }
}
