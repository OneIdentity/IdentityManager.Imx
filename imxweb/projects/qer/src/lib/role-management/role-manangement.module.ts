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

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  SqlWizardApiService
} from 'qbm';

import { RoleDetailComponent } from './role-detail/role-detail.component';
import { RoleEntitlementsComponent } from './role-entitlements/role-entitlements.component';
import { RoleMainDataComponent } from './role-main-data/role-main-data.component';
import { RolesOverviewComponent } from './roles-overview/roles-overview.component';
import { EntitlementSelectorComponent } from './role-entitlements/entitlement-selector.component';
import { RoleMembershipsModule } from './role-memberships/role-memberships.module';
import { isStructAdmin } from '../admin/qer-permissions-helper';
import { DataExplorerRegistryService } from '../data-explorer-view/data-explorer-registry.service';
import { DynamicRoleSqlWizardService } from './dynamicrole-sqlwizard.service';
import { CompareComponent } from './compare/compare.component';
import { CompareItemComponent } from './compare/compare-item.component';
import { RestoreComponent } from './restore/restore.component';
import { SplitComponent } from './split/split.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RollbackComponent } from './rollback/rollback.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatListModule } from '@angular/material/list';

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
    DynamicTabsModule
  ],
  providers: [
    {
      provide: SqlWizardApiService,
      useClass: DynamicRoleSqlWizardService
    },
  ],
  exports: [
    RolesOverviewComponent
  ]
})
export class RoleManangementModule {

  constructor(
    private readonly router: Router,
    private readonly menuService: MenuService,
    private readonly dataExplorerRegistryService: DataExplorerRegistryService,
    private readonly logger: ClassloggerService) {
    this.logger.info(this, '▶︝ RoleManagement-Module loaded');

    const config = this.router.config;
    routes.forEach((route) => {
      // because these both routes have a placeholder, add them next to the last route (the wildcard-route)
      config.splice(config.length - 1, 0, route);
    });
    this.router.resetConfig(config);

    this.setupMenu();
    this.setupDataExplorer();
  }

  private setupDataExplorer(): void {
    this.dataExplorerRegistryService.registerFactory(
      (preProps: string[], groups: string[]) => {
        if (!isStructAdmin(groups)) {
          return;
        }
        return {
          instance: RolesOverviewComponent,
          data: {
            TableName: 'Department',
            Count: 0,
          },
          sortOrder: 4,
          name: 'department',
          caption: '#LDS#Menu Entry Departments',
        };
      },
      (preProps: string[], groups: string[]) => {
        if (!isStructAdmin(groups)) {
          return;
        }
        return {
          instance: RolesOverviewComponent,
          data: {
            TableName: 'Locality',
            Count: 0,
          },
          sortOrder: 5,
          name: 'locality',
          caption: '#LDS#Menu Entry Locations',
        };
      },
      (preProps: string[], groups: string[]) => {
        if (!isStructAdmin(groups)) {
          return;
        }
        return {
          instance: RolesOverviewComponent,
          data: {
            TableName: 'ProfitCenter',
            Count: 0,
          },
          sortOrder: 6,
          name: 'profitcenter',
          caption: '#LDS#Menu Entry Cost centers',
        };
      }
    );
  }

  /** This method defines the menu structure for the portal. */
  private setupMenu(): void {
    this.menuService.addMenuFactories(
      (preProps: string[], groups: string[]) => {
        // must also work if ITSHOP is disabled!
        if (!isStructAdmin(groups)) {
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
      }
    );
  }
}

