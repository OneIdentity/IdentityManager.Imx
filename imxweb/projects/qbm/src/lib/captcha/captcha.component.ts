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

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AppConfigService } from '../appConfig/appConfig.service';
import { CaptchaService } from './captcha.service';

@Component({
  selector: 'imx-captcha',
  templateUrl: './captcha.component.html',
  styleUrls: ['./captcha.component.scss'],
})
export class CaptchaComponent {
  /**
   * Disable next button.
   */
  @Input() disableButton: boolean;

  /**
   * Show back button.
   */
  @Input() showBackButton = false;

  /**
   * Show all buttons.
   */
  @Input() showAllButtons = true;

  /**
   * Event emitter for the next button, which should take the user to the next function.
   */
  @Output() nextClick: EventEmitter<boolean> = new EventEmitter();

  @Output() onBackEvent: EventEmitter<void> = new EventEmitter();

  /**
   * Url for One Identity's ReCaptcha image
   */
  builtInCaptchaUrl: string;
  public LdsCaptchaInfo: string = '#LDS#Enter the characters from the image.';

  constructor(
    public readonly captchaSvc: CaptchaService,
    public readonly appConfig: AppConfigService,
  ) {
    this.builtInCaptchaUrl = this.captchaSvc.captchaImageUrl;
  }

  /**
   * Emits an event to the parent component, when the Next button was clicked.
   */
  public onNext() {
    this.nextClick.emit(true);
  }

  /**
   * Emits an event to the parent component, when the Back button was clicked.
   */
  public onBack(): void {
    this.onBackEvent.emit();
  }
}
