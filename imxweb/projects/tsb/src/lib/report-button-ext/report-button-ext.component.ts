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

import { Component, OnInit } from '@angular/core';
import { EuiDownloadOptions } from '@elemental-ui/core';

import { ElementalUiConfigService } from 'qbm';
import { AccountsReportsService } from '../accounts/accounts-reports.service';

@Component({
  selector: 'imx-report-button-ext',
  templateUrl: './report-button-ext.component.html',
  styleUrls: ['./report-button-ext.component.scss']
})
export class ReportButtonExtComponent implements OnInit {
  public downloadOptions: EuiDownloadOptions;

  public referrer: string;

  constructor(
    private readonly elementalUiConfigService: ElementalUiConfigService,
    private readonly service: AccountsReportsService
  ) { }

  public ngOnInit(): void {
    const url = this.service.accountsOwnedByManagedReport(30, this.referrer);

    this.downloadOptions = {
      ...this.elementalUiConfigService.Config.downloadOptions,
      url
    };
  }
}
