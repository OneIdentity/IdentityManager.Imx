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
 * Copyright 2022 One Identity LLC.
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
import { TranslateService } from '@ngx-translate/core';
import { ChartOptions, pie } from 'billboard.js';
import { PortalAttestationRun } from 'imx-api-att';

@Component({
  selector: 'imx-case-chart',
  templateUrl: './case-chart.component.html',
  styleUrls: ['./case-chart.component.scss']
})
export class CaseChartComponent implements OnInit {

  @Input() public run: PortalAttestationRun;

  public chartData: ChartOptions;
  constructor(
    readonly translateService: TranslateService
  ) { }

  public ngOnInit(): void {
    if (this.run != null) {
      this.chartData = this.buildSingleValueChart();
    }
  }

  private buildSingleValueChart(): ChartOptions {
    if (this.run.PendingCases.value === 0 && this.run.GrantedCases.value === 0
      && this.run.DeniedCases.value === 0 && this.run.CasesAbortedBySystem.value === 0) {
      return undefined;
    }
    return {
      size: { width: 271, height: 271 },
      data: {
        columns: [
          ['open', this.run.PendingCases.value],
          ['granted', this.run.GrantedCases.value],
          ['denied', this.run.DeniedCases.value - this.run.CasesAbortedBySystem.value],
          ['abort', this.run.CasesAbortedBySystem.value]
        ],
        names: {
          open: this.run.PendingCases.GetMetadata().GetDisplay(),
          granted: this.run.GrantedCases.GetMetadata().GetDisplay(),
          denied: this.run.DeniedCases.GetMetadata().GetDisplay(),
          abort: this.run.CasesAbortedBySystem.GetMetadata().GetDisplay()
        },
        colors: {
          open: '#05AADB',
          granted: '#618F3E',
          denied: '#B42126',
          abort: '#F4770B'
        },
        type: pie(),
      }, pie: {
        padAngle: 0.01,
        label: {
          format: d => `${d}`,
          threshold: 0.01
        },
      }
    };
  }

}
