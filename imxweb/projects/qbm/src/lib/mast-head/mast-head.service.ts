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
import { Subject } from 'rxjs';
import { MastHeadMenu } from './mast-head-menu.interface';
import { MastHeadMenuItem } from './mast-head-menu-item.interface';
import { AppConfigService } from '../appConfig/appConfig.service';
import { TranslateService } from '@ngx-translate/core';
import { SessionInfoData } from 'imx-api-qbm';

@Injectable({
  providedIn: 'root'
})
export class MastHeadService {
  public itemClickedSubject: Subject<MastHeadMenu | MastHeadMenuItem> = new Subject();

  constructor(
    private readonly appConfig: AppConfigService,
    private readonly translate: TranslateService
  ) { }

  public itemClicked(menuItem: MastHeadMenu | MastHeadMenuItem): void {
    this.itemClickedSubject.next(menuItem);
  }

  public openDocumentationLink(): void {
    // Open a new tab and navigate to the relevant documentation link based on the browsers locale
    const docRelativeUrl = this.getLocaleDocumentationPath();
    const fulldocUrl = `${this.appConfig.BaseUrl}/${docRelativeUrl}`;
    window.open(fulldocUrl, '_blank');
  }

  public getDocumentationLink(): string {
    const docRelativeUrl = this.getLocaleDocumentationPath();
    const fulldocUrl = `${this.appConfig.BaseUrl}/${docRelativeUrl}`;
    return fulldocUrl;
  }

  public async getConnectionData(appId: string): Promise<SessionInfoData> {
    return await this.appConfig.client.imx_sessions_info_get(appId);
  }

  private getLocaleDocumentationPath(): string {
    const docPaths = this.appConfig.Config.LocalDocPath;
    const currentLanguage = this.translate.currentLang;
    const directLocaleMatch = docPaths[currentLanguage];
    // If the browser culture directly matches a key for documentation paths, then use that
    if (directLocaleMatch) {
      return directLocaleMatch;
    }
    // Otherwise we need to find the closest match based on the shortened langauage (just first part)
    const currentLanguageShort = currentLanguage.substr(0, 2);
    const docKeys = Object.keys(docPaths);
    const matchingKey = docKeys.find((element) => element.includes(currentLanguageShort));
    // If still no match, fallback to the first documentation path entry
    return docPaths[matchingKey] ?? docPaths[docKeys[0]];
  }
}
