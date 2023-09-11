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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { Router, Routes } from '@angular/router';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { TranslateModule } from '@ngx-translate/core';

import {
  CdrModule,
  ClassloggerService,
  DataSourceToolbarModule,
  DataTableModule,
  DataTreeWrapperModule,
  DateModule,
  DynamicTabsModule,
  FkAdvancedPickerModule,
  LdsReplaceModule,
  MenuService,
  ObjectHistoryModule,
  RouteGuardService,
  SelectedElementsModule,
  SqlWizardApiService,
  BusyIndicatorModule,
  HelpContextualModule,
  HELP_CONTEXTUAL,
  UserMessageModule,
} from 'qbm';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { isAuditor, isRoleAdmin, isRoleStatistics, isStructAdmin, isStructStatistics } from '../admin/qer-permissions-helper';
import { DataExplorerRegistryService } from '../data-explorer-view/data-explorer-registry.service';
import { MyResponsibilitiesRegistryService } from '../my-responsibilities-view/my-responsibilities-registry.service';
import { CompareItemComponent } from './compare/compare-item.component';
import { CompareComponent } from './compare/compare.component';
import { DynamicRoleSqlWizardService } from './dynamicrole-sqlwizard.service';
import { NewRoleComponent } from './new-role/new-role.component';
import { ObjectHyperviewModule } from '../object-hyperview/object-hyperview.module';
import { StatisticsModule } from '../statistics/statistics.module';
import { RestoreComponent } from './restore/restore.component';
import { RoleDetailComponent } from './role-detail/role-detail.component';
import { EntitlementSelectorComponent } from './role-entitlements/entitlement-selector.component';
import { RoleEntitlementsComponent } from './role-entitlements/role-entitlements.component';
import { RoleRecommendationsComponent } from './role-entitlements/role-recommendations/role-recommendations.component';
import { RoleMainDataComponent } from './role-main-data/role-main-data.component';
import { RoleMembershipsModule } from './role-memberships/role-memberships.module';
import { RoleManagementAERoleTag, RoleManagementDepartmentTag, RoleManagementLocalityTag, RoleManagementProfitCenterTag, RoleService } from './role.service';
import { RolesOverviewComponent } from './roles-overview/roles-overview.component';
import { RollbackComponent } from './rollback/rollback.component';
import { SplitComponent } from './split/split.component';
import { ProjectConfig } from 'imx-api-qbm';

const routes: Routes = [
  {
    path: 'resp/:tablename',
    component: RolesOverviewComponent,
    canActivate: [RouteGuardService],
    resolve: [RouteGuardService],
  },
];

@NgModule({
  declarations: [
    CompareComponent,
    CompareItemComponent,
    EntitlementSelectorComponent,
    RolesOverviewComponent,
    RoleDetailComponent,
    RoleMainDataComponent,
    RoleEntitlementsComponent,
    RollbackComponent,
    RestoreComponent,
    SplitComponent,
    NewRoleComponent,
    RoleRecommendationsComponent,
  ],
  imports: [
    CdrModule,
    CommonModule,
    EuiCoreModule,
    EuiMaterialModule,
    DataSourceToolbarModule,
    DataTableModule,
    DataTreeWrapperModule,
    DateModule,
    FkAdvancedPickerModule,
    FormsModule,
    ObjectHistoryModule,
    ObjectHyperviewModule,
    LdsReplaceModule,
    MatDatepickerModule,
    MatMenuModule,
    MatOptionModule,
    MatSelectModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatTooltipModule,
    ReactiveFormsModule,
    RoleMembershipsModule,
    TranslateModule,
    DynamicTabsModule,
    SelectedElementsModule,
    StatisticsModule,
    BusyIndicatorModule,
    HelpContextualModule,
    UserMessageModule,
  ],
  providers: [
    {
      provide: SqlWizardApiService,
      useClass: DynamicRoleSqlWizardService,
    },
  ],
  exports: [RolesOverviewComponent, RoleDetailComponent],
})
export class RoleManangementModule {
  constructor(
    private readonly router: Router,
    private readonly menuService: MenuService,
    private readonly dataExplorerRegistryService: DataExplorerRegistryService,
    private readonly logger: ClassloggerService,
    private readonly myResponsibilitiesRegistryService: MyResponsibilitiesRegistryService
  ) {
    this.logger.info(this, '▶︝ RoleManagement-Module loaded');

    const config = this.router.config;
    routes.forEach((route) => {
      // because these both routes have a placeholder, add them next to the last route (the wildcard-route)
      config.splice(config.length - 1, 0, route);
    });
    this.router.resetConfig(config);

    this.setupMenu();
    this.setupDataExplorer();
    this.setupMyResponsibilitiesView();
  }

