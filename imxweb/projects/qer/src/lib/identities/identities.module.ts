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

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterModule, Routes } from '@angular/router';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { TranslateModule } from '@ngx-translate/core';

import { MatMenuModule } from '@angular/material/menu';
import { ProjectConfig } from '@imx-modules/imx-api-qbm';
import {
  BusyIndicatorModule,
  CdrModule,
  ClassloggerService,
  DataSourceToolbarModule,
  DataTableModule,
  DataTreeModule,
  DataViewModule,
  DynamicTabsModule,
  ExtModule,
  HELP_CONTEXTUAL,
  HelpContextualModule,
  LdsReplaceModule,
  MenuItem,
  MenuService,
  ObjectHistoryModule,
  RouteGuardService,
} from 'qbm';
import { isAuditor, isPersonAdmin, isPersonManager } from '../admin/qer-permissions-helper';
import { DataExplorerRegistryService } from '../data-explorer-view/data-explorer-registry.service';
import { MyResponsibilitiesRegistryService } from '../my-responsibilities-view/my-responsibilities-registry.service';
import { ObjectHyperviewModule } from '../object-hyperview/object-hyperview.module';
import { OrgChartModule } from '../org-chart/org-chart.module';
import { RequestHistoryModule } from '../request-history/request-history.module';
import { RiskModule } from '../risk/risk.module';
import { CreateNewIdentityComponent } from './create-new-identity/create-new-identity.component';
import { DuplicatesSidesheetComponent } from './create-new-identity/duplicates-sidesheet/duplicates-sidesheet.component';
import { IdentitiesReportsService } from './identities-reports.service';
import { DataExplorerIdentitiesComponent } from './identities.component';
import { IdentitiesService } from './identities.service';
import { AssignmentsComponent } from './identity-sidesheet/assignments/assignments.component';
import { IdentityRoleMembershipsModule } from './identity-sidesheet/identity-role-memberships/identity-role-memberships.module';
import { IdentitySidesheetComponent } from './identity-sidesheet/identity-sidesheet.component';

const routes: Routes = [
  {
    path: 'resp/identities',
    component: DataExplorerIdentitiesComponent,
    canActivate: [RouteGuardService],
    resolve: [RouteGuardService],
  },
];

@NgModule({
  declarations: [
    DataExplorerIdentitiesComponent,
    IdentitySidesheetComponent,
    AssignmentsComponent,
    CreateNewIdentityComponent,
    DuplicatesSidesheetComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    EuiCoreModule,
    EuiMaterialModule,
    CdrModule,
    MatExpansionModule,
    MatIconModule,
    MatSidenavModule,
    TranslateModule,
    DataSourceToolbarModule,
    DataTableModule,
    LdsReplaceModule,
    DataTreeModule,
    ObjectHistoryModule,
    ObjectHyperviewModule,
    RequestHistoryModule,
    ExtModule,
    RiskModule,
    DynamicTabsModule,
    OrgChartModule,
    BusyIndicatorModule,
    IdentityRoleMembershipsModule,
    RouterModule.forChild(routes),
    MatMenuModule,
    HelpContextualModule,
    DataViewModule,
  ],
  providers: [IdentitiesService, IdentitiesReportsService],
  exports: [DataExplorerIdentitiesComponent],
})
export class IdentitiesModule {
  constructor(
    private readonly dataExplorerRegistryService: DataExplorerRegistryService,
    private readonly menuService: MenuService,
    private readonly myResponsibilitiesRegistryService: MyResponsibilitiesRegistryService,
    logger: ClassloggerService,
  ) {
    logger.info(this, '▶️ IdentitiesModule loaded');
    this.init();
    this.setupMyResponsibilitiesView();
    this.setupMenu();
  }

  private setupMenu(): void {
    this.menuService.addMenuFactories((preProps: string[], features: string[], projectConfig: ProjectConfig, groups: string[]) => {
      const items: MenuItem[] = [];
      if (preProps.includes('ITSHOP') && (isPersonAdmin(features) || isAuditor(groups))) {
        items.push({
          id: 'QER_DataExplorer',
          navigationCommands: { commands: ['admin', 'dataexplorer'] },
          title: '#LDS#Menu Entry Data Explorer',
          sorting: '40-10',
        });
      }

      if (items.length === 0) {
        return;
      }
      return {
        id: 'ROOT_Data',
        title: '#LDS#Data administration',
        sorting: '40',
        items,
      };
    });
  }

  private init(): void {
    this.dataExplorerRegistryService.registerFactory(
      (preProps: string[], features: string[], projectConfig: ProjectConfig, groups: string[]) => {
        if (!isPersonAdmin(features) && !isAuditor(groups)) {
          return;
        }
        return {
          instance: DataExplorerIdentitiesComponent,
          sortOrder: 1,
          name: 'identities',
          caption: '#LDS#Identities',
          icon: 'contactinfo',
          contextId: HELP_CONTEXTUAL.DataExplorerIdentities,
        };
      },
    );
  }

  private setupMyResponsibilitiesView(): void {
    this.myResponsibilitiesRegistryService.registerFactory((preProps: string[], groups: string[]) => {
      if (!isPersonManager(groups)) {
        return;
      }
      return {
        instance: DataExplorerIdentitiesComponent,
        sortOrder: 1,
        name: 'identities',
        caption: '#LDS#Identities',
        contextId: HELP_CONTEXTUAL.MyResponsibilitiesIdentities,
      };
    });
  }
}
