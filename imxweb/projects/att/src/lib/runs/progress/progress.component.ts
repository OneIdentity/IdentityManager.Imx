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

import { PortalAttestationRun } from 'imx-api-att';
import { percentage } from '../helpers';

@Component({
  selector: 'imx-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.scss']
})
export class ProgressComponent {
  public get progress(): number {
    if (this.attestationRun) {
      return this.forecast ? this.attestationRun.ForecastProgress.value : this.attestationRun.Progress.value;
    }

    return 0;
  }

  public get totalNumberOfCases(): number {
    return this.attestationRun ? this.attestationRun.ClosedCases.value + this.attestationRun.PendingCases.value : 0;
  }

  public get percentage(): number {
    return this.attestationRun ? percentage(this.progress) : 0;
  }

  @Input() public attestationRun: PortalAttestationRun;
  @Input() public limit: number;
  @Input() public forecast = false;
}
