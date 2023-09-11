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

import { Injectable } from '@angular/core';
import { ChartDto } from 'imx-api-qer';
import { StatisticsConstantsService } from '../../../statistics-home-page/statistics-constants.service';
import { PointStatTyped, StatusIcon, StatusStateCSS, TrendIcon } from './point-stat-typed';

@Injectable({
  providedIn: 'root',
})
export class PointStatVisualService {
  public trend: number;
  public percentOrValue: number;

  constructor(private statisticsConstantService: StatisticsConstantsService) {}

  public extractStatus(stat: ChartDto): PointStatTyped {
    const topDataPoint = stat.Data[0];
    const value = topDataPoint.Points[0].Value;
    if (this.isBetween0And1(stat.ErrorThreshold)) {
      // We have threshold less than 1, so we need to use the percentage
      this.percentOrValue = topDataPoint.Points[0].Percentage;
      if (topDataPoint.Points[1]) {
        this.trend = this.percentOrValue - topDataPoint.Points[1].Percentage;
      }
    } else {
      this.percentOrValue = topDataPoint.Points[0].Value;
      if (topDataPoint.Points[1]) {
        this.trend = this.percentOrValue - topDataPoint.Points[1].Value;
      }
    }

    return PointStatTyped.buildEntity({
      displayValue: value.toString(),
      value,
      description: stat.Description,
      ...this.getTrend(),
      ...this.getStatus(stat),
    });
  }

  public isBetween0And1(x: number): boolean {
    return x > 0 && x < 1;
  }

  public getTrend(): { hasTrend: boolean; trend: string; trendIcon?: TrendIcon } {
    const hasTrend = this.trend && this.trend !== 0;
    let trend: string;
    let trendIcon: TrendIcon;
    switch (true) {
      default:
        trend = this.statisticsConstantService.pointStatusText.Stable;
        break;
      case this.trend > 0:
        trend = this.statisticsConstantService.pointStatusText.Rising;
        trendIcon = 'arrowup';
        break;
      case this.trend < 0:
        trend = this.statisticsConstantService.pointStatusText.Falling;
        trendIcon = 'arrowdown';
    }
    return {
      hasTrend,
      trend,
      trendIcon,
    };
  }

  public getStatus(stat: ChartDto): {
    status: string;
    statusIcon: StatusIcon;
    statusClass: StatusStateCSS;
  } {
    let status: string;
    let statusIcon: StatusIcon;
    let statusClass: StatusStateCSS;
    switch (true) {
      case this.isError(stat):
        status = this.statisticsConstantService.errorStatusText;
        statusIcon = 'error-circle';
        statusClass = 'is-error';
        break;
      case this.isWarn(stat):
        status = this.statisticsConstantService.warningStatusText;
        statusIcon = 'warning';
        statusClass = 'is-warn';
        break;
      default:
        status = this.statisticsConstantService.okStatusText;
        statusIcon = 'setdefault';
        statusClass = 'is-ok';
        break;
    }

    return {
      status,
      statusIcon,
      statusClass,
    };
  }

  public isError(stat: ChartDto): boolean {
    // If 0, then we can't use an equality
    return stat.ErrorThreshold === 0 ? this.percentOrValue > stat.ErrorThreshold : this.percentOrValue >= stat.ErrorThreshold;
  }

  public isWarn(stat: ChartDto): boolean {
    // We check if this is 0, if it is we don't use a warn state
    return stat.WarningThreshold > 0 && this.percentOrValue >= stat.WarningThreshold;
  }
}
