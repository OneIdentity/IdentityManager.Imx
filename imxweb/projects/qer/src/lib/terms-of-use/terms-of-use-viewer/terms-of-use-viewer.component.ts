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

import { Component, Inject, OnInit } from '@angular/core';
import { EuiDownloadOptions, EuiLoadingService, EUI_SIDESHEET_DATA } from '@elemental-ui/core';

import { PortalTermsofuse } from 'imx-api-qer';
import { IReadValue } from 'imx-qbm-dbts';
import { TermsOfUseService } from '../terms-of-use.service';

@Component({
  selector: 'imx-terms-of-use-viewer',
  templateUrl: './terms-of-use-viewer.component.html',
  styleUrls: ['./terms-of-use-viewer.component.scss'],
})
export class TermsOfUseViewerComponent implements OnInit {
  public terms: PortalTermsofuse;

  constructor(
    private termsOfUseService: TermsOfUseService,
    @Inject(EUI_SIDESHEET_DATA)
    private readonly data: IReadValue<string>,
    private readonly busyService: EuiLoadingService
    ) {}

  public async ngOnInit(): Promise<void> {
    const overlay = this.busyService.show();
    try {
      this.terms = await this.termsOfUseService.getSingleTermsOfUse(this.data.value);
    } finally {
      this.busyService.hide(overlay);
    }
  }

  /**
   * Gets the {@link EuiDownloadOptions|download options} for the given uid.
   */
  public getDownloadOptions(key: string, display: string): EuiDownloadOptions {
    return this.termsOfUseService.getDownloadOptions(key, display);
  }
}
