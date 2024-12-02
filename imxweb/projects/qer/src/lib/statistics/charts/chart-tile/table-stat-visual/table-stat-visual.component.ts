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

import { Component, Input, OnInit } from '@angular/core';
import { ChartDto } from '@imx-modules/imx-api-qer';

@Component({
  selector: 'imx-table-stat-visual',
  templateUrl: './table-stat-visual.component.html',
  styleUrls: ['./table-stat-visual.component.scss'],
})
export class TableStatVisualComponent implements OnInit {
  @Input() public summaryStat: ChartDto;
  public topData: { key: string; value: number }[];
  public displayedColumns = ['key', 'value'];

  private entryCutoff = 5;

  constructor() {}

  ngOnInit(): void {
    this.topData =
      this.summaryStat?.Data?.map((datum) => {
        return { key: datum.Name ?? '', value: datum.Points?.[0].Value ?? 0 };
      })
        ?.sort((a, b) => b.value - a.value)
        ?.slice(0, this.entryCutoff) || [];
  }
}
