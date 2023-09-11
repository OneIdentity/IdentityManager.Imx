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
import { EntitySchema } from 'imx-qbm-dbts';
import { CdrFactoryService, ColumnDependentReference, ShortDatePipe } from 'qbm';
import { Block } from '../block-properties.interface';
import { bar, ChartOptions, Chart } from 'billboard.js';
import { TranslateService } from '@ngx-translate/core';
import { fromEvent, Subscription } from 'rxjs';
import { HeatmapDataTyped } from '../heatmap-data-typed';

@Component({
  selector: 'imx-block-detail-sidesheet',
  templateUrl: './block-detail-sidesheet.component.html',
  styleUrls: ['./block-detail-sidesheet.component.scss'],
})
export class BlockDetailSidesheetComponent implements OnInit, OnDestroy {
  @ViewChild('chartWrapper', { read: ElementRef }) public chartWrapper: ElementRef<HTMLElement>;

  public topCdrList: ColumnDependentReference[];
  public bottomCdrList: ColumnDependentReference[];

  public isLoading = true;
  public chart: Chart;
  public chartOptions: ChartOptions;
  public chartTooltip: string;

  private subscriptions$: Subscription[] = [];

  constructor(
    @Inject(EUI_SIDESHEET_DATA)
    public data: {
      block: Block;
      historyDates: Date[];
    },
    private cdrService: CdrFactoryService,
    private translate: TranslateService,
    private sidesheetRef: EuiSidesheetRef,
    private shortDate: ShortDatePipe
  ) {}

  public get schema(): EntitySchema {
    return HeatmapDataTyped.GetEntitySchema();
  }

  public get hasHistory(): boolean {
    return this.data.block.historyValues.length > 0;
  }

  public async ngOnInit(): Promise<void> {
    if (this.data.block.object) {
      const entity = this.data.block.object.GetEntity();
      this.topCdrList = this.cdrService.buildCdrFromColumnList(entity, ['Ancestors'], true);
      this.bottomCdrList = this.cdrService.buildCdrFromColumnList(entity, ['State', 'Value', 'ValueZ'], true);
    }
    this.chartTooltip = await this.translate.get('#LDS#Value at this time').toPromise();
    this.setupChart();

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

    // Subscribe to resize charts when window size changes
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

  public ngOnDestroy(): void {
    this.subscriptions$.forEach((sub) => sub.unsubscribe());
  }

  public setupChart(): void {
    if (!this.hasHistory) {
      // There is no history, exit early
      return;
    }

    const colors = [];
    const values = [];
    const datesFormatted: string[] = [];
    // Trim undefined values
    this.data.block.historyValues.forEach((value, index) => {
      if (Number.isFinite(value)) {
        values.push(value);
        colors.push(this.data.block.historyColors[index]);
        datesFormatted.push(this.shortDate.transform(this.data.historyDates[index].toString()));
      }
    });

    if (values.length === 0) {
      // No values were found to be finite, exit early
      return;
    }

    this.chartOptions = {
      data: {
        x: 'x',
        type: bar(),
        columns: [
          ['x', ...datesFormatted],
          [this.chartTooltip, ...values],
        ],
        color: (color, d) => {
          return colors[d.index];
        },
      },
      bar: {
        width: {
          ratio: 0.5,
        },
      },
      axis: {
        x: {
          type: 'category',
        },
        y: {
          show: false,
        },
      },
      legend: {
        hide: true,
      },
      resize: {
        auto: true,
      },
      size: {
        height: this.chartWrapper.nativeElement.offsetHeight,
        width: this.chartWrapper.nativeElement.offsetWidth,
      },
      tooltip: {
        format: {
          value: (value) => value.toLocaleString(undefined, { maximumFractionDigits: 2 }),
        },
      },
    };
  }

  public saveChart(chart: Chart): void {
    this.chart = chart;
  }
}
