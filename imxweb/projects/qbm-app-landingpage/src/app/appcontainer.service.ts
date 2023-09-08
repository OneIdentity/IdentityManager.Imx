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

import { NodeAppInfo } from 'imx-api-qbm';
import { environment } from '../environments/environment';
import { AppConfigService } from 'qbm';

@Injectable()
export class AppcontainerService {
  constructor(private readonly appConfigService: AppConfigService) { }

  /** Gets a flag indicating whether the user can log in to the 
   * Server Administration app. */
  public hasServerAdministrationApp = false;

  public async getAppContainers(): Promise<AppContainer[]> {
    return this.getHtmlAppContainers();
  }

  private async getHtmlAppContainers(): Promise<AppContainer[]> {
    this.hasServerAdministrationApp = false;
    return (await this.appConfigService.client.imx_applications_get())
      .filter((appInfo: NodeAppInfo) => {
        const isServerAdminApp = appInfo.Name == environment.appName;
        if (isServerAdminApp) {
          this.hasServerAdministrationApp = true;
        }
        return !isServerAdminApp;
      })
      .map((appInfo: NodeAppInfo) => ({
        link: this.appConfigService.BaseUrl + '/html/' + appInfo.Name,
        app: appInfo
      }));
  }
}

export interface AppContainer {
  link: string;
  app: NodeAppInfo;
}
