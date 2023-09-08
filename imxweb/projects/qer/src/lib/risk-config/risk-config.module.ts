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

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ClassloggerService,
  MenuItem,
  MenuService,
  RouteGuardService,
  DataSourceToolbarModule, DataTableModule, CdrModule, HELP_CONTEXTUAL, HelpContextualModule
} from 'qbm';
import { isRuleAdmin } from '../admin/qer-permissions-helper';
import { RiskConfigComponent } from './risk-config.component';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { RiskConfigSidesheetComponent } from './risk-config-sidesheet/risk-config-sidesheet.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RuleAdminGuardService } from '../guards/rule-admin-guard.service';
const routes: Routes = [
  {
    path: 'configuration/risk',
    component: RiskConfigComponent,
    canActivate: [RouteGuardService, RuleAdminGuardService],
    data:{
      contextId: HELP_CONTEXTUAL.ConfigurationRisk
    }
  },
];


@NgModule({
  declarations: [
    RiskConfigComponent,
    RiskConfigSidesheetComponent
  ],
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule.forChild(routes),
    CdrModule,
    DataSourceToolbarModule,
    DataTableModule,
    EuiCoreModule,
    EuiMaterialModule,
    ReactiveFormsModule,
    HelpContextualModule,
  ],
  exports: [
    RiskConfigComponent
  ]
})
export class RiskConfigModule {
  constructor(
    private readonly menuService: MenuService,
    logger: ClassloggerService) {
    logger.info(this, '▶️ RiskConfigModule loaded');
    this.setupMenu();
  }

  private setupMenu(): void {
    this.menuService.addMenuFactories(
      (preProps: string[], features: string[]) => {

        const items: MenuItem[] = [];

        if (isRuleAdmin(features)) {
          items.push(
            {
              id: 'QER_Setup_RiskConfig',
              route: 'configuration/risk',
              title: '#LDS#Menu Entry Risk index functions',
              sorting: '50-50',
            },
          );
        }

        if (items.length === 0) {
          return null;
        }
        return {
          id: 'ROOT_Setup',
          title: '#LDS#Setup',
          sorting: '50',
          items
        };
      },
    );
  }

 }
