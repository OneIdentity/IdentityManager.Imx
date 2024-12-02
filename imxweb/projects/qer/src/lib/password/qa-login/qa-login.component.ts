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
import { PasswordResetAuthModel } from '@imx-modules/imx-api-qer';
import { ReCaptchaV3Service } from 'ng-recaptcha-2';
import { AuthenticationService, CaptchaService, UserMessageService, imx_SessionService } from 'qbm';
import { Subscription } from 'rxjs';
import { QerApiService } from '../../qer-api-client.service';

/**
 * Handles question based authentication In Password Reset Portal
 */
@Component({
  templateUrl: './qa-login.component.html',
  styleUrls: ['./qa-login.component.scss'],
})
export class QaLoginComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];

  public userName = '';

  /**
   * Questions based on user, which need to be answered.
   */
  public pqa: PasswordResetAuthModel | null;
  public Answers: string[] = [];

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
  public async LoadQuestions(noResetMessage?: boolean): Promise<void> {
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
          this.recaptchaV3Service.execute('qaLogin').subscribe(async (token) => {
            this.pqa = await this.qerApiService.v2Client.passwordreset_passwordquestions_account_post({
              AccountName: this.userName,
              Code: token,
            });

            this.Answers = new Array<string>(this.pqa.Questions?.length || 0).fill('');
          }),
        );
      } else {
        // use response code
        const resp = this.captchaSvc.Response;
        this.captchaSvc.Response = '';

        this.pqa = await this.qerApiService.client.passwordreset_passwordquestions_account_post({
          AccountName: this.userName,
          Code: resp,
        });

        this.Answers = new Array<string>(this.pqa.Questions?.length || 0).fill('');
      }
    } catch (e) {
      throw e;
    } finally {
      this.captchaSvc.ReinitCaptcha();
      this.busyService.hide();
    }
  }

  /**
   * Creates new session and logs in user in case of a correct answer.
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
        Module: 'RoleBasedPasswordReset',
        User: this.userName,
        PasswordAnswer: this.pqa?.Questions?.map((q, idx) => q.Uid + '|' + this.Answers[idx]).reduce((x, y) => x + '|' + y) || '',
      });

      if (newSession) {
        await this.authService.processLogin(async () => newSession);
        this.Reset();
        this.router.navigate(['']);
      } else {
        this.LoadQuestions(true);
      }
    } catch (e) {
      // If the login fails, reload questions
      this.LoadQuestions(true);
      throw e;
    } finally {
      this.busyService.hide();
    }
  }

  public trackByFn(index: any, item: any) {
    return index;
  }

  /**
   * Checks if all the loaded answers were answered by the user.
   */
  public AllQuestionsAnswered(): boolean {
    const unanswered = this.Answers ? this.Answers.filter((a) => !a).length : 0;
    return unanswered == 0;
  }

  /**
   * Changes the view to ReCaptcha view and deletes loaded questions and answers.
   */
  public Reset() {
    this.pqa = null;
    this.Answers = [];
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  public LdsKeyCannotLogin =
    '#LDS#You cannot log in using the secret password questions. You have not set up any or not enough password questions and answers. Log in using a different method.';
}
