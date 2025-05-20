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
 * Copyright 2024 One Identity LLC.
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
import { CachedPromise } from '@imx-modules/imx-qbm-dbts';
import { AppConfigService, ClassloggerService, ImxTranslationProviderService } from 'qbm';
import { DgeConfigData, TypedClient, V2Client } from './TypedClient';

@Injectable({
  providedIn: 'root',
})
export class QamApiService {
  private tc: TypedClient;
  public get typedClient(): TypedClient {
    return this.tc;
  }

  private c: V2Client;
  public get client(): V2Client {
    return this.c;
  }

  constructor(
    private readonly config: AppConfigService,
    private readonly logger: ClassloggerService,
    private readonly translationProvider: ImxTranslationProviderService,
  ) {
    try {
      this.logger.debug(this, 'Initializing QAM API service');

      // Use schema loaded by QBM client
      const schemaProvider = config.client;
      this.c = new V2Client(this.config.apiClient, schemaProvider);
      this.tc = new TypedClient(this.c, this.translationProvider);
    } catch (e) {
      this.logger.error(this, e);
    }
  }

  private cachedDgeConfig: CachedPromise<DgeConfigData> = new CachedPromise(() => this.client.portal_dgeconfig_get());

  public getDgeConfig() {
    return this.cachedDgeConfig.get();
  }

  private cachedTrusteeTypes: CachedPromise<{ [id: number]: string }> = new CachedPromise(async () => {
    const data = await this.client.portal_dge_trustees_types_get();
    var result = {};
    data.forEach((e) => {
      result[e.Value] = e.Description;
    });
    return result;
  });

  /** Returns the display names of the known trustee types. */
  public getTrusteeTypes(): Promise<{ [id: number]: string }> {
    return this.cachedTrusteeTypes.get();
  }

  public isPersonDGEAdmin(groups: string[]): boolean {
    const isDGEAdminReal = groups.find((item) => item.toUpperCase() === 'VI_4_QAM_ADMIN') != null;
    return isDGEAdminReal;
  }
}
