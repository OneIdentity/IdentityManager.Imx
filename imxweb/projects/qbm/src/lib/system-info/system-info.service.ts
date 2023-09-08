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

import { imx_SessionService } from '../session/imx-session.service';
import { ImxConfig, SystemInfo } from 'imx-api-qbm';
import { CachedPromise } from 'imx-qbm-dbts';
import { CacheService } from '../cache/cache.service';

/** Service that provides system info.
 *  The service sends only one request per session, the retrieved data is cached.
 */
@Injectable({
  providedIn: 'root'
})
export class SystemInfoService {
  private systemInfo: CachedPromise<SystemInfo>;
  private _imxConfig: CachedPromise<ImxConfig>;

  constructor(private readonly session: imx_SessionService, cacheService: CacheService) {
    this.systemInfo = cacheService.buildCache(() => this.session.Client.imx_system_get());
    this._imxConfig = cacheService.buildCache(() => this.session.Client.imx_config_get());
  }

  public async get(): Promise<SystemInfo> {
    return this.systemInfo.get();
  }

  /** Returns the cached ImxConfig object. */
  public getImxConfig(): Promise<ImxConfig> {
    return this._imxConfig.get();
  }
}
