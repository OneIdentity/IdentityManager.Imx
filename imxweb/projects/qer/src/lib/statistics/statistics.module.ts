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
import { RouterModule, Routes } from '@angular/router';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ScrollingModule } from '@angular/cdk/scrolling';
import {
  ClassloggerService,
  MenuService,
  RouteGuardService,
  DataSourceToolbarModule,
  InfoModalDialogModule,
  DataTableModule,
  CdrModule,
  SidenavTreeModule,
  MenuItem,
  LdsReplaceModule,
  DateModule,
  HelpContextualModule,
  HELP_CONTEXTUAL,
  TempBillboardModule,
  ExtModule,
} from 'qbm';

import { TranslateModule } from '@ngx-translate/core';
import { TreemapChartComponent } from './heatmaps/treemap-chart/treemap-chart.component';
import { HeatmapChartComponent } from './heatmaps/heatmap-chart/heatmap-chart.component';
import { BlockDetailSidesheetComponent } from './heatmaps/block-detail-sidesheet/block-detail-sidesheet.component';
import { DiscreteLegendComponent } from './heatmaps/discrete-legend/discrete-legend.component';
import { HeatmapSidesheetComponent } from './heatmaps/heatmap-sidesheet/heatmap-sidesheet.component';
import { StatisticsHomePageComponent } from './statistics-home-page/statistics-home-page.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { StatisticsTreeComponent } from './statistics-home-page/statistics-tree/statistics-tree.component';
import { StatisticsCardsComponent } from './statistics-home-page/statistics-cards/statistics-cards.component';
import { StatisticsCardsVisualsComponent } from './statistics-home-page/statistics-cards-visuals/statistics-cards-visuals.component';
import { HeatmapVisualComponent } from './statistics-home-page/statistics-cards-visuals/heatmap-visual/heatmap-visual.component';
import { PointStatVisualComponent } from './charts/chart-tile/point-stat-visual/point-stat-visual.component';
import { FavoritesTabComponent } from './statistics-home-page/favorites-tab/favorites-tab.component';
import { ChartsSidesheetComponent } from './charts/charts-sidesheet/charts-sidesheet.component';
import { StatisticsOrderingSidesheetComponent } from './statistics-home-page/statistics-ordering-sidesheet/statistics-ordering-sidesheet.component';
import { StatisticsOrderingSidesheetDialogComponent } from './statistics-home-page/statistics-ordering-sidesheet/statistics-ordering-sidesheet-dialog/statistics-ordering-sidesheet-dialog.component';
import { ChartTableComponent } from './charts/chart-table/chart-table.component';
import { StatisticsForObjectsComponent } from './statistics-for-objects/statistics-for-objects.component';
import { ChartTileComponent } from './charts/chart-tile/chart-tile.component';
import { HeatmapTileComponent } from './heatmaps/heatmap-tile/heatmap-tile.component';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { StatisticsGuardService } from '../guards/statistics-guard.service';
import { isStatistics } from '../admin/qer-permissions-helper';

const routes: Routes = [
  {
    path: 'statistics',
    component: StatisticsHomePageComponent,
    canActivate: [RouteGuardService, StatisticsGuardService],
    resolve: [RouteGuardService],
    data: {
      contextId: HELP_CONTEXTUAL.StatisticsPage,
    },
  },
];

@NgModule({
  declarations: [
    HeatmapSidesheetComponent,
    TreemapChartComponent,
    HeatmapChartComponent,
    BlockDetailSidesheetComponent,
    DiscreteLegendComponent,
    StatisticsHomePageComponent,
    StatisticsTreeComponent,
    StatisticsCardsComponent,
    StatisticsCardsVisualsComponent,
    HeatmapVisualComponent,
    PointStatVisualComponent,
    FavoritesTabComponent,
    StatisticsOrderingSidesheetComponent,
    StatisticsOrderingSidesheetDialogComponent,
    ChartsSidesheetComponent,
    ChartTableComponent,
    StatisticsForObjectsComponent,
    ChartTileComponent,
    HeatmapTileComponent,
  ],
  imports: [
    CommonModule,
    CdrModule,
    EuiCoreModule,
    EuiMaterialModule,
    TranslateModule,
    DataSourceToolbarModule,
    DataTableModule,
    InfoModalDialogModule,
    MatExpansionModule,
    SidenavTreeModule,
    DragDropModule,
    ScrollingModule,
    LdsReplaceModule,
    DateModule,
    FormsModule,
    MatCheckboxModule,
    RouterModule.forChild(routes),
    HelpContextualModule,
    TempBillboardModule,
    ExtModule
  ],
  exports: [StatisticsForObjectsComponent],
})
export class StatisticsModule {
  constructor(private readonly menuService: MenuService, private readonly logger: ClassloggerService) {
    this.logger.info(this, '▶️ Statistics Module loaded');
    this.setupMenu();
  }

  /** This method defines the menu structure for the portal. */
  private setupMenu(): void {
    this.menuService.addMenuFactories((preProps: string[], features: string[]) => {
      if(isStatistics(features)){
        const menu: MenuItem = {
          id: 'ROOT_Statistics',
          title: '#LDS#Statistics',
          sorting: '50',
          route: routes[0].path,
        };
        return menu;
      }
    });
  }
}
