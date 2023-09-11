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

import { TypedClient, V2Client } from 'imx-api-qbm';
import { ISessionState, SessionState } from './session-state';
import { AppConfigService } from '../appConfig/appConfig.service';
import { ClassloggerService } from '../classlogger/classlogger.service';

@Injectable()
export class imx_SessionService {
  public get SessionState(): ISessionState {
    return this.sessionState;
  }
  public get Client(): V2Client {
    return this.appConfigService.client;
  }

  public TypedClient: TypedClient;

  private sessionState: ISessionState;

  constructor(
    private appConfigService: AppConfigService,
    private readonly logger: ClassloggerService) { }

  public async getSessionState(): Promise<ISessionState> {
    this.logger.debug(this, 'getSessionState');
    const sr = await this.appConfigService.client.imx_sessions_get(this.appConfigService.Config.WebAppIndex);
    return (this.sessionState = new SessionState(sr));
  }

  public async login(loginData: { [key: string]: string }): Promise<ISessionState> {
    this.logger.debug(this, 'login');
    const sr = await this.appConfigService.client.imx_login_post(this.appConfigService.Config.WebAppIndex, loginData, {
      noxsrf: false
    });
    return (this.sessionState = new SessionState(sr));
  }

  public async logout(): Promise<ISessionState> {
    this.logger.debug(this, 'logout');
    const sr = await this.appConfigService.client.imx_logout_post(this.appConfigService.Config.WebAppIndex);
    return (this.sessionState = new SessionState(sr));
  }
}
