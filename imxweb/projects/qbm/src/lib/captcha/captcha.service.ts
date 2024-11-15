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

import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CaptchaService {
  private _recaptchaPublicKey: string;

  /** CAPTCHA response entered by the user. */
  public Response: string = '';

  /**
   * Url parameter for One Identity's ReCaptcha
   */
  public builtInUrlParameter: string;

  /**
   * Url parameter for captcha image.
   */
  public captchaImageUrl: string;

  /**
   * This variable holds the public key for ReCaptcha V3.
   * The ReCaptchaPublicKey can be set in Password Reset Portal config.
   */
  public get recaptchaPublicKey(): string {
    return this._recaptchaPublicKey;
  }

  /**
   * Holds a CaptchaMode based on if the user has recaptchaPublicKey or not.
   */
  public get Mode(): CaptchaMode {
    if (this.recaptchaPublicKey) return CaptchaMode.RecaptchaV3;

    return CaptchaMode.BuiltIn;
  }

  /**
   * True if One Identity's ReCaptcha is enabled
   */
  public get isBuiltIn(): boolean {
    return this.Mode === CaptchaMode.BuiltIn;
  }

  /**
   * True if ReCaptchaV3 is enabled
   */
  public get isReCaptchaV3(): boolean {
    return this.Mode === CaptchaMode.RecaptchaV3;
  }

  constructor() {
    this.ReinitCaptcha();
  }

  /**
   * Enables Google's ReCaptcha V3 function.
   * @param publicKey Google ReCaptcha's public key, provided by Password Reset Portal's config.
   */
  public enableReCaptcha(publicKey: string) {
    this._recaptchaPublicKey = publicKey;
  }

  /** Reinitializes the image to help users who cannot read a particular CAPTCHA, or if an authentication
   * attempt has failed.   */
  public ReinitCaptcha() {
    this.Response = '';

    // Add a cache-busting parameter
    this.builtInUrlParameter = '?t=' + new Date().getTime();
  }
}

export enum CaptchaMode {
  BuiltIn,
  RecaptchaV2,
  RecaptchaV3,
}
