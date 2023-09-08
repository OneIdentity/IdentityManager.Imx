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

import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EuiLoadingService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { PersonActivationDto } from 'imx-api-att';
import { AuthenticationService, SessionState, SnackBarService, SplashService } from 'qbm';
import { Subscription } from 'rxjs';
import { ApiService } from '../api.service';

@Component({
  templateUrl: './user-activation.component.html',
  styleUrls: ['./user-activation.component.scss'],
})
export class UserActivationComponent implements OnDestroy {
  public busy = true;
  public data: PersonActivationDto;
  public ldsText: string;
  public hasProblems = false;

  private readonly subscription: Subscription;
  private passcode: string;
  private uidCase: string;

  constructor(
    private readonly attApiService: ApiService,
    private readonly snackbar: SnackBarService,
    route: ActivatedRoute,
    private readonly authService: AuthenticationService,
    private readonly translateService: TranslateService,
    private readonly busyService: EuiLoadingService,
    private readonly splashService: SplashService,
    private readonly router: Router
  ) {
    this.subscription = route.queryParamMap.subscribe(async (params) => {
      this.busy = true;
      try {
        this.uidCase = params.get('aeweb_UID_AttestationCase');
        this.passcode = params.get('aeweb_PassCode');
        if (!this.hasFormat) {
          return;
        }
        this.data = await this.attApiService.client.passwordreset_activation_init_post(this.uidCase);

        // Apply culture
        this.data?.Culture ? this.useCulture(this.data.Culture) : null;
      } catch {
        this.hasProblems = true;
      } finally {
        this.determineText();
        this.splashService.close();
        this.busy = false;
      }
    });
  }

  public get hasFormat(): boolean {
    return !!this.uidCase && !!this.passcode;
  }

  public ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  public async resendMail(): Promise<void> {
    const overlayRef = this.busyService.show();
    try {
      await this.attApiService.client.passwordreset_activation_resendemail_post();
      this.snackbar.open({ key: '#LDS#An email has been sent to your specified email address.' }, '#LDS#Close');
    } catch {
      this.hasProblems = true;
    } finally {
      this.busyService.hide(overlayRef);
    }
  }

  public async confirmEMail(): Promise<void> {
    const overlayRef = this.busyService.show();
    try {
      await this.authService.processLogin(async () => {
        const s = await this.attApiService.client.passwordreset_activation_confirm_post({
          PassCode: this.passcode,
        });
        this.snackbar.open({ key: '#LDS#Your account has been successfully activated.' }, '#LDS#Close');

        // forward to main page
        this.router.navigate(['']);
        return new SessionState(s);
      });
    } finally {
      this.busyService.hide(overlayRef);
    }
  }

  private determineText(): void {
    if (this.data) {
      // We got a response from the server and can show the state of the case
      switch (this.data.ApprovalState) {
        case 0:
          this.ldsText =
            '#LDS#You already have completed the registration process. Please log in with your credentials. If you have forgotten your credentials, ask your manager for a passcode.';
          break;
        case 1:
          this.ldsText =
            '#LDS#Confirm your email address and activate your account or send the confirmation email again (if the passcode has expired) by clicking one of the following buttons.';
          break;
        // What happened to case 2?? Defined by the api and not here
        case 3:
          this.ldsText = '#LDS#Your registration was denied.';
          break;
        default:
          this.ldsText =
            '#LDS#There was an unexpected error. Please try again.';
      }
      return;
    }

    // Here something went wrong and either the params were missing or the server failed
    if (this.hasFormat && this.hasProblems) {
      this.ldsText = '#LDS#This attestation case has already been approved or denied.';
    } else if (this.hasFormat && !this.hasProblems) {
      this.ldsText =
        '#LDS#The registration process could not be completed. Please click "Send confirmation email again" and follow the instructions in the new confirmation email.';
    } else if (!this.hasFormat && !this.hasProblems) {
      this.ldsText =
        '#LDS#The registration process could not be completed. The submitted registration process could not be found. You may already have completed the registration process. Please log in with your credentials. If you have forgotten your credentials, ask your manager for a passcode.';
    }
  }

  private async useCulture(culture: string): Promise<void> {
    this.translateService.setDefaultLang(culture);
    await this.translateService.use(culture).toPromise();
  }
}
