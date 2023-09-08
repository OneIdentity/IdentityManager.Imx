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
import { DefaultUrlSerializer } from '@angular/router';

import { imx_SessionService } from '../session/imx-session.service';
import { AppConfigService } from '../appConfig/appConfig.service';
import { PlatformLocation } from '@angular/common';

@Injectable()
export class OAuthService {
  constructor(
    private readonly sessionService: imx_SessionService,
    private readonly config: AppConfigService,
    private readonly platformLocation: PlatformLocation
  ) { }

  public async GetProviderUrl(authentifier: string): Promise<string> {
    const module = '?Module=' + authentifier;
    return this.sessionService.Client.imx_oauth_get(authentifier, this.config.Config.WebAppIndex, {
      redirecturi: this.platformLocation.pathname + this.platformLocation.hash + module
    });
  }

  public IsOAuthParameter(name: string): boolean {
    return name === 'Module' || name === 'code' || name === 'Code' || name === 'state';
  }

  public hasRequiredOAuthParameter(params: { [key: string]: any }): boolean {
    const keys = Object.keys(params);
    // both parameter are required "state" and "code" for OAuth
    return keys.length > 0 && keys.includes('state') && (keys.includes('Code') || keys.includes('code'));
  }

  public convertToOAuthLoginData(loginData: { [key: string]: any }): {
    Module: string,
    Code: string
  } {
    const moduleName = loginData['Module'] || (new DefaultUrlSerializer()).parse(loginData['state']).queryParamMap.get('Module');
    const code = loginData['Code'] || loginData['code'];

    return moduleName && code ? {
      Module: moduleName,
      Code: code
    } : undefined;
  }
}
