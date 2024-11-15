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
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatRadioModule } from '@angular/material/radio';
import { MatStepperModule } from '@angular/material/stepper';
import { RouterModule, Routes } from '@angular/router';
import { EuiCoreModule } from '@elemental-ui/core';
import { TranslateModule } from '@ngx-translate/core';

import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProjectConfig, QerProjectConfig } from '@imx-modules/imx-api-qer';
import {
  BusyIndicatorModule,
  CdrModule,
  ClassloggerService,
  DataTableModule,
  HELP_CONTEXTUAL,
  HelpContextualModule,
  LdsReplaceModule,
  MenuItem,
  MenuService,
  RouteGuardService,
  SelectedElementsModule,
} from 'qbm';
import { DelegationGuardService } from './delegation-guard.service';
import { DelegationComponent } from './delegation.component';
import { DelegationService } from './delegation.service';

const routes: Routes = [
  {
    path: 'delegation',
    component: DelegationComponent,
    canActivate: [RouteGuardService, DelegationGuardService],
    resolve: [RouteGuardService],
    data: {
      contextId: HELP_CONTEXTUAL.Delegation,
    },
  },
];

@NgModule({
  imports: [
    CommonModule,
    MatCheckboxModule,
    LdsReplaceModule,
    MatStepperModule,
    CdrModule,
    MatRadioModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    DataTableModule,
    RouterModule.forChild(routes),
    MatButtonModule,
    MatProgressSpinnerModule,
    MatListModule,
    MatFormFieldModule,
    MatPaginatorModule,
    MatCardModule,
    EuiCoreModule,
    SelectedElementsModule,
    HelpContextualModule,
    BusyIndicatorModule,
    SelectedElementsModule,
  ],
  declarations: [DelegationComponent],
  providers: [DelegationService],
})
export class DelegationModule {
  constructor(
    private readonly menuService: MenuService,
    logger: ClassloggerService,
  ) {
    logger.info(this, '▶️ DelegationModule loaded');
    this.setupMenu();
  }

  private setupMenu(): void {
    this.menuService.addMenuFactories((preProps: string[], features: string[], projectConfig: QerProjectConfig & ProjectConfig) => {
      const items: MenuItem[] = [];

      if (
        preProps.includes('ITSHOP') &&
        preProps.includes('DELEGATION') &&
        (projectConfig.EnableNewDelegationIndividual || projectConfig.EnableNewDelegationSubstitute)
      ) {
        items.push({
          id: 'QER_Responsibilities_Delegation',
          route: 'delegation',
          title: '#LDS#Menu Entry Delegation',
          sorting: '30-10',
        });
      }

      if (items.length === 0) {
        return;
      }
      return {
        id: 'ROOT_Responsibilities',
        title: '#LDS#Responsibilities',
        sorting: '30',
        items,
      };
    });
  }
}
