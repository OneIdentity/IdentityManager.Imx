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
import { EuiAlertBannerService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { LdsReplacePipe } from '../lds-replace/lds-replace.pipe';
import { MastHeadService } from '../mast-head/mast-head.service';
import { StorageService } from '../storage/storage.service';
import { isIE } from './user-agent-helper';

@Injectable({
  providedIn: 'root',
})
export class IeWarningService {
  constructor(
    private readonly storageService: StorageService,
    private readonly alertBanner: EuiAlertBannerService,
    private readonly translate: TranslateService,
    private readonly ldsReplace: LdsReplacePipe,
    private readonly mastHeadService: MastHeadService
  ) {}

  public async showIe11Banner(): Promise<void> {
    if (isIE()) {
      const alertKey = 'warningAlertDismissed_ieSupportBanner';
      const docSpecificPage = '#Sources/WebPortalUserGuide/WPORTGettingStart/WPortGettingStart.htm?Highlight=Supported browsers';
      const docUrl = `${this.mastHeadService.getDocumentationLink()}${docSpecificPage}`;
      const supportedBrowsersTranslation = await this.translate.get('#LDS#Supported browsers').toPromise();
      const docLink = `<a href='${docUrl}' target='_blank' rel='noopener noreferrer'>${supportedBrowsersTranslation}</a>`;
      if (!this.storageService.isHelperAlertDismissed(alertKey)) {
        this.alertBanner.open({
          type: 'warning',
          dismissable: true,
          message: this.ldsReplace.transform(
            await this.translate
              .get(
                '#LDS#Internet Explorer is no longer supported and the application may not work properly. Please use a browser from the following list: {0}.'
              )
              .toPromise(),
            docLink
          ),
        });
        this.alertBanner.userDismissed.subscribe(() => this.storageService.storeHelperAlertDismissal(alertKey));
      }
    }
  }
}
