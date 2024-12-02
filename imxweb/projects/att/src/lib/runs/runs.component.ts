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

import { AfterViewInit, Component, signal, ViewChild, WritableSignal } from '@angular/core';
import { PortalAttestationRun } from '@imx-modules/imx-api-att';
import { DataViewSource } from 'qbm';
import { RunsGridComponent } from './runs-grid/runs-grid.component';

@Component({
  templateUrl: './runs.component.html',
  styleUrls: ['./runs.component.scss'],
})
export class RunsComponent implements AfterViewInit {
  public dataSource: WritableSignal<DataViewSource<PortalAttestationRun> | undefined> = signal(undefined);
  public canSeeAttestationPolicies: boolean;
  @ViewChild('runsGridComponent', { static: false }) public runsGridComponent: RunsGridComponent;
  ngAfterViewInit(): void {
    this.dataSource.set(this.runsGridComponent?.dataSource);
  }

  // HelpChapterID = 2A288F2C-345B-4A0D-BD88-0C488289C495
}
