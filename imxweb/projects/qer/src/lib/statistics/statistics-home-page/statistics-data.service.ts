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

import { Injectable } from '@angular/core';
import { ChartAreaData, ChartDto, HeatmapSummaryDto, StatisticsConfig } from '@imx-modules/imx-api-qer';
import { EntitySchema, TypedEntity, TypedEntityCollectionData } from '@imx-modules/imx-qbm-dbts';
import { TranslateService } from '@ngx-translate/core';
import { Chart } from 'billboard.js';
import { flatMapDeep } from 'lodash';
import { DataSourceToolbarSettings } from 'qbm';
import { BehaviorSubject, Observable, Subject, defer } from 'rxjs';
import { QerPermissionsService } from '../../admin/qer-permissions.service';
import { StatisticsApiService } from '../statistics-api.service';
import { ChartInfoTyped } from './chart-info-typed';
import { HeatmapInfoTyped } from './heatmap-info-typed';

export type GenericStatisticEntity = ChartInfoTyped | HeatmapInfoTyped;
export type GenericSummaryEntity = HeatmapSummaryDto | ChartDto;

export type StatisticsToolbarSettings = DataSourceToolbarSettings & { dataSource: TypedEntityCollectionData<GenericStatisticEntity> };

export interface GenericStatisticNode {
  leafId: string;
  leafName?: string;
  LeafNameHeading?: string;
  countBelow: number;
  isSelected?: boolean;
  entity?: GenericStatisticEntity;
  statistics: GenericStatisticEntity[];
  parent?: GenericStatisticNode;
  children: GenericStatisticNode[];
}

@Injectable({
  providedIn: 'root',
})
export class StatisticsDataService {
  public orgAreaId = 'root_shared';
  public groupedAreaId = 'root_grouped';
  public isUserAdmin: boolean;
  public isSearch$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public tree$: Subject<GenericStatisticNode[]> = new Subject();
  public sideNavExpanded$: Subject<boolean> = new Subject();
  public clearSearch$: Subject<void> = new Subject();

  public selectedNodeAncestors$: Subject<GenericStatisticNode[]> = new Subject();
  public searchStats$: Subject<GenericStatisticEntity[]> = new Subject();
  public summaryStats$: {
    [key: string]: Observable<GenericSummaryEntity>;
  } = {};

  public cachedCharts: {
    [id: string]: {
      chart: Chart;
    };
  } = {};

  public dataSource: TypedEntityCollectionData<GenericStatisticEntity> = {
    Data: [],
    totalCount: 0,
  };
  public dataSourceCopy: TypedEntityCollectionData<GenericStatisticEntity> = {
    Data: [],
    totalCount: 0,
  };

  // Favorites functionality
  public isFavSearch$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public searchFavStats$: BehaviorSubject<GenericStatisticEntity[]> = new BehaviorSubject([]);
  public favStats$: BehaviorSubject<GenericStatisticEntity[]> = new BehaviorSubject([]);

  public preferredStatisticIdsOrder: string[];

  // Org functionality
  public statisticsConfig: StatisticsConfig;
  public orgStatisticIdsOrder: string[];

  private _tree: GenericStatisticNode[];
  private _flatTree: GenericStatisticNode[];

  private _summaryStats: {
    [key: string]: GenericSummaryEntity;
  } = {};
  private _whiteListedStats: {
    favStatIds: string[];
    orgStatIds: string[];
  } = { favStatIds: [], orgStatIds: [] }; // We could have ids that can't be seen without certain modules, we will not overwrite these

  constructor(
    private statisticsApi: StatisticsApiService,
    private translate: TranslateService,
    private readonly qerPermissionService: QerPermissionsService,
  ) {}

  public getNodeByLeafId(leafId: string): GenericStatisticNode {
    const namedNode = this._flatTree.find((node) => node.leafId === leafId);
    if (!namedNode) {
      throw new Error('Could not find the leafId: ' + leafId);
    }
    return namedNode;
  }

  /**
   * We flatten the area tree to allow for lookups to be fast and easy
   */
  private flattenTree(): void {
    const getMembers = (member: GenericStatisticNode) => {
      if (!member.children || !member.children.length) {
        return member;
      }
      return [member, flatMapDeep(member.children, getMembers)];
    };
    this._flatTree = flatMapDeep(this._tree, getMembers);
  }

  public getId(entity: TypedEntity): string {
    return entity.GetEntity().GetColumn('Id').GetValue();
  }

