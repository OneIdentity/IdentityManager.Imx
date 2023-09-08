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

import { Component, Input, OnInit } from '@angular/core';
import { EuiDownloadOptions } from '@elemental-ui/core';

import { AadPermissionsService } from '../../admin/aad-permissions.service';
import { AadExtensionService } from '../aad-extension.service';

@Component({
  templateUrl: './licence-overview-button.component.html',
  styleUrls: ['./licence-overview-button.component.scss']
})
export class LicenceOverviewButtonComponent implements OnInit {

  public licenceOverview: EuiDownloadOptions;
  @Input() public referrer: { type: string, uidGroup: string, defaultDownloadOptions: EuiDownloadOptions };

  constructor(
    public aadService: AadExtensionService,
    private permissions: AadPermissionsService
  ) { }

  public async ngOnInit(): Promise<void> {
    const url = this.referrer.type === 'AADSubSku'
      && await this.permissions.canReadInAzure() ?
      this.aadService.getReportForSubSku(this.referrer.uidGroup) : '';

    this.licenceOverview = url != null && url !== '' ? {
      ... this.referrer.defaultDownloadOptions,
      url
    } : undefined;
  }

}
