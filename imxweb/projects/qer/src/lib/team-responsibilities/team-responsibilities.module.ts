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
import { TeamResponsibilitiesComponent } from './team-responsibilities.component';
import { RouterModule, Routes } from '@angular/router';
import { ClassloggerService, DataSourceToolbarModule, DataTableModule, ExtService, HELP_CONTEXTUAL, HelpContextualComponent, HelpContextualModule, MenuItem, MenuService, RouteGuardService } from 'qbm';
import { ManagerGuardService } from '../guards/manager-guard.service';
import { isPersonManager } from '../admin/qer-permissions-helper';
import { TeamResponsibilitiesService } from './team-responsibilities.service';
import { TranslateModule } from '@ngx-translate/core';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { TeamResponsibilitySidesheetComponent } from './team-responsibility-sidesheet/team-responsibility-sidesheet.component';
import { TeamResponsibilityTileComponent } from './team-responsibility-tile/team-responsibility-tile.component'
import { TilesModule } from '../tiles/tiles.module';

const routes: Routes = [
  {
    path: 'teamresponsibilities',
    component: TeamResponsibilitiesComponent,
    canActivate: [RouteGuardService, ManagerGuardService],
    resolve: [RouteGuardService],
    data:{
      contextId: HELP_CONTEXTUAL.TeamResponsibilities
    }
  }
];


@NgModule({
  declarations: [
    TeamResponsibilitiesComponent,
    TeamResponsibilitySidesheetComponent,
    TeamResponsibilityTileComponent
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
    HelpContextualModule
  ],
  providers:[
    TeamResponsibilitiesService
  ]
})
export class TeamResponsibilitiesModule {
  constructor(
    private readonly menuService: MenuService,
    private readonly extService: ExtService,
    logger: ClassloggerService
  ) {
    logger.info(this, '▶️ TeamResponsibilitiesModule loaded');
    this.setupMenu();
    this.extService.register('Dashboard-SmallTiles', { instance:TeamResponsibilityTileComponent});
  }

  private async setupMenu(): Promise<void> {
    this.menuService.addMenuFactories(
      (preProps: string[], groups: string[]) => {

        const items: MenuItem[] = [];
        if (isPersonManager(groups)) {
          return {
            id: 'ROOT_Responsibilities',
            title: '#LDS#Responsibilities',
            sorting: '30',
            items: [{
              id: 'QER_Team_Responsibilities',
              navigationCommands: { commands: ['teamresponsibilities'] },
              title: '#LDS#Menu Entry Responsibilities of my reports',
              sorting: '30-10',
            }]
          };
        }
      },
    );
  }
}
