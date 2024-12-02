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
import { FormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule, Routes } from '@angular/router';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { ProjectConfig } from '@imx-modules/imx-api-qbm';
import { TranslateModule } from '@ngx-translate/core';
import {
  ClassloggerService,
  DataSourceToolbarModule,
  DataTableModule,
  DataViewModule,
  DateModule,
  ExtService,
  HELP_CONTEXTUAL,
  HelpContextualModule,
  LdsReplaceModule,
  MenuService,
  RouteGuardService,
} from 'qbm';
import { isPersonManager } from '../admin/qer-permissions-helper';
import { ManagerGuardService } from '../guards/manager-guard.service';
import { TilesModule } from '../tiles/tiles.module';
import { TeamResponsibilitiesComponent } from './team-responsibilities.component';
import { TeamResponsibilitiesService } from './team-responsibilities.service';
import { TeamResponsibilityAssignSidesheetComponent } from './team-responsibility-assign-sidesheet/team-responsibility-assign-sidesheet.component';
import { TeamResponsibilityDialogComponent } from './team-responsibility-dialog/team-responsibility-dialog.component';
import { TeamResponsibilitySidesheetComponent } from './team-responsibility-sidesheet/team-responsibility-sidesheet.component';
import { TeamResponsibilityStatusDialogComponent } from './team-responsibility-status-dialog/team-responsibility-status-dialog.component';
import { TeamResponsibilityTileComponent } from './team-responsibility-tile/team-responsibility-tile.component';

const routes: Routes = [
  {
    path: 'teamresponsibilities',
    component: TeamResponsibilitiesComponent,
    canActivate: [RouteGuardService, ManagerGuardService],
    resolve: [RouteGuardService],
    data: {
      contextId: HELP_CONTEXTUAL.TeamResponsibilities,
    },
  },
];

@NgModule({
  declarations: [
    TeamResponsibilitiesComponent,
    TeamResponsibilitySidesheetComponent,
    TeamResponsibilityTileComponent,
    TeamResponsibilityDialogComponent,
    TeamResponsibilityAssignSidesheetComponent,
    TeamResponsibilityStatusDialogComponent,
  ],
  imports: [
    CommonModule,
    EuiCoreModule,
    EuiMaterialModule,
    RouterModule.forChild(routes),
    DataSourceToolbarModule,
    DataTableModule,
    TranslateModule,
    TilesModule,
    HelpContextualModule,
    DataViewModule,
    LdsReplaceModule,
    MatSlideToggleModule,
    MatTooltipModule,
    FormsModule,
    DateModule,
  ],
  providers: [TeamResponsibilitiesService],
})
export class TeamResponsibilitiesModule {
  constructor(
    private readonly menuService: MenuService,
    private readonly extService: ExtService,
    logger: ClassloggerService,
  ) {
    logger.info(this, '▶️ TeamResponsibilitiesModule loaded');
    this.setupMenu();
    this.extService.register('Dashboard-SmallTiles', { instance: TeamResponsibilityTileComponent });
  }

  private async setupMenu(): Promise<void> {
    this.menuService.addMenuFactories((preProps: string[], features: string[], projectConfig?: ProjectConfig, groups?: string[]) => {
      if (isPersonManager(features)) {
        return {
          id: 'ROOT_Responsibilities',
          title: '#LDS#Responsibilities',
          sorting: '30',
          items: [
            {
              id: 'QER_Team_Responsibilities',
              navigationCommands: { commands: ['teamresponsibilities'] },
              title: '#LDS#Menu Entry Responsibilities of my reports',
              sorting: '30-10',
            },
          ],
        };
      }
    });
  }
}
