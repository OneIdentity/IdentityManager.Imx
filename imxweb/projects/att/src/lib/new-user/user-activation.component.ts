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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EuiLoadingService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { PersonActivationDto } from 'imx-api-att';
import { AuthenticationService, SessionState, SnackBarService } from 'qbm';
import { Subscription } from 'rxjs';
import { ApiService } from '../api.service';

@Component({
	templateUrl: './user-activation.component.html',
	styleUrls: ['./user-activation.component.scss']
})
export class UserActivationComponent implements OnInit, OnDestroy {

	public missingCase = true;

	public busy = true;

	public data: PersonActivationDto;

	public LdsConfirmationText = '#LDS#Confirm your email address and activate your account or send the confirmation email again (if the passcode has expired) by clicking one of the following buttons.';

	public LdsAlreadyCompleted = '#LDS#You already have completed the registration process. Please log in with your credentials. If you have forgotten your credentials, ask your manager for a passcode.';

	public LdsRegistrationDenied = '#LDS#Your registration was denied.';

	public LdsCompletionFailed = '#LDS#The registration process could not be completed. The submitted registration process could not be found. You may already have completed the registration process. Please log in with your credentials. If you have forgotten your credentials, ask your manager for a passcode.';

	public LdsResendEmail = '#LDS#The registration process could not be completed. Please click "Send confirmation email again" and follow the instructions in the new confirmation email.';

	public LdsSendAgain = '#LDS#Send confirmation email again';
	private readonly _subscription: Subscription;
	private passcode: string;
	constructor(private readonly attApiService: ApiService,
		           private readonly snackbar: SnackBarService,
		           route: ActivatedRoute,
		           private readonly authService: AuthenticationService,
		           private readonly translateService: TranslateService,
		           private readonly busyService: EuiLoadingService,
		           private readonly router: Router
	) {
		this._subscription = route.queryParamMap.subscribe(async p => {
			this.busy = true;
			try {
				const uidCase = p.get('aeweb_UID_AttestationCase');
				if (this.missingCase = !uidCase) {
					return;
				}
				this.passcode = p.get('aeweb_PassCode');
				this.data = await this.attApiService.client.passwordreset_activation_init_post(uidCase);

				const preferredCulture = this.data.Culture;
				if (preferredCulture) {
					// apply preferred culture
					this.useCulture(preferredCulture);
				}
			} finally {
				this.busy = false;
			}
		});
	}

	public ngOnDestroy(): void {
		this._subscription?.unsubscribe();
	}

	public async ngOnInit(): Promise<void> {
	}

	public async ReSendMail(): Promise<void> {
		const overlayRef = this.busyService.show();
		try {
			await this.attApiService.client.passwordreset_activation_resendemail_post();
			this.snackbar.open({ key: '#LDS#An email has been sent to your specified email address.' }, '#LDS#Close');
		} finally {
			this.busyService.hide(overlayRef);
		}
	}

	public async ConfirmEMail(): Promise<void> {
		const overlayRef = this.busyService.show();
		try {
			await this.authService.processLogin(async () => {
				const s = await this.attApiService.client.passwordreset_activation_confirm_post({
					PassCode: this.passcode
				});
				return new SessionState(s);
			});
			this.snackbar.open({ key: '#LDS#Your account has been successfully activated.' }, '#LDS#Close');

			// forward to main page
			this.router.navigate(['']);
		} finally {
			this.busyService.hide(overlayRef);
		}
	}

	private async useCulture(culture: string): Promise<void> {
		this.translateService.setDefaultLang(culture);
		await this.translateService.use(culture).toPromise();
	}
}
