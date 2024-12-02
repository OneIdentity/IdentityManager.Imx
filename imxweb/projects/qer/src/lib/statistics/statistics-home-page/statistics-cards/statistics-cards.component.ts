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

import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { calculateSidesheetWidth, LdsReplacePipe } from 'qbm';
import { Subscription } from 'rxjs';
import { StatisticsConstantsService } from '../statistics-constants.service';
import { GenericStatisticEntity, GenericStatisticNode, StatisticsDataService } from '../statistics-data.service';
import { StatisticsOrderingSidesheetComponent } from '../statistics-ordering-sidesheet/statistics-ordering-sidesheet.component';

@Component({
  selector: 'imx-statistics-cards',
  templateUrl: './statistics-cards.component.html',
  styleUrls: ['./statistics-cards.component.scss'],
})
export class StatisticsCardsComponent implements OnInit, OnDestroy {
  @ViewChild('cardsWrapper', { read: ElementRef }) public cardsWrapper: ElementRef<HTMLElement>;

  public isSearch: boolean;
  public searchStats: GenericStatisticEntity[];
  public selectedNode: GenericStatisticNode;
  public selectedNodeAncestors: GenericStatisticNode[];

  private subscriptions$: Subscription[] = [];

  constructor(
    public constantService: StatisticsConstantsService,
    private dataService: StatisticsDataService,
    private replacePipe: LdsReplacePipe,
    private translateService: TranslateService,
    private sidesheetService: EuiSidesheetService,
    private loadingService: EuiLoadingService,
  ) {}

  public get showAncestors(): boolean {
    return this.selectedNodeAncestors && this.selectedNodeAncestors.length > 0;
  }

  public get isUserAdmin(): boolean {
    return this.dataService.isUserAdmin;
  }

  public get hasData(): boolean {
    return !!this.selectedNode?.countBelow && this.selectedNode?.countBelow > 0;
  }

  public get isOrg(): boolean {
    return this.selectedNode && this.selectedNode.leafId === this.dataService.orgAreaId;
  }

  public get isGrouped(): boolean {
    return this.selectedNode && this.selectedNode.leafId === this.dataService.groupedAreaId;
  }

  public get searchHasData(): boolean {
    return this.searchStats && this.searchStats.length > 0;
  }

  public ngOnInit(): void {
    this.subscriptions$.push(
      this.dataService.selectedNodeAncestors$.subscribe((nodeAncestors) => {
        // Scroll to top of grid, and observe new selection
        this.cardsWrapper?.nativeElement?.children[0]?.scrollIntoView({ behavior: 'auto', block: 'start' });
        this.selectedNodeAncestors = nodeAncestors;
        this.selectedNode = nodeAncestors[nodeAncestors.length - 1];
      }),
    );
    this.subscriptions$.push(
      this.dataService.searchStats$.subscribe((stats) => {
        // Scroll to top of grid, and observe search
        this.cardsWrapper?.nativeElement?.children[0]?.scrollIntoView({ behavior: 'auto', block: 'start' });
        this.searchStats = stats;
      }),
    );
    this.subscriptions$.push(
      this.dataService.isSearch$.subscribe((isSearch) => {
        this.isSearch = isSearch;
      }),
    );
  }

  public getnStatsText(n: number | undefined): string {
    const rawString = this.constantService.nStatsText.slice();
    return this.replacePipe.transform(rawString, n?.toString() || '0');
  }

  public selectArea(node: GenericStatisticNode): void {
    this.dataService.observeSelection([...this.selectedNodeAncestors, node]);
  }

  public selectAncestor(index: number): void {
    this.dataService.observeSelection(this.selectedNodeAncestors.slice(0, index + 1));
  }

  public ngOnDestroy(): void {
    this.subscriptions$.forEach((sub) => sub.unsubscribe());
  }
  // TODO 454155: Add translations
  public async openOrgSideSheet(): Promise<void> {
    const response: GenericStatisticEntity[] | null = await this.sidesheetService
      .open(StatisticsOrderingSidesheetComponent, {
        title: await this.translateService.get('???Manage shared statistics???').toPromise(),
        icon: 'network',
        padding: '0px',
        width: calculateSidesheetWidth(1100, 0.7),
        disableClose: true,
        testId: 'statistics-organizational-sidesheet',
        data: {
          orderStatIds: !!this.selectedNode.statistics ? this.selectedNode.statistics.map((stat) => this.dataService.getId(stat)) : [],
        },
      })
      .afterClosed()
      .toPromise();
    if (response) {
      this.loadingService.show();
      try {
        await this.dataService.replaceOrg(response);
      } finally {
        this.loadingService.hide();
      }
    }
  }
}
