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
 * Copyright 2025 One Identity LLC.
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
import { ChartData, ChartDto } from '@imx-modules/imx-api-qbm';
import { ChartOptions, bar, donut, gauge, line, zoom } from 'billboard.js';
import { chain, uniqBy } from 'lodash';
import { ShortDatePipe } from '../../date/short-date.pipe';
import { handleDecimal } from '../helper-functions';
import { StatisticsConstantsService } from '../statistics-home-page/statistics-constants.service';
import { isAllIntegers } from './chart-helper-functions';

export interface ChartNamesValues {
  names?: string[];
  values?: number[];
  groupedData?: (string | number)[][];
}

export interface DisplayOptions {
  height?: number;
  width?: number;
  dataLimit?: number;
  pointLimit?: number;
  nXTicks?: number;
  enableZoom?: boolean;
  hasUniqueObjectDisplay?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class StatisticsChartHandlerService {
  constructor(
    private constantsService: StatisticsConstantsService,
    private shortDate: ShortDatePipe,
  ) { }

  public dataHasNonZero(chart: ChartDto): boolean {
    // This will check the data to see if we have all 0 values and should display text instead of a chart
    return chart.Data?.map((data) => (data.Points?.[0]?.Value ?? 0) > 0)?.some((value) => value) ?? false;
  }

  public getNamesValues(data: ChartData[], options?: { includeZero: boolean }): ChartNamesValues {
    const names: string[] = [];
    const values: number[] = [];
    data.forEach((datum) => {
      const value = datum?.Points?.[0]?.Value ?? 0;
      if (value > 0 || options?.includeZero) {
        names.push(datum?.Name ?? '');
        values.push(value);
      }
    });

    return { names, values };
  }

  public getGroupedNamesValues(data: ChartData[], options?: { includeZero: boolean }): ChartNamesValues {
    const uniqueNames = uniqBy(data, (datum) => datum.Name).map((datum) => datum.Name ?? '');
    const groupedData: { groupName: string | undefined; data: ChartData[] }[] = chain(data)
      .groupBy((datum) => datum.ObjectDisplay)
      .map((value, key) => ({ groupName: key, data: value }))
      .value();

    // Convert grouped to array with null entries
    const nNames = uniqueNames.length;
    const outputData: (string | number)[][] = [['x', ...uniqueNames]];
    groupedData.forEach((group) => {
      const row: number[] = [...Array(nNames).fill(null)];
      const rowName: string = group.groupName === 'undefined' ? this.constantsService.defaultDataText : group.groupName ?? '';
      group.data.forEach((datum: ChartData) => {
        const index = uniqueNames.findIndex((name) => name === datum.Name);
        row[index] = !!datum?.Points?.length ? datum.Points[0].Value : 0;
      });
      outputData.push([rowName, ...row]);
    });
    outputData[0] = outputData[0].map((name: string) => (name.length > 40 ? `${name.substring(0, 40)}...` : name));
    return { groupedData: outputData };
  }

  public getOtherValue(data: ChartData[], chartNamesValues: ChartNamesValues): void {
    const otherValue = data.map((datum) => (!!datum?.Points?.length ? datum.Points[0].Value : 0)).reduce((a, b) => a + b, 0);
    if (otherValue === 0) {
      return;
    }
    if (chartNamesValues.groupedData) {
      // Add to the x column which is index 0
      chartNamesValues.groupedData[0].push(this.constantsService.otherDataText);
      const nBars = chartNamesValues.groupedData[0].length;
      const row = Array(nBars).fill(null);
      row[0] = this.constantsService.otherDataText;
      row[nBars - 1] = otherValue;
      chartNamesValues.groupedData.push(row);
    } else {
      chartNamesValues.names?.push(this.constantsService.otherDataText);
      chartNamesValues.values?.push(otherValue);
    }
  }

  public convertNamesValuesToColumns(data: ChartNamesValues): (string | number)[][] {
    const names = data.names ?? [];
    const values = data.values ?? [];
    const columns: (string | number)[][] = [];
    names.forEach((name, index) => {
      columns.push([name, values[index]]);
    });
    return columns;
  }

  public hasUniqueObjectDisplay(data: ChartData[]): boolean {
    return data
      .map((datum) => {
        return datum?.ObjectDisplay && datum.ObjectDisplay != datum.Name;
      })
      .some((val) => val);
  }

  public getBarData(chart: ChartDto, displayOptions: DisplayOptions): ChartOptions {
    // If we have a data limit, we will take limit - 1 raw values, then combine the rest into a single bar
    const dataLength = chart.Data?.length ?? 0;
    const limitLessThanData = displayOptions.dataLimit && displayOptions.dataLimit < dataLength;
    const cutoff = limitLessThanData ? (displayOptions.dataLimit ?? 0) - 1 : dataLength;

    let chartValues: ChartNamesValues;
    let columns: (string | number)[][];
    if (displayOptions?.hasUniqueObjectDisplay) {
      chartValues = this.getGroupedNamesValues(chart.Data?.slice(0, cutoff) || [], { includeZero: true });
    } else {
      chartValues = this.getNamesValues(chart.Data?.slice(0, cutoff) || [], { includeZero: true });
    }
    if (limitLessThanData) {
      this.getOtherValue(chart.Data?.slice(cutoff) || [], chartValues);
    }

    if (chartValues.groupedData) {
      columns = chartValues.groupedData;
    } else {
      columns = [
        ['x', ...(chartValues.names || [])],
        [this.constantsService.defaultDataText, ...(chartValues.values || [])],
      ];
    }
    return {
      data: {
        x: 'x',
        type: bar(),
        columns,
        empty: {
          label: {
            text: this.constantsService.noDataText,
          },
        },
      },
      bar: {
        width: {
          ratio: 0.5,
        },
        zerobased: true,
      },
      axis: {
        x: {
          type: 'category',
        },
        y: {
          show: false,
        },
      },
      resize: {
        auto: true,
      },
      legend: {
        hide: true,
      },
      interaction: {
        inputType: {
          mouse: true,
          touch: false,
        },
      },
      padding: {
        bottom: -1,
        top: 0,
        left: 0,
        right: 0,
      },
    };
  }

  public getPieData(chart: ChartDto, displayOptions: DisplayOptions): ChartOptions {
    // If we have a data limit, we will take limit - 1 raw values, then combine the rest into a single bar
    const dataLength = chart.Data?.length ?? 0;
    const limitLessThanData = displayOptions.dataLimit && displayOptions.dataLimit < dataLength;
    let chartNamesValues: ChartNamesValues;
    if (limitLessThanData) {
      // We will sort by highest value, and sum past the data limit
      chart.Data?.sort((a, b) => (a.Points?.[0]?.Value ?? 0) - (b.Points?.[0]?.Value ?? 0)).reverse();
      chartNamesValues = this.getNamesValues(chart.Data?.slice(0, (displayOptions.dataLimit ?? 0) - 1) || []);
      this.getOtherValue(chart.Data?.slice((displayOptions.dataLimit ?? 0) - 1) ?? [], chartNamesValues);
    } else {
      chartNamesValues = this.getNamesValues(chart.Data ?? []);
    }
    const columns = this.convertNamesValuesToColumns(chartNamesValues);
    return {
      data: {
        type: donut(),
        columns,
        empty: {
          label: {
            text: this.constantsService.noDataText,
          },
        },
      },
      donut: {
        padAngle: 0.05,
        expand: {
          rate: 1.005,
        },
        label: {
          show: false,
        },
      },
      resize: {
        auto: true,
      },
      legend: {
        // Show legend but disable it turning off pieces
        show: true,
        item: {
          onclick: () => false,
        },
      },
      interaction: {
        inputType: {
          mouse: true,
          touch: false,
        },
      },
      padding: {
        bottom: 1,
        top: 0,
        left: 0,
        right: 0,
      },
    };
  }

  public getLineData(chart: ChartDto, displayOptions: DisplayOptions): ChartOptions {
    const nDataStreams = chart.Data?.length ?? 0;
    const nTimeLength = chart.Data?.[0]?.Points?.length ?? 0;
    const cutoff = displayOptions.dataLimit && displayOptions.dataLimit < nDataStreams ? displayOptions.dataLimit : nDataStreams;
    const timecutoff = displayOptions.pointLimit && displayOptions.pointLimit < nTimeLength ? displayOptions.pointLimit : nTimeLength;

    const slicedData = chart.Data?.slice(0, cutoff);

    // Build raw columns with possible `undefined`
    const timeLabels = slicedData?.[0]?.Points?.slice(0, timecutoff).map((d) => d.Date) ?? [];
    const valueColumns = slicedData?.map((data) => {
      return {
        name: data.Name ?? '',
        values: data.Points?.slice(0, timecutoff).map((d) => handleDecimal(d.Value)) ?? []
      };
    }) ?? [];

    // Now filter out rows where *any* value is undefined
    const filteredTimes: Date[] = [];
    const filteredValues: number[][] = valueColumns.map(() => []);

    // iterate row-wise
    for (let i = 0; i < timeLabels.length; i++) {
      const rowValues = valueColumns.map(col => col.values[i]);
      if (rowValues.every(v => v !== undefined)) {
        filteredTimes.push(timeLabels[i]);
        rowValues.forEach((v, colIdx) => {
          filteredValues[colIdx].push(v);
        });
      }
    }

    // Construct final `columns` array
    const columns: (string | number | Date)[][] = [
      ['x', ...filteredTimes],
      ...valueColumns.map((val, index) => [val.name, ...filteredValues[index]])
    ];

    return {
      data: {
        x: 'x',
        type: line(),
        columns,
        empty: {
          label: {
            text: this.constantsService.noDataText,
          },
        },
      },
      axis: {
        x: {
          type: 'timeseries',
          tick: {
            format: (x: Date) => this.shortDate.transform(x.toString()),
            count: displayOptions?.nXTicks,
            culling: {
              max: Math.floor(timecutoff / 2),
            },
          },
        },
        y: {
          tick: {
            // Here we cull for integers if all the data is integers, otherwise set a max of 5 lines to show
            culling: isAllIntegers(columns) ? true : { max: 5 },
          },
        },
      },
      zoom: {
        enabled: displayOptions?.enableZoom ? zoom() : false,
        type: 'drag',
        resetButton: {
          text: this.constantsService.resetZoomText,
        },
      },
      resize: {
        auto: true,
      },
      legend: {
        show: false,
      },
      interaction: {
        inputType: {
          mouse: true,
          touch: false,
        },
      },
    };
  }

  public getGaugeData(chart: ChartDto): ChartOptions {
    const value = chart.Data?.[0]?.Points?.[0]?.Value ?? 0;
    const allValues = chart.Data?.[0]?.Points?.map((point) => point?.Value) ?? [];
    const min = 0; // TODO: Is there a way to determine from the data and not hardcode?
    const max = Math.max(...allValues);
    let pattern: string[];
    let values: number[] | undefined;

    // Determine the color pattern based on the thresholds
    const isThresholdsEqual = chart.ErrorThreshold === chart.WarningThreshold;
    const isErrorThroutghZero = chart.ErrorThreshold === 0;
    const isWarnThroutghZero = chart.WarningThreshold === 0;
    if (!isThresholdsEqual && !isErrorThroutghZero && !isWarnThroutghZero) {
      // We have a 3-level color map
      pattern = [this.constantsService.colorValues.Ok, this.constantsService.colorValues.Warn, this.constantsService.colorValues.Error];
      values = [min, chart.WarningThreshold, chart.ErrorThreshold];
    } else if (chart.ErrorThreshold === chart.WarningThreshold && chart.ErrorThreshold !== 0) {
      // We have a 2-level color map
      pattern = [this.constantsService.colorValues.Ok, this.constantsService.colorValues.Error];
      values = [min, chart.ErrorThreshold];
    } else {
      // We will only use one color with no thresholds
      pattern = [this.constantsService.colorValues.Ok];
    }
    return {
      data: {
        type: gauge(),
        columns: [[chart?.Name ?? '', value]],
        onover: () => {
          // Do nothing
        },
      },
      gauge: {
        label: {
          show: true,
          format: (value: any, ratio: number, id: string) => {
            return value;
          },
        },
      },
      color: {
        pattern,
        threshold: {
          values,
        },
      },

      legend: {
        show: false,
      },
      padding: {
        bottom: 1,
        top: 0,
        left: 0,
        right: 0,
      },
    };
  }
}
