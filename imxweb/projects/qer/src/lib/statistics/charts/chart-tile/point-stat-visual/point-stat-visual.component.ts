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

import { Component, Input } from '@angular/core';
import { ChartDto } from 'imx-api-qer';
import { PointStatTyped } from './point-stat-typed';

@Component({
  selector: 'imx-point-stat-visual',
  templateUrl: './point-stat-visual.component.html',
  styleUrls: ['./point-stat-visual.component.scss'],
})
export class PointStatVisualComponent {
  @Input() public summaryStat: ChartDto;
  @Input() public pointStatStatus: PointStatTyped;

  public get displayValue(): string {
    return this.pointStatStatus.DisplayValue.value;
  }

  public get hasTrend(): boolean {
    return this.pointStatStatus.HasTrend.value;
  }

  public get status(): string {
    return this.pointStatStatus.Status.value;
  }

  public get statusIcon(): string {
    return this.pointStatStatus.StatusIconString.value;
  }

  public get statusClass(): string {
    return this.pointStatStatus.StatusClass.value;
  }

  public get trend(): string {
    return this.pointStatStatus.Trend.value;
  }

  public get trendIcon(): string {
    return this.pointStatStatus.TrendIconString.value;
  }
}
