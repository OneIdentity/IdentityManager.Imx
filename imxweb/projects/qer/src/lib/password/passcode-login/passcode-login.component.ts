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

import { Component, OnInit } from "@angular/core";
import { CaptchaService, AuthenticationService, imx_SessionService, UserMessageService } from 'qbm';
import { Router } from '@angular/router';
import { QerApiService } from "../../qer-api-client.service";
import { EuiLoadingService } from "@elemental-ui/core";
import { OverlayRef } from "@angular/cdk/overlay";

@Component({
	templateUrl: "./passcode-login.component.html",
	styleUrls: ["./passcode-login.component.scss"]
})
export class PasscodeLoginComponent implements OnInit {
	constructor(private readonly authService: AuthenticationService,
		private readonly qerApiService: QerApiService,
		private readonly session: imx_SessionService,
		private router: Router,
		private readonly busyService: EuiLoadingService,
		private readonly messageSvc: UserMessageService,
		public readonly captchaSvc: CaptchaService) { }

	public ngOnInit(): void {
	}

	userName = "";

	passcode = "";

	public isEnteringPasscode = false;

	async MoveToEnterPasscode(noResetMessage?: boolean): Promise<void> {

		if (!noResetMessage) {
			// reset the error message
			this.messageSvc.subject.next(undefined);
		}

		let overlayRef: OverlayRef;
		setTimeout(() => overlayRef = this.busyService.show());
		try {
			// use response code
			const resp = this.captchaSvc.Response;
			this.captchaSvc.Response = "";

			// use this API call to set the CAPTCHA on the server side
			await this.qerApiService.client.passwordreset_passwordquestions_account_post({
				AccountName: this.userName,
				Code: resp
			});

			this.passcode = "";
			this.isEnteringPasscode = true;
		} catch (e) {
			throw e;
		} finally {
			this.captchaSvc.ReinitCaptcha();
			setTimeout(() => this.busyService.hide(overlayRef));
		}
	}

	public async Login(): Promise<void> {
		// reset the error message
		this.messageSvc.subject.next(undefined);
		let overlayRef: OverlayRef;
		setTimeout(() => overlayRef = this.busyService.show());
		try {
			const newSession = await this.session.login({
				__Product: "PasswordReset",
				Module: "Passcode",
				User: this.userName,
				Passcode: this.passcode
			});

			if (newSession) {
				await this.authService.processLogin(async () => newSession);
				this.Reset();
				this.router.navigate(['']);
			}
			else {
				this.MoveToEnterPasscode(true);
			}
		} finally {
			setTimeout(() => this.busyService.hide(overlayRef));
		}
	}

	Reset() {
		this.isEnteringPasscode = false;
	}

	public LdsCaptchaInfo = '#LDS#Please enter the characters from the image.';
}
