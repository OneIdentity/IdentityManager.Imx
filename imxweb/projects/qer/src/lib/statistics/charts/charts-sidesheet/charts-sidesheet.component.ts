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

import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { Chart, ChartOptions } from 'billboard.js';
import { ChartDto, ChartInfoDto } from 'imx-api-qer';
import { TypedEntityCollectionData } from 'imx-qbm-dbts';
import { CdrFactoryService, ColumnDependentReference, DataSourceToolbarSettings } from 'qbm';
import { fromEvent, Subscription } from 'rxjs';
import { PointStatTyped } from '../chart-tile/point-stat-visual/point-stat-typed';
import { StatisticsSidesheetResponse } from '../../statistics-home-page/statistics-cards-visuals/statistics-cards-visuals.component';
import { ChartDataTyped } from '../chart-data-typed';
import { isBoolean } from 'lodash';
import { ChartInfoTyped } from '../../statistics-home-page/chart-info-typed';

@Component({
  selector: 'imx-charts-sidesheet',
  templateUrl: './charts-sidesheet.component.html',
  styleUrls: ['./charts-sidesheet.component.scss'],
})
export class ChartsSidesheetComponent implements OnInit, OnDestroy {
  @ViewChild('chartWrapper', { read: ElementRef }) public chartWrapper: ElementRef<HTMLElement>;
  public isLoading = true;
  public chart: Chart;
  public chartOptions: ChartOptions;
  public cdrList: ColumnDependentReference[];
  public readonly referrer: ChartInfoTyped;

  public dstSettings: DataSourceToolbarSettings;

  private subscriptions$: Subscription[] = [];

  constructor(
    @Inject(EUI_SIDESHEET_DATA)
    public data: {
      chartInfo: ChartInfoTyped;
      chartData: ChartDto;
      tableData: TypedEntityCollectionData<ChartDataTyped>;
      hasUniqueObjectDisplay: boolean;
      chartOptions: ChartOptions;
      icon: string;
      dataHasNonZero: boolean;
      pointStatStatus?: PointStatTyped;
      isFavorite?: boolean;
      isOrg?: boolean;
      isUserAdmin?: boolean;
    },
    private cdrService: CdrFactoryService,
    private sidesheetRef: EuiSidesheetRef
  ) {
    this.referrer = data.chartInfo;
  }

  public get isPoint(): boolean {
    return !!this.data?.pointStatStatus;
  }

  public get canToggle(): boolean {
    return isBoolean(this.data?.isFavorite) && isBoolean(this.data?.isOrg);
  }

  public ngOnInit(): void {
    if (this.canToggle) {
      this.subscriptions$.push(
        this.sidesheetRef.closeClicked().subscribe(() => {
          const response: StatisticsSidesheetResponse = {
            isFavorite: this.data?.isFavorite,
            isOrg: this.data?.isOrg,
          };
          this.sidesheetRef.close(response);
        })
      );
    }

    if (this.data?.pointStatStatus) {
      this.cdrList = this.cdrService.buildCdrFromColumnList(this.data.pointStatStatus.GetEntity(), ['Trend', 'Value', 'Description'], true);
    }

    if (this.sidesheetRef?.componentInstance) {
      this.subscriptions$.push(
        this.sidesheetRef.componentInstance.onOpen().subscribe(() => {
          if (this.chart) {
            this.chart.resize({
              height: this.chartWrapper.nativeElement.offsetHeight,
              width: this.chartWrapper.nativeElement.offsetWidth,
            });
            this.isLoading = false;
          }
        })
      );
    }

    this.subscriptions$.push(
      fromEvent(window, 'resize').subscribe(() => {
        if (this.chart) {
          this.chart.resize({
            height: this.chartWrapper.nativeElement.offsetHeight,
            width: this.chartWrapper.nativeElement.offsetWidth,
          });
        }
      })
    );
  }

  public get isZoomable(): boolean {
    return this.data.chartOptions?.zoom?.enabled;
  }

  public get showChart(): boolean {
    return this.isPoint ? this.data.chartData.HistoryLength > 0 : this.data.dataHasNonZero;
  }

  public get pointClass(): string {
    return this.isPoint ? this.data.pointStatStatus.StatusClass.value : '';
  }

  public get pointIcon(): string {
    return this.isPoint ? this.data.pointStatStatus.StatusIconString.value : '';
  }

  public ngOnDestroy(): void {
    this.subscriptions$.forEach((sub) => sub.unsubscribe());
  }

  public saveChart(chart: Chart): void {
    this.chart = chart;
  }

  public toggleFavorites(): void {
    this.data.isFavorite = !this.data.isFavorite;
  }

  public toggleOrg(): void {
    this.data.isOrg = !this.data.isOrg;
  }
}
