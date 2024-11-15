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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { calculateSidesheetWidth, HELP_CONTEXTUAL, HelpContextualComponent, HelpContextualService } from 'qbm';
import { Subscription } from 'rxjs';
import { GenericStatisticEntity, StatisticsDataService } from '../statistics-data.service';
import { StatisticsOrderingSidesheetComponent } from '../statistics-ordering-sidesheet/statistics-ordering-sidesheet.component';

@Component({
  selector: 'imx-favorites-tab',
  templateUrl: './favorites-tab.component.html',
  styleUrls: ['./favorites-tab.component.scss'],
})
export class FavoritesTabComponent implements OnInit, OnDestroy {
  public isSearch: boolean;
  public favStats: GenericStatisticEntity[];
  public searchStats: GenericStatisticEntity[];

  private subscriptions$: Subscription[] = [];

  constructor(
    public dataService: StatisticsDataService,
    private loadingService: EuiLoadingService,
    private sidesheetService: EuiSidesheetService,
    private translateService: TranslateService,
    private helpService: HelpContextualService,
  ) {}

  get hasData(): boolean {
    return this.favStats && this.favStats.length > 0;
  }

  get searchHasData(): boolean {
    return this.searchStats && this.searchStats.length > 0;
  }

  public ngOnInit(): void {
    this.subscriptions$.push(
      this.dataService.favStats$.subscribe((favStats) => {
        this.favStats = favStats;
      }),
    );

    this.subscriptions$.push(
      this.dataService.isFavSearch$.subscribe((isSearch) => {
        this.isSearch = isSearch;
      }),
    );

    this.subscriptions$.push(
      this.dataService.searchFavStats$.subscribe((searchStats) => {
        this.searchStats = searchStats;
      }),
    );
  }

  public ngOnDestroy(): void {
    this.subscriptions$.forEach((sub) => sub.unsubscribe());
  }

  public async openFavoriteSideSheet(): Promise<void> {
    this.helpService.setHelpContextId(HELP_CONTEXTUAL.StatisticsFavoritesOrdering);
    const response: GenericStatisticEntity[] | null = await this.sidesheetService
      .open(StatisticsOrderingSidesheetComponent, {
        title: await this.translateService.get('#LDS#Heading Manage Favorite Statistics').toPromise(),
        icon: 'star',
        padding: '0px',
        width: calculateSidesheetWidth(1100, 0.7),
        headerComponent: HelpContextualComponent,
        disableClose: true,
        testId: 'statistics-favorites-sidesheet',
        data: {
          orderStatIds: this.favStats.map((stat) => this.dataService.getId(stat)),
        },
      })
      .afterClosed()
      .toPromise();
    if (response) {
      this.loadingService.show();
      try {
        await this.dataService.replaceFavorites(response);
      } finally {
        this.loadingService.hide();
      }
    }
  }
}