  public sortAlphabetically(a: string, b: string): number {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  }

  public getGenericSchema(): EntitySchema {
    return {
      ...HeatmapInfoTyped.GetEntitySchema(),
      ...ChartInfoTyped.GetEntitySchema(),
    };
  }

  public clearData(): void {
    // Since the service may not destroy with behavior subjects, we have to clear out old data
    this.dataSource = {
      Data: [],
      totalCount: 0,
    };
    this.dataSourceCopy = {
      Data: [],
      totalCount: 0,
    };
  }

  public async getData(): Promise<TypedEntityCollectionData<GenericStatisticEntity>> {
    // TODO 393878: For now we have moved admin editing to a later version. This line of code enables that
    // this.isUserAdmin = await this.qerPermissionService.isPersonAdmin();
    this.isUserAdmin = false;
    this.clearData();
    await this.getFavorites();
    await this.getOrgStats();
    await this.initializeTree();
    await this.getHeatmaps();
    await this.getCharts();
    this.addToTree();

    this.sortTreeAlphabetically(this.getNodeByLeafId(this.groupedAreaId));
    this.tree$.next(this._tree);

    // Observe initital stats
    this.observeOrgStats();
    this.observeSelection([this._tree[0]]);
    this.observeFavStats();

    this.dataSourceCopy = {
      Data: this.dataSource.Data.slice(),
      totalCount: this.dataSource.totalCount,
    };

    return this.dataSource;
  }

  public observeSideNavExpanded(expanded: boolean): void {
    this.sideNavExpanded$.next(expanded);
  }

  public observeSelection(nodeAncestors: GenericStatisticNode[]): void {
    // Toss old charts, they will be regenerated if returned
    this.cachedCharts = {};
    this.selectedNodeAncestors$.next(nodeAncestors);
  }

  public observeFavStats(): void {
    // It is possible to have stats but the module not loaded. We filter out undefined here
    const favStats: GenericStatisticEntity[] = [];
    const whiteListed: string[] = [];
    this.preferredStatisticIdsOrder.forEach((id) => {
      const stat = this.dataSource.Data.find((data) => this.getId(data) === id);
      if (stat) {
        favStats.push(stat);
      } else {
        whiteListed.push(id);
      }
    });

    this._whiteListedStats.favStatIds = whiteListed;
    this.favStats$.next(favStats);
  }

  public observeOrgStats(): void {
    // It is possible to have stats but the module not loaded. We filter out undefined here
    const orgStats: GenericStatisticEntity[] = [];
    const whiteListed: string[] = [];
    this.orgStatisticIdsOrder.forEach((id) => {
      const stat = this.dataSource.Data.find((data) => this.getId(data) === id);
      if (stat) {
        orgStats.push(stat);
      } else {
        whiteListed.push(id);
      }
    });
    this._tree[0].countBelow = orgStats.length;
    this._tree[0].statistics = orgStats;
    this._whiteListedStats.orgStatIds = whiteListed;
  }

  public observeSearch(searchStats: GenericStatisticEntity[]): void {
    this.searchStats$.next(searchStats);
  }

  public observeFavSearch(searchStats: GenericStatisticEntity[]): void {
    this.searchFavStats$.next(searchStats);
  }

  public flushCharts(): void {
    Object.values(this.cachedCharts).forEach((obj) => {
      obj.chart.resize();
    });
  }

  public getSummaryStat(id: string): GenericSummaryEntity {
    return this._summaryStats[id];
  }

  public cacheSummaryStat(id: string, summaryStat: GenericSummaryEntity): void {
    this._summaryStats[id] = summaryStat;
  }

  public async initializeTree(): Promise<void> {
    // Create a tree by Area, top level is selected by default
    this._tree = this._flatTree = [
      {
        leafId: this.orgAreaId,
        leafName: await this.translate.instant('#LDS#Shared statistics'),
        LeafNameHeading: await this.translate.instant('#LDS#Heading Shared Statistics'),
        isSelected: true,
        countBelow: 0,
        children: [],
        statistics: [],
      },
      {
        leafId: this.groupedAreaId,
        leafName: await this.translate.instant('#LDS#Grouped statistics'),
        LeafNameHeading: await this.translate.instant('#LDS#Heading Grouped Statistics'),
        isSelected: false,
        countBelow: 0,
        children: [],
        statistics: [],
      },
    ];

    // Create all areas under the grouped stats
    const areas = await this.statisticsApi.getStatAreas();
    areas.forEach((area) => this.addAreaToTree(area, this.groupedAreaId));
  }

