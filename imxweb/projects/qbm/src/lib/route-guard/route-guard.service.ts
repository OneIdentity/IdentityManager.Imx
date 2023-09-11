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

import { Injectable, ErrorHandler } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, CanDeactivate } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { imx_SessionService } from '../session/imx-session.service';
import { AppConfigService } from '../appConfig/appConfig.service';
import { ComponentCanDeactivate } from './component-can-deactivate.interface';
import { OAuthService } from '../authentication/oauth.service';
import { QueryParametersHandler } from '../base/query-parameters-handler';
import { ClassloggerService } from '../classlogger/classlogger.service';
import { AuthenticationService } from '../authentication/authentication.service';
import { StorageService } from '../storage/storage.service';
import { ConfirmationService } from '../confirmation/confirmation.service';

@Injectable({
  providedIn: 'root'
})
export class RouteGuardService implements CanActivate, CanDeactivate<ComponentCanDeactivate> {
  private confirmLeaveTitle = '';
  private confirmLeaveMessage = '';
  private isLoggedIn: boolean;
  private lastRoute: ActivatedRouteSnapshot;

  constructor(
    private readonly config: AppConfigService,
    private readonly router: Router,
    private readonly session: imx_SessionService,
    private readonly errorHandler: ErrorHandler,
    private confirmation: ConfirmationService,
    private readonly oauthService: OAuthService,
    private readonly logger: ClassloggerService,
    private readonly authentication: AuthenticationService,
    private readonly storage: StorageService,
    readonly translation: TranslateService
  ) {
    translation.get('#LDS#Heading Cancel Editing')
      .subscribe((value: string) => this.confirmLeaveTitle = value);

    translation.get('#LDS#You have unsaved changes. Are you sure you want to cancel editing and discard your changes?')
      .subscribe((value: string) => this.confirmLeaveMessage = value);

    this.authentication.onSessionResponse.subscribe(sessionState => this.isLoggedIn = sessionState && sessionState.IsLoggedIn);
  }

  public async canActivate(route: ActivatedRouteSnapshot, state?: RouterStateSnapshot): Promise<boolean> {
    try {
      if (this.isLoggedIn) {
        return true;
      }

      const sessionState = await this.session.getSessionState();

      if (sessionState && sessionState.IsLoggedIn) {
        return true;
      }

      const queryParamsHandler = new QueryParametersHandler(document.location.search, route);
      const loginData = queryParamsHandler.GetQueryParameters(this.oauthService.IsOAuthParameter);

      if (loginData && (await this.authentication.oauthLogin(loginData, sessionState)).IsLoggedIn) {
        return true;
      }
    } catch (error) {
      this.errorHandler.handleError(error);
    }

    this.lastRoute = route;
    this.storage.lastUrl = state?.url;

    await this.router.navigate([this.config.Config.routeConfig.login], { queryParams: {} });
    return false;
  }

  public async canDeactivate(component: ComponentCanDeactivate): Promise<boolean> {
    if (!component.canDeactivate()) {
      return this.confirmation.confirmLeaveWithUnsavedChanges(this.confirmLeaveTitle, this.confirmLeaveMessage);
    } else {
      return true;
    }
  }

  public resolve(route: ActivatedRouteSnapshot, _: RouterStateSnapshot): void {
    this.logger.debug(this, 'resolve');

    if (!this.isLoggedIn) {
      this.logger.debug(this, 'resolve - not logged in');
      return;
    }

    const lastUrl = this.storage.lastUrl;
    const lastLocation = (this.lastRoute || lastUrl) ? {
      route: this.lastRoute,
      url: lastUrl
    } : undefined;

    this.lastRoute = undefined;
    this.storage.lastUrl = undefined;

    try {
      let queryParamsHandler = new QueryParametersHandler(document.location.search, route);
      const oAuthQueryParams = queryParamsHandler.GetQueryParameters(this.oauthService.IsOAuthParameter);
      const paramsContainsOAuth = oAuthQueryParams != null;

      if (lastLocation) {
        queryParamsHandler = new QueryParametersHandler(undefined, lastLocation.route, lastLocation.url);
      }

      if (paramsContainsOAuth && this.oauthService.hasRequiredOAuthParameter(oAuthQueryParams) || lastLocation) {
        this.logger.debug(this, 'resolve - navigate - queryParamsHandler', queryParamsHandler);

        this.router.navigate(
          [queryParamsHandler.path || this.config.Config.routeConfig.start],
          { queryParams: queryParamsHandler.GetQueryParameters(name => !this.oauthService.IsOAuthParameter(name)) }
        );
      }
    } catch (error) {
      this.errorHandler.handleError(error);
    }
  }
}
