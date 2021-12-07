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

import { Component } from '@angular/core';
import { EuiLoadingService } from '@elemental-ui/core';

import { AuthenticationService, imx_SessionService } from 'qbm';
import { StarlingService } from './starling.service';

@Component({
  templateUrl: './starling.component.html',
  styleUrls: ['./starling.component.scss']
})
export class StarlingComponent {
  public code: string;

  constructor(private readonly authentication: AuthenticationService,
    private readonly busyService: EuiLoadingService,
    private readonly session: imx_SessionService,
    private readonly starling: StarlingService) { }

  public get errorMessage() {
    return this.session.SessionState?.SecondaryErrorMessage;
  }

  public async SendSms(): Promise<void> {
    const overlayRef = this.busyService.show();
    try {
      await this.starling.sendSms();
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
  }

  public async SendCall(): Promise<void> {
    const overlayRef = this.busyService.show();
    try {
      await this.starling.sendCall();
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
  }

  public async SendPush(): Promise<void> {
    const overlayRef = this.busyService.show();
    try {
      await this.starling.sendPush();
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
  }

  public async Verify(): Promise<void> {
    const overlayRef = this.busyService.show();
    try {
      await this.starling.verify(this.code);
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
  }

  public async Logout(): Promise<void> {
    const overlayRef = this.busyService.show();
    try {
      await this.authentication.logout();
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
  }
}
