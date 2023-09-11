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

import { Component, ElementRef, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { EuiLoadingService } from '@elemental-ui/core';
import { DataSourceToolbarComponent, DataSourceToolbarSettings } from 'qbm';
import { StatisticsConstantsService } from './statistics-constants.service';
import { StatisticsDataService, StatisticsToolbarSettings } from './statistics-data.service';
@Component({
  selector: 'imx-statistics-home-page',
  templateUrl: './statistics-home-page.component.html',
  styleUrls: ['./statistics-home-page.component.scss']
})
export class StatisticsHomePageComponent implements OnInit, OnDestroy {
  @ViewChild('allStatsDST') public allStatsDST: DataSourceToolbarComponent;
  @ViewChild('favStatsDST') public favStatsDST: DataSourceToolbarComponent;

  public dstSettings: DataSourceToolbarSettings;

  // UI State
  public showFavorites = false;
  public tabIndex = 0;
  public allStatsSettings: DataSourceToolbarSettings;
  public myFavoritesSettings: DataSourceToolbarSettings;

  private subscriptions$: Subscription[] = [];

  constructor(
    public constantService: StatisticsConstantsService,
    private dataService: StatisticsDataService,
    private loader: EuiLoadingService,
    private hostElement: ElementRef,
    ) { }

  public async ngOnInit(): Promise<void> {
    // Subscribe to search clear
    this.subscriptions$.push(
      this.dataService.clearSearch$.subscribe(() => {
        this.allStatsDST.searchControl.setValue('');
        this.allStatsDST.searchTerms = [];
      })
    );

    // Subscribe to fav data
    this.subscriptions$.push(
      this.dataService.favStats$.subscribe(favStats => {
        this.myFavoritesSettings = {
          dataSource: {
            Data: favStats,
            totalCount: favStats.length
          },
          entitySchema: this.dataService.getGenericSchema(),
          navigationState: {
            PageSize: 500,
            StartIndex: 0
          }
        };
      })
    )

    // Subscribe to resize charts when window size changes
    this.subscriptions$.push(
      fromEvent(window, 'resize').subscribe(() => this.dataService.flushCharts())
    );

    this.loader.show();
    await this.setConstants();
    try {
      const dataSource = await this.dataService.getData();
      this.allStatsSettings = {
        dataSource: dataSource,
        entitySchema: this.dataService.getGenericSchema(),
        navigationState: {
          PageSize: 500,
          StartIndex: 0
        }
      };
    } finally {
      this.loader.hide();
    }
  }

  public ngOnDestroy(): void {
    this.subscriptions$.forEach(sub => sub.unsubscribe());
  }

  public async setConstants(): Promise<void> {
    this.constantService.getAndStoreColor(this.hostElement);
    await this.constantService.getAndStoreTranslatedText();
  }

  public onAllStatsSettingsChanged(settings: StatisticsToolbarSettings): void {
    const isSearch = settings.navigationState.search?.length > 0 || this.allStatsDST.searchTerms.length > 0;
    const searchStats = isSearch ? settings.dataSource.Data : [];
    // Close sidenav when searching
    if (isSearch) {
      this.dataService.observeSideNavExpanded(false);
    }

    this.dataService.isSearch$.next(isSearch);
    this.dataService.observeSearch(searchStats);
  }

  public onMyFavoritesSettingsChanged(settings: StatisticsToolbarSettings): void {
    const isSearch = settings.navigationState.search?.length > 0 || this.favStatsDST.searchTerms.length > 0;;
    const searchStats = isSearch ? settings.dataSource.Data : [];
    this.dataService.isFavSearch$.next(isSearch);
    this.dataService.observeFavSearch(searchStats);
  }

  public onTabChange(change: MatTabChangeEvent): void {
    this.tabIndex = change.index;
    this.dataService.flushCharts();
  }

}