  private setupDataExplorer(): void {
    this.dataExplorerRegistryService.registerFactory(
      (preProps: string[], features: string[], projectConfig: ProjectConfig, groups: string[]) => {
        if (!isRoleAdmin(features) && !isRoleStatistics(features) && !isStructStatistics(features) && !isStructAdmin(features) && !isAuditor(groups)) {
          return;
        }
        return {
          instance: RolesOverviewComponent,
          data: {
            TableName: 'Department',
            Count: 0,
          },
          contextId: HELP_CONTEXTUAL.DataExplorerDepartment,
          sortOrder: 4,
          name: 'department',
          caption: '#LDS#Departments',
        };
      },
      (preProps: string[], features: string[], projectConfig: ProjectConfig, groups: string[]) => {
        if (!isRoleAdmin(features) && !isRoleStatistics(features) && !isStructStatistics(features) && !isStructAdmin(features) && !isAuditor(groups)) {
          return;
        }
        return {
          instance: RolesOverviewComponent,
          data: {
            TableName: 'Locality',
            Count: 0,
          },
          contextId: HELP_CONTEXTUAL.DataExplorerLocality,
          sortOrder: 5,
          name: 'locality',
          caption: '#LDS#Locations',
        };
      },
      (preProps: string[], features: string[], projectConfig: ProjectConfig, groups: string[]) => {
        if (!isRoleAdmin(features) && !isRoleStatistics(features) && !isStructStatistics(features) && !isStructAdmin(features) && !isAuditor(groups)) {
          return;
        }
        return {
          instance: RolesOverviewComponent,
          data: {
            TableName: 'ProfitCenter',
            Count: 0,
          },
          contextId: HELP_CONTEXTUAL.DataExplorerProfitCenter,
          sortOrder: 6,
          name: 'profitcenter',
          caption: '#LDS#Cost centers',
        };
      }
    );
  }

  /** This method defines the menu structure for the portal. */
  private setupMenu(): void {
    this.menuService.addMenuFactories((preProps: string[], features: string[], projectConfig: ProjectConfig, groups: string[]) => {
      // must also work if ITSHOP is disabled!
      if (!isRoleAdmin(features) && !isRoleStatistics(features) && !isStructStatistics(features) && !isStructAdmin(features) && !isAuditor(groups)) {
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
        ],
      };
      return menu;
    });
  }
  private setupMyResponsibilitiesView(): void {
    this.myResponsibilitiesRegistryService.registerFactory(
      (preProps: string[], features: string[]) => ({
        instance: RolesOverviewComponent,
        sortOrder: 6,
        name: RoleManagementAERoleTag,
        caption: '#LDS#Application roles',
        data: {
          TableName: RoleManagementAERoleTag,
          Count: 0,
        },
        contextId: HELP_CONTEXTUAL.MyResponsibilitiesAERole
      }),
      (preProps: string[], features: string[]) => ({
        instance: RolesOverviewComponent,
        sortOrder: 4,
        name: RoleManagementDepartmentTag,
        caption: '#LDS#Departments',
        data: {
          TableName: RoleManagementDepartmentTag,
          Count: 0,
        },
        contextId: HELP_CONTEXTUAL.MyResponsibilitiesDepartment
      }),
      (preProps: string[], features: string[]) => ({
        instance: RolesOverviewComponent,
        sortOrder: 5,
        name: RoleManagementLocalityTag,
        caption: '#LDS#Locations',
        data: {
          TableName: RoleManagementLocalityTag,
          Count: 0,
        },
        contextId: HELP_CONTEXTUAL.MyResponsibilitiesLocality
      }),
      (preProps: string[], features: string[]) => ({
        instance: RolesOverviewComponent,
        sortOrder: 6,
        name: RoleManagementProfitCenterTag,
        caption: '#LDS#Cost centers',
        data: {
          TableName: RoleManagementProfitCenterTag,
          Count: 0,
        },
        contextId: HELP_CONTEXTUAL.MyResponsibilitiesProfitCenter
      })
    );
  }
}
