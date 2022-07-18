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
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterModule, Routes } from '@angular/router';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { TranslateModule } from '@ngx-translate/core';

import {
  CdrModule,
  ClassloggerService,
  DataSourceToolbarModule,
  DataTableModule,
  DataTreeModule,
  DynamicTabsModule,
  ExtModule,
  LdsReplaceModule,
  MenuItem,
  MenuService,
  ObjectHistoryModule,
  RouteGuardService
} from 'qbm';
import { DataExplorerIdentitiesComponent } from './identities.component';
import { IdentitiesService } from './identities.service';
import { IdentitySidesheetComponent } from './identity-sidesheet/identity-sidesheet.component';
import { IdentitiesReportsService } from './identities-reports.service';
import { isPersonAdmin } from '../admin/qer-permissions-helper';
import { RiskModule } from '../risk/risk.module';
import { DataExplorerRegistryService } from '../data-explorer-view/data-explorer-registry.service';
import { AssignmentsComponent } from './identity-sidesheet/assignments/assignments.component';
import { IdentityRoleMembershipsModule } from './identity-sidesheet/identity-role-memberships/identity-role-memberships.module';
import { OrgChartModule } from '../org-chart/org-chart.module';
import { CreateNewIdentityComponent } from './create-new-identity/create-new-identity.component';
import { DuplicatesSidesheetComponent } from './create-new-identity/duplicates-sidesheet/duplicates-sidesheet.component';

const routes: Routes = [
  {
    path: 'resp/identities',
    component: DataExplorerIdentitiesComponent,
    canActivate: [RouteGuardService],
    resolve: [RouteGuardService]
  }
];


@NgModule({
  declarations: [
    DataExplorerIdentitiesComponent,
    IdentitySidesheetComponent,
    AssignmentsComponent,
    CreateNewIdentityComponent,
    DuplicatesSidesheetComponent
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
    ExtModule,
    RiskModule,
    DynamicTabsModule,
    OrgChartModule,
    IdentityRoleMembershipsModule,
    RouterModule.forChild(routes),
  ],
  providers: [
    IdentitiesService,
    IdentitiesReportsService
  ],
  exports: [DataExplorerIdentitiesComponent],
  entryComponents: [
    CreateNewIdentityComponent,
    DuplicatesSidesheetComponent
  ]
})
export class IdentitiesModule {
  constructor(
    private readonly dataExplorerRegistryService: DataExplorerRegistryService,
    private readonly menuService: MenuService,
    logger: ClassloggerService
  ) {
    logger.info(this, '▶️ IdentitiesModule loaded');
    this.init();
    this.setupMenu();
  }

  private setupMenu(): void {
    this.menuService.addMenuFactories(
      (preProps: string[], groups: string[]) => {

        const items: MenuItem[] = [];

        if (preProps.includes('ITSHOP') && isPersonAdmin(groups)) {
          items.push(
            {
              id: 'QER_DataExplorer',
              navigationCommands: { commands: ['admin', 'dataexplorer'] },
              title: '#LDS#Menu Entry Data Explorer',
              sorting: '40-10',
            },
          );
        }

        if (items.length === 0) {
          return null;
        }
        return {
          id: 'ROOT_Data',
          title: '#LDS#Data administration',
          sorting: '40',
          items
        };
      },
    );
  }

  private init(): void {

    this.dataExplorerRegistryService.registerFactory((preProps: string[], groups: string[]) => {
      if (!isPersonAdmin(groups)) {
        return;
      }
      return {
        instance: DataExplorerIdentitiesComponent,
        sortOrder: 1,
        name: 'identities',
        caption: '#LDS#Identities',
        icon: 'contactinfo'
      };
    });
  }
}
