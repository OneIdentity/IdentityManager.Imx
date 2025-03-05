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

import { Component, ElementRef, OnInit, SecurityContext, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { QpmIntegrationLinks } from 'imx-api-qer';
import { ProjectConfigurationService } from '../project-configuration/project-configuration.service';
import { QerApiService } from '../qer-api-client.service';

@Component({
  templateUrl: './qpm-integration.component.html',
  styleUrls: ['./qpm-integration.component.scss'],
})
export class QpmIntegrationComponent implements OnInit {
  @ViewChild('passwordLink') private passwordLink: ElementRef;
  @ViewChild('qaLink') private qaLink: ElementRef;
  @ViewChild('alterLink') private alertLink: ElementRef;

  constructor(
    private readonly qerApiService: QerApiService,
    private readonly projConfig: ProjectConfigurationService,
    private readonly sanitizer: DomSanitizer
  ) {}

  dataReady: boolean;
  links: QpmIntegrationLinks;
  profileText =
    '#LDS#Configure your personal Questions and Answers profile that will allow you to reset your forgotten password or unlock your account in the future.';
  alertText = '#LDS#Select events that you want to be notified about, such as when your password was changed or your account was locked.';

  ngOnInit() {
    this.projConfig.getConfig().then((config) => {
      if (config.PasswordConfig.QpmBaseUrl) {
        this.qerApiService.client.portal_password_qpmlinks_get().then((links) => {
          this.links = links;
          this.dataReady = true;
          this.passwordLink.nativeElement.href = this.sanitizeUrl(this.links.ChangePassword || '');
          this.qaLink.nativeElement.href = this.sanitizeUrl(this.links.EditProfile || '');
          this.alertLink.nativeElement.href = this.sanitizeUrl(this.links.ChangeSettings || '');
        });
      } else {
        this.dataReady = true;
      }
    });
  }

  private sanitizeUrl(url: string): string {
    return this.sanitizer.sanitize(SecurityContext.URL, url)!;
  }
}
