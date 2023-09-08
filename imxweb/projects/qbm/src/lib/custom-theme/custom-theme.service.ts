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

import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { CustomThemeInfo } from 'imx-api-qbm';
import { AppConfigService } from '../appConfig/appConfig.service';

@Injectable({ providedIn: 'root' })
export class CustomThemeService {
  constructor(
    @Inject(DOCUMENT) private document: Document,
    private readonly config: AppConfigService
  ) { }

  public initialize(): void {
    this.config.initializedSubject.subscribe(async () => {
      await this.loadThemes();
    });
  }

  public async loadThemes(): Promise<void> {
    // load custom theme information from server
    const customThemes = await this.config.client.imx_themes_get();

    // for each custom theme, load the CSS and add it to the head
    const head = this.document.getElementsByTagName('head')[0];

    for (var theme of customThemes) {
      for (var url of theme.Urls) {
        const style = this.document.createElement('link');
        style.rel = 'stylesheet';
        style.href = url;
        head.appendChild(style);
      }
    }

    this._customThemes = customThemes.map(m => {
      // map .NET types to the expected type for the theme switcher
      return {
        name: m.DisplayName,
        class: m.Class
      };
    });
  }

  private _customThemes: { name: string, class: string }[] = [];

  public get customThemes() {
    return this._customThemes;
  }
}