  /**
   * Helper function to recursively add an area and all of its descendants to the area tree
   * @param area - The area we want to add
   * @param parentId - The parent leafId we want to add the area under
   */
  private addAreaToTree(area: ChartAreaData, parentId: string): void {
    let thisTree = this.getNodeByLeafId(parentId);
    // We need to add this level before continuing
    thisTree.children.push({
      leafId: area.Id ?? '',
      leafName: area.Name,
      countBelow: 0,
      parent: thisTree,
      children: [],
      statistics: [],
    });
    this.flattenTree();
    if (area.ChildAreas) {
      area.ChildAreas.forEach((child) => this.addAreaToTree(child, area.Id ?? ''));
    }
  }

  /**
   * Helper function to increment the subtree and all parents by 1 as a stat is added
   * @param tree the subtree we start to increment from
   */
  private incrementCount(tree: GenericStatisticNode): void {
    tree.countBelow += 1;
    if (tree.parent) this.incrementCount(tree.parent);
  }

  public addToTree(): void {
    // Sort all data by display name first
    this.dataSource.Data.sort((a, b) => this.sortAlphabetically(a.GetEntity().GetDisplay(), b.GetEntity().GetDisplay()));

    // Create tree with data
    const topLevelTree = this.getNodeByLeafId(this.groupedAreaId);
    this.dataSource.Data.forEach((stat: GenericStatisticEntity) => {
      let area: string = stat.GetEntity().GetColumn('Area').GetValue();
      let thisTree = this.getNodeByLeafId(area);
      if (area && thisTree) {
        thisTree.statistics.push(stat);
        this.incrementCount(thisTree);
      } else {
        // Stick at top level stats
        topLevelTree.statistics.push(stat);
        topLevelTree.countBelow += 1;
      }
    });
  }

  public sortTreeAlphabetically(tree: GenericStatisticNode): void {
    // Recursively sort areas
    if (tree.children) {
      tree.children.sort((a, b) => this.sortAlphabetically(a?.leafId, b?.leafId));
      tree.children.forEach((child) => {
        this.sortTreeAlphabetically(child);
      });
    }
  }

  public async getHeatmaps(): Promise<void> {
    const allHeatmaps = await this.statisticsApi.getHeatmapList();
    const entities = allHeatmaps.map((heatmap) => {
      if (heatmap.Id != null) {
        this.summaryStats$[heatmap.Id] = defer(() => this.statisticsApi.getHeatmapSummary(heatmap.Id ?? ''));
        const isFavorite = this.preferredStatisticIdsOrder.includes(heatmap.Id);
        const isOrg = this.orgStatisticIdsOrder.includes(heatmap.Id);
        return HeatmapInfoTyped.buildEntityData(heatmap, { isFavorite, isOrg });
      }
      return HeatmapInfoTyped.buildEntityData(heatmap, { isFavorite: false, isOrg: false });
    });
    const typedEntities = HeatmapInfoTyped.buildEntities(entities);
    this.dataSource.Data.push(...typedEntities.Data);
    this.dataSource.totalCount += typedEntities.totalCount;
  }

  public async getCharts(): Promise<void> {
    const allCharts = await this.statisticsApi.getChartList();
    const entities = allCharts.map((chart) => {
      if (chart.Id) {
        this.summaryStats$[chart.Id] = defer(() => this.statisticsApi.getChart(chart.Id ?? '', { nohistory: true }));
        const isFavorite = this.preferredStatisticIdsOrder.includes(chart.Id);
        const isOrg = this.orgStatisticIdsOrder.includes(chart.Id);
        return ChartInfoTyped.buildEntityData(chart, { isFavorite, isOrg });
      }
      return ChartInfoTyped.buildEntityData(chart, { isFavorite: false, isOrg: false });
    });
    const typedEntities = ChartInfoTyped.buildEntities(entities);
    this.dataSource.Data.push(...typedEntities.Data);
    this.dataSource.totalCount += typedEntities.totalCount;
  }

  public async getFavorites(): Promise<void> {
    this.preferredStatisticIdsOrder = await this.statisticsApi.getFavorites();
  }

  public async getOrgStats(): Promise<void> {
    this.orgStatisticIdsOrder = await this.statisticsApi.getOrgStats();
  }

