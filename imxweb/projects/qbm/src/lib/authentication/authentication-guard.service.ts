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

import { ErrorHandler, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';

import { AuthenticationService } from './authentication.service';
import { ClassloggerService } from '../classlogger/classlogger.service';
import { imx_SessionService } from '../session/imx-session.service';
import { UserMessageService } from '../user-message/user-message.service';
import { Message } from '../user-message/message.interface';
import { QueryParametersHandler } from '../base/query-parameters-handler';
import { OAuthService } from './oauth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationGuardService implements CanActivate {
  private message: Message;

  constructor(
    private readonly session: imx_SessionService,
    private readonly authentication: AuthenticationService,
    private readonly oauthService: OAuthService,
    private readonly router: Router,
    private readonly errorHandler: ErrorHandler,
    private readonly logger: ClassloggerService,
    messageService: UserMessageService,
  ) {
    messageService.subject.subscribe(message => {
      this.logger.trace(this, 'message received:', message);
      this.message = message;
    });
  }

  public async canActivate(route: ActivatedRouteSnapshot, __: RouterStateSnapshot): Promise<boolean> {
    try {
      this.logger.trace(this, 'canActivate', this.message);

      let sessionState = await this.session.getSessionState();

      if (sessionState.IsLoggedIn || sessionState.IsAwaitingSecondaryAuth) {
        return true;
      }

      const queryParamsHandler = new QueryParametersHandler(document.location.search, route);
      const oauthLoginData = queryParamsHandler.GetQueryParameters(this.oauthService.IsOAuthParameter);

      this.logger.trace(this, 'canActivate loginData', oauthLoginData);

      if (oauthLoginData) {
        sessionState = await this.authentication.oauthLogin(oauthLoginData, sessionState);

        if (sessionState.IsLoggedIn || sessionState.IsAwaitingSecondaryAuth) {
          return true;
        }
      }

      if (this.message == null &&
        sessionState &&
        sessionState.configurationProviders &&
        sessionState.configurationProviders.length === 1) {
        const authConfigProvider = sessionState.configurationProviders[0];
        this.logger.trace(this, 'canActivate configProvider', authConfigProvider);
        if (authConfigProvider.isOAuth2) {
          this.logger.debug(this, 'canActivate oauth redirect');
          this.logger.trace(this, 'canActivate oauth redirect URL', this.router.url);
          await this.authentication.oauthRedirect(
            authConfigProvider.name
          );
          return false;
        }
      }
    } catch (error) {
      this.errorHandler.handleError(error);
    }

    return true;
  }
}
