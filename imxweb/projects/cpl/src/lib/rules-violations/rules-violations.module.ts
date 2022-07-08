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
 * Copyright 2021 One Identity LLC.
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
import { MatCardModule } from '@angular/material/card';
import { RouterModule, Routes } from '@angular/router';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { TranslateModule } from '@ngx-translate/core';

import {
  CdrModule,
  ClassloggerService,
  DataSourceToolbarModule,
  DataTableModule,
  MenuItem,
  MenuService,
  RouteGuardService
} from 'qbm';
import { RulesViolationsComponent } from './rules-violations.component';
import { RulesViolationsDetailsComponent } from './rules-violations-details/rules-violations-details.component';
import { RulesViolationsActionComponent } from './rules-violations-action/rules-violations-action.component';
import { JustificationModule } from 'qer';
import { RulesViolationsMultiActionComponent } from './rules-violations-action/rules-violations-multi-action/rules-violations-multi-action.component';
import { RulesViolationsSingleActionComponent } from './rules-violations-action/rules-violations-single-action/rules-violations-single-action.component';
import { isExceptionAdmin } from '../rules/admin/permissions-helper';
import { RuleViolationsGuardService } from '../guards/rule-violations-guard.service';
const routes: Routes = [
  {
    path: 'compliance/rulesviolations/approve',
    component: RulesViolationsComponent,
    canActivate: [RouteGuardService, RuleViolationsGuardService],
    resolve: [RouteGuardService]
  }
];

@NgModule({
  declarations: [
    RulesViolationsComponent,
    RulesViolationsDetailsComponent,
    RulesViolationsActionComponent,
    RulesViolationsMultiActionComponent,
    RulesViolationsSingleActionComponent
  ],
  imports: [
    CdrModule,
    CommonModule,
    DataSourceToolbarModule,
    DataTableModule,
    EuiCoreModule,
    EuiMaterialModule,
    FormsModule,
    JustificationModule,
    MatCardModule,
    ReactiveFormsModule,
    TranslateModule,
    RouterModule.forChild(routes),
  ]
})
export class RulesViolationsModule {

  constructor(
    private readonly menuService: MenuService,
    logger: ClassloggerService
  ) {
    logger.info(this, '▶️ RulesViolationsnModule loaded');
    this.setupMenu();
  }

  private setupMenu(): void {
    this.menuService.addMenuFactories(
      (preProps: string[], groups: string[]) => {

        const items: MenuItem[] = [];

        if (preProps.includes('ITSHOP') && isExceptionAdmin(groups)) {
          items.push(
            {
              id: 'CPL_Compliance_RulesViolations',
              navigationCommands: {
                commands: ['compliance', 'rulesviolations', 'approve']
              },
              title: '#LDS#Menu Entry Rule violations',
              description: '#LDS#Shows the rule violations for which you can grant or deny exceptions.',
              sorting: '25-20',
            },
          );
        }

        if (items.length === 0) {
          return null;
        }
        return {
          id: 'ROOT_Compliance',
          title: '#LDS#Compliance',
          sorting: '25',
          items
        };
      },
    );
  }


}