  public async addToFavorites(ids: string[], update: boolean = true): Promise<void> {
    ids.forEach(async (id) => {
      const stat = this.dataSource.Data.find((data) => this.getId(data) === id);
      if (stat) {
        await stat.GetEntity().GetColumn('IsFavorite').PutValue(true);
      }
    });
    if (update) {
      this.preferredStatisticIdsOrder.push(...ids);
      await this.saveFavorites();
      this.observeFavStats();
    }
  }

  public async removeFromFavorites(ids: string[], update: boolean = true): Promise<void> {
    ids.forEach(async (id) => {
      const stat = this.dataSource.Data.find((data) => this.getId(data) === id);
      if (stat) {
        await stat.GetEntity().GetColumn('IsFavorite').PutValue(false);
      }
    });
    if (update) {
      this.preferredStatisticIdsOrder = this.preferredStatisticIdsOrder.filter((id) => !ids.includes(id));
      await this.saveFavorites();
      this.observeFavStats();
    }
  }

  public async replaceFavorites(entities: GenericStatisticEntity[]): Promise<void> {
    // This function will swap exisiting favorites with incoming favorites, removing/adding as necessary
    const incomingIds: string[] = [];
    const addTo: string[] = [];
    const removeFrom: string[] = [];

    // Check which need to be added
    entities.forEach((entity) => {
      const id = this.getId(entity);
      incomingIds.push(id);
      if (!this.preferredStatisticIdsOrder.includes(id)) {
        addTo.push(id);
      }
    });

    // Check which need to be removed
    this.preferredStatisticIdsOrder.forEach((id) => {
      if (!incomingIds.includes(id)) {
        removeFrom.push(id);
      }
    });

    // Whitelist by adding these to the end. We can't preserve order since the user hasn't set this.
    incomingIds.push(...this._whiteListedStats.favStatIds);

    // Add/remove then replace and emit changes
    this.addToFavorites(addTo, false);
    this.removeFromFavorites(removeFrom, false);
    this.preferredStatisticIdsOrder = incomingIds;
    await this.saveFavorites();
    this.observeFavStats();
  }

  public async saveFavorites(): Promise<void> {
    await this.statisticsApi.postFavorites(this.preferredStatisticIdsOrder);
  }

  public async addToOrg(ids: string[], update: boolean = true): Promise<void> {
    ids.forEach(async (id) => {
      const stat = this.dataSource.Data.find((data) => this.getId(data) === id);
      if (stat) {
        await stat.GetEntity().GetColumn('IsOrg').PutValue(true);
      }
    });
    if (update) {
      this.orgStatisticIdsOrder.push(...ids);
      await this.saveOrg();
      this.observeOrgStats();
    }
  }

  public async removeFromOrg(ids: string[], update: boolean = true): Promise<void> {
    ids.forEach(async (id) => {
      const stat = this.dataSource.Data.find((data) => this.getId(data) === id);
      if (stat) {
        await stat.GetEntity().GetColumn('IsOrg').PutValue(false);
      }
    });
    if (update) {
      this.orgStatisticIdsOrder = this.orgStatisticIdsOrder.filter((id) => !ids.includes(id));
      await this.saveOrg();
      this.observeOrgStats();
    }
  }

  public async replaceOrg(entities: GenericStatisticEntity[]): Promise<void> {
    // This function will swap exisiting orgs with incoming orgs, removing/adding as necessary
    const incomingIds: string[] = [];
    const addTo: string[] = [];
    const removeFrom: string[] = [];

    // Check which need to be added
    entities.forEach((entity) => {
      const id = this.getId(entity);
      incomingIds.push(id);
      if (!this.orgStatisticIdsOrder.includes(id)) {
        addTo.push(id);
      }
    });

    // Check which need to be removed
    this.orgStatisticIdsOrder.forEach((id) => {
      if (!incomingIds.includes(id)) {
        removeFrom.push(id);
      }
    });

    // Whitelist by adding these to the end. We can't preserve order since the user hasn't set this.
    incomingIds.push(...this._whiteListedStats.orgStatIds);

    // Add/remove then replace and emit changes
    this.addToOrg(addTo, false);
    this.removeFromOrg(removeFrom, false);
    this.orgStatisticIdsOrder = incomingIds;
    await this.saveOrg();
    this.observeOrgStats();
  }

  public async saveOrg(): Promise<void> {
    // TODO 393878: Need api to save org
  }
}
