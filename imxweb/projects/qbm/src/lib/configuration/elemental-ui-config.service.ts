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
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from '../authentication/authentication.service';

import { ElementalUiConfig } from './elemental-ui-config.interface';

/**
 * A service that helps configure Element UI
 */
@Injectable({
  providedIn: 'root'
})
export class ElementalUiConfigService {

  private readonly config: ElementalUiConfig = {
    downloadOptions: {
      url: '',
      fileMimeType: 'application/pdf',
      requestOptions: {
        withCredentials: true,
      },
      loaderConfig: {
        helperText: '',
        buttonText: '',
        spinnerAriaLabel: ''
      }
    }
  };

  /**
   * Gets the {@link ElementalUiConfig}
   */
  public get Config(): ElementalUiConfig {
    return this.config;
  }

  constructor(
    private readonly translate: TranslateService,
    authentication: AuthenticationService
  ) {
    authentication.onSessionResponse.subscribe(() => {
      this.translate.get('#LDS#File download in progress').
        subscribe((trans: string) => this.config.downloadOptions.loaderConfig.helperText = trans);
      this.translate.get('#LDS#Cancel download').
        subscribe((trans: string) => this.config.downloadOptions.loaderConfig.buttonText = trans);
      this.translate.get('#LDS#Loading...').
        subscribe((trans: string) => this.config.downloadOptions.loaderConfig.spinnerAriaLabel = trans);
    });
  }
}
