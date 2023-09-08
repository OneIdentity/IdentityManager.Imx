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

import { SessionResponse, AuthPropType } from 'imx-api-qbm';
import { AuthConfigProvider } from '../authentication/auth-config-provider.interface';

export enum AuthStepLevels {
  LoggedOut = 0,
  AwaitsSecondaryAuth = 1,
  LoggedIn = 2
}

export interface ISessionState {
  IsLoggedOut?: boolean;
  IsAwaitingSecondaryAuth?: boolean;
  IsLoggedIn?: boolean;
  Username?: string;

  /** Returns the UID of the identity associated with the session. Note that this may
   * be `null` when the session has no associated identity.
   */
  UserUid?: string;
  SecondaryAuthName?: string;
  SecondaryErrorMessage?: string;
  configurationProviders?: AuthConfigProvider[];
  externalLogoutUrl?: string;
  isOAuth?: boolean;
  hasErrorState?: boolean;
  culture?: string;
  cultureFormat?: string;
}

/**
 * Encapsulates SessionResponse and provides properties for determining the current state of the sessions
 */
export class SessionState implements ISessionState {
  public get IsLoggedOut(): boolean { return this.currentAuthStep === AuthStepLevels.LoggedOut; }
  public get IsAwaitingSecondaryAuth(): boolean { return this.currentAuthStep === AuthStepLevels.AwaitsSecondaryAuth; }
  public get IsLoggedIn(): boolean { return this.currentAuthStep === AuthStepLevels.LoggedIn; }
  public get Username(): string { return this.sessionResponse && this.IsLoggedIn ? this.sessionResponse.Status.PrimaryAuth.Display : null; }
  public get UserUid(): string { return this.sessionResponse && this.IsLoggedIn ? this.sessionResponse.Status.PrimaryAuth.Uid : null; }
  public get SecondaryAuthName(): string {
    return this.sessionResponse && this.sessionResponse.Status && this.sessionResponse.Status.SecondaryAuth ?
           this.sessionResponse.Status.SecondaryAuth.Name :
           null;
  }

  public get SecondaryErrorMessage(): string {
    return this.sessionResponse && this.sessionResponse.Status && this.sessionResponse.Status.SecondaryAuth ?
           this.sessionResponse.Status.SecondaryAuth.ErrorMessage :
           null;
  }

  public readonly configurationProviders: AuthConfigProvider[];
  public readonly externalLogoutUrl: string;
  public readonly culture: string;
  public readonly cultureFormat: string;

  private currentAuthStep: AuthStepLevels = AuthStepLevels.LoggedOut;

  constructor(private sessionResponse: SessionResponse) {
    this.currentAuthStep = this.GetCurrentAuthStep();
    this.configurationProviders = this.GetConfigurationProviders();
    if (this.sessionResponse && this.sessionResponse.Status) {
      this.externalLogoutUrl = this.sessionResponse.Status.ExternalLogoutUrl;
    }
    this.culture = this.sessionResponse?.Status?.Culture;
    this.cultureFormat  = this.sessionResponse?.Status?.CultureFormat ;
  }

  private GetCurrentAuthStep(): AuthStepLevels {
    if (
      !this.sessionResponse ||
      !this.sessionResponse.Status ||
      !this.sessionResponse.Status.PrimaryAuth.IsAuthenticated
    ) {
      return AuthStepLevels.LoggedOut;
    }

    if (
      this.sessionResponse.Status.SecondaryAuth.IsEnabled &&
      !this.sessionResponse.Status.SecondaryAuth.IsAuthenticated
    ) {
      return AuthStepLevels.AwaitsSecondaryAuth;
    }

    return AuthStepLevels.LoggedIn;
  }

  private GetConfigurationProviders(): AuthConfigProvider[] {
    if (this.sessionResponse && this.sessionResponse.Config) {
      return this.sessionResponse.Config.map(config => {
        const configProvider: AuthConfigProvider = {
          name: config.Name,
          display: config.Display,
          externalLogoutUrl: config.ExternalLogoutUrl
        };

        if (config.AuthProps) {
          configProvider.authProps = [];
          config.AuthProps.forEach(authProp => {
            if (authProp.Type === AuthPropType.OAuth2Code) {
              configProvider.isOAuth2 = true;
            }

            configProvider.authProps.push({
              name: authProp.Name,
              inputType: authProp.Type === AuthPropType.Password ? 'Password' : 'Text',
              display: authProp.Display
            });
          });
        }

        return configProvider;
      });
    }

    return undefined;
  }
}
