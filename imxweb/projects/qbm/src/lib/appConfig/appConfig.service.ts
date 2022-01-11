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
 * Copyright 2021 One Identity LLC.
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

import { HttpClient } from '@angular/common/http';
import { Injectable, ErrorHandler, Injector } from '@angular/core';

import { AppConfig } from './appConfig.interface';
import { ApiClientFetch } from '../api-client/api-client-fetch';
import { V2Client, Client } from 'imx-api-qbm';
import { ClassloggerService } from '../classlogger/classlogger.service';
import { TranslateService } from '@ngx-translate/core';
import { ApiClient } from 'imx-qbm-dbts';

// @dynamic
@Injectable()
export class AppConfigService {
  public get Config(): AppConfig {
    return this.config;
  }
  public get BaseUrl(): string {
    return this.baseUrl;
  }

  private _client: Client;
  public get client(): Client {
    return this._client;
  }

  private _v2client: V2Client;
  public get v2client(): V2Client { return this._v2client; }

  private _apiClient: ApiClient;
  public get apiClient(): ApiClient {
    return this._apiClient;
  }

  private config: AppConfig;
  private baseUrl: string;

  constructor(
    private readonly httpClient: HttpClient,
    private readonly logger: ClassloggerService,
    private readonly errorHandler: ErrorHandler,
    private readonly injector: Injector
  ) {}

  public async init(apiServerUrl: string): Promise<void> {
    this.config = (await this.httpClient.get('appconfig.json').toPromise()) as AppConfig;
    this.initialize(apiServerUrl);
    await this.client.loadSchema();
  }

  public init2(apiServerUrl: string, config: any): void {
    this.config = config;
    this.initialize(apiServerUrl);
  }

  public async loadSchema2(): Promise<void> {
    await this.client.loadSchema();
  }

  private initialize(apiServerUrl: string): void {
    this.baseUrl = apiServerUrl || window.location.origin + (this.config.Basepath || '');

    // avoid cyclic dependency
    const translation = this.injector.get(TranslateService);
    this._apiClient = new ApiClientFetch(this.errorHandler, this.baseUrl, this.logger, translation);
    this._client = new Client(this._apiClient);
    this._v2client = new V2Client(this._apiClient, this._client);
  }
}
