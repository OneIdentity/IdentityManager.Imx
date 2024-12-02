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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EuiLoadingService } from '@elemental-ui/core';
import { ReCaptchaV3Service } from 'ng-recaptcha-2';
import { AuthenticationService, CaptchaService, UserMessageService, imx_SessionService } from 'qbm';
import { Subscription } from 'rxjs';
import { QerApiService } from '../../qer-api-client.service';

/**
 * Handles authentication with passcode In Password Reset Portal
 */
@Component({
  templateUrl: './passcode-login.component.html',
  styleUrls: ['./passcode-login.component.scss'],
})
export class PasscodeLoginComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];

  public userName: string = '';
  public passcode: string = '';

  /**
   * Toggles between ReCaptcha and passcode view
   */
  public isEnteringPasscode = false;

  constructor(
    private readonly authService: AuthenticationService,
    private readonly qerApiService: QerApiService,
    private readonly session: imx_SessionService,
    private router: Router,
    private readonly busyService: EuiLoadingService,
    private readonly messageSvc: UserMessageService,
    private readonly recaptchaV3Service: ReCaptchaV3Service,
    public readonly captchaSvc: CaptchaService,
  ) {}

  public ngOnInit(): void {}

  /**
   * Checks if the ReCaptcha was successful, if it was, then makes the passcode input visible.
   * @param noResetMessage If true, then does not reset error message.
   */
  async MoveToEnterPasscode(noResetMessage?: boolean): Promise<void> {
    if (!noResetMessage) {
      // reset the error message
      this.messageSvc.subject.next(undefined);
    }

    if (this.busyService.overlayRefs.length === 0) {
      this.busyService.show();
    }
    try {
      if (this.captchaSvc.isReCaptchaV3) {
        this.subscriptions.push(
          this.recaptchaV3Service.execute('passcodeLogin').subscribe(async (token) => {
            await this.qerApiService.client.passwordreset_passwordquestions_account_post({
              AccountName: this.userName,
              Code: token,
            });
          }),
        );
      } else {
        // use response code
        const resp = this.captchaSvc.Response;
        this.captchaSvc.Response = '';

        // use this API call to set the CAPTCHA on the server side
        await this.qerApiService.client.passwordreset_passwordquestions_account_post({
          AccountName: this.userName,
          Code: resp,
        });
      }
    } catch (e) {
      throw e;
    } finally {
      this.passcode = '';
      this.isEnteringPasscode = true;
      this.captchaSvc.ReinitCaptcha();
      this.busyService.hide();
    }
  }

  /**
   * Creates new session and logs in user in case of correct passcode.
   */
  public async Login(): Promise<void> {
    // reset the error message
    this.messageSvc.subject.next(undefined);
    if (this.busyService.overlayRefs.length === 0) {
      this.busyService.show();
    }
    try {
      const newSession = await this.session.login({
        __Product: 'PasswordReset',
        Module: 'Passcode',
        User: this.userName,
        Passcode: this.passcode,
      });

      if (newSession) {
        await this.authService.processLogin(async () => newSession);
        this.Reset();
        this.router.navigate(['']);
      } else {
        this.MoveToEnterPasscode(true);
      }
    } finally {
      this.busyService.hide();
    }
  }

  /**
   * Changes the view to ReCaptcha view.
   */
  Reset() {
    this.isEnteringPasscode = false;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
