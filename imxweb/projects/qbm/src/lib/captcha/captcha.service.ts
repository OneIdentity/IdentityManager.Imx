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

import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class CaptchaService {

  constructor() {
    this.ReinitCaptcha();
  }

  private _recaptchaPublicKey: string;

  public get recaptchaPublicKey() { return this._recaptchaPublicKey; }

  /** CAPTCHA response entered by the user. */
  public Response: string = "";

  public builtInUrlParameter: string;

  enableReCaptcha(publicKey: string) {
    throw new Error("not supported");
    this._recaptchaPublicKey = publicKey;
  }

  public get Mode(): CaptchaMode {
    if (this._recaptchaPublicKey)
      return CaptchaMode.RecaptchaV2;

    return CaptchaMode.BuiltIn;
  }

  /** Reinitializes the image to help users who cannot read a particular CAPTCHA, or if an authentication
   * attempt has failed.   */
  ReinitCaptcha() {
    this.Response = "";

    // Add a cache-busting parameter
    this.builtInUrlParameter = '?t=' + new Date().getTime();
  }
}

export enum CaptchaMode {
  BuiltIn,
  RecaptchaV2
}