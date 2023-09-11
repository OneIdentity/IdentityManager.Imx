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
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { TranslateModule } from '@ngx-translate/core';

import {
  CdrModule,
  ClassloggerService,
  DataSourceToolbarModule,
  DataTableModule,
  LdsReplaceModule,
  MenuItem,
  MenuService,
  RouteGuardService,
  InfoModalDialogModule,
  SelectedElementsModule,
  HELP_CONTEXTUAL,
  HelpContextualModule,
} from 'qbm';
import { ShopAdminGuardService } from '../guards/shop-admin-guard.service';
import { FeatureGuardService } from '../guards/feature-guard.service';
import { hasFeatures, isShopAdmin } from '../admin/qer-permissions-helper';
import { ApprovalWorkflowHomeComponent } from './approval-workflow-home/approval-workflow-home.component';
import { ApprovalWorkflowEditComponent } from './approval-workflow-edit/approval-workflow-edit.component';
import { ContainerDomComponent } from './approval-workflow-edit/container-dom/container-dom.component';
import { NodeDomComponent } from './approval-workflow-edit/node-dom/node-dom.component';
import { EdgeDomComponent } from './approval-workflow-edit/edge-dom/edge-dom.component';
import { ApprovalWorkflowFormComponent } from './approval-workflow-form/approval-workflow-form.component';
import { ApprovalStepFormComponent } from './approval-step-form/approval-step-form.component';
import { ApprovalLevelFormComponent } from './approval-level-form/approval-level-form.component';
import { ApprovalWorkflowEditInfoComponent } from './approval-workflow-edit/approval-workflow-edit-info/approval-workflow-edit-info.component';

const guardedFeatures = ['Portal_Preview_WorkflowEditor'];
const routes: Routes = [
  {
    path: 'admin/approvalworkflowmanager',
    component: ApprovalWorkflowHomeComponent,
    canActivate: [RouteGuardService, ShopAdminGuardService, FeatureGuardService],
    data: {
      contextId: HELP_CONTEXTUAL.ApprovalWorkflowManager,
      features: guardedFeatures,
    },
  },
];

@NgModule({
  declarations: [
    ApprovalWorkflowHomeComponent,
    ApprovalWorkflowEditComponent,
    ApprovalWorkflowFormComponent,
    ApprovalStepFormComponent,
    ContainerDomComponent,
    NodeDomComponent,
    EdgeDomComponent,
    ApprovalLevelFormComponent,
    ApprovalStepFormComponent,
    ApprovalWorkflowFormComponent,
    ApprovalWorkflowEditInfoComponent,
  ],
  imports: [
    CommonModule,
    CdrModule,
    DataSourceToolbarModule,
    DataTableModule,
    InfoModalDialogModule,
    EuiCoreModule,
    EuiMaterialModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    TranslateModule,
    LdsReplaceModule,
    SelectedElementsModule,
    HelpContextualModule,
  ],
})
export class ApprovalWorkFlowModule {
  constructor(private readonly menuService: MenuService, logger: ClassloggerService) {
    logger.info(this, '▶️ ApprovalWorkFlowModule loaded');
    this.setupMenu();
  }

  private setupMenu(): void {
    this.menuService.addMenuFactories((preProps: string[], features: string[]) => {
      const items: MenuItem[] = [];

      if (isShopAdmin(features) && hasFeatures(features, guardedFeatures)) {
        items.push({
          id: 'QER_ApprovalWorkflows',
          navigationCommands: { commands: ['admin', 'approvalworkflowmanager'] },
          title: '#LDS#Menu Entry Approval workflows',
          sorting: '60-50',
        });
      }

      if (items.length === 0) {
        return null;
      }
      return {
        id: 'ROOT_Setup',
        title: '#LDS#Setup',
        sorting: '60',
        items,
      };
    });
  }
}
