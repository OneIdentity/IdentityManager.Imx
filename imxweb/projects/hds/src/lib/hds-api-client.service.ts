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
import { V2Client, TypedClient } from 'imx-api-hds';
import { ApiClient } from 'imx-qbm-dbts';
import { AppConfigService, ClassloggerService, ImxTranslationProviderService } from 'qbm';

@Injectable({
  providedIn: 'root'
})
export class HdsApiService {
  private tc: TypedClient;
  public get typedClient(): TypedClient {
    return this.tc;
  }

  private c: V2Client;
  public get client(): V2Client {
    return this.c;
  }

  public get apiClient(): ApiClient {
    return this.config.apiClient;
  }

  constructor(
    private readonly config: AppConfigService,
    private readonly logger: ClassloggerService,
    private readonly translationProvider: ImxTranslationProviderService) {
    try {
      // Use schema loaded by QBM client
      const schemaProvider = config.client;
      this.c = new V2Client(this.config.apiClient, schemaProvider);
      this.tc = new TypedClient(this.c, this.translationProvider);

    } catch (e) {
      this.logger.error(this, e);
    }
  }
}
