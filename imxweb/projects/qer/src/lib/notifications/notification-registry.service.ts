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

import { OverlayRef } from '@angular/cdk/overlay';
import { Injectable, NgZone } from '@angular/core';
import { NavigationExtras, Params, Router } from '@angular/router';
import { EuiLoadingService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService, ClassloggerService, ConfirmationService, ISessionState } from 'qbm';

type NotificationHandler = { message: string; activate: () => void };
@Injectable({
  providedIn: 'root',
})
export class NotificationRegistryService {
  private isLoggedIn = false;
  constructor(
    private readonly logger: ClassloggerService,
    private readonly busyService: EuiLoadingService,
    private readonly confirmationService: ConfirmationService,
    private readonly authentication: AuthenticationService,
    private readonly router: Router,
    private readonly translate: TranslateService,
    private readonly zone: NgZone,
  ) {
    // register default notifications for QER
    this.registerRedirectNotificationHandler({
      id: 'OpenPWO',
      message: '#LDS#There are new requests that you can approve or deny.',
      route: 'requesthistory',
    });

    this.registerRedirectNotificationHandler({
      id: 'OpenInquiries',
      message: '#LDS#There are new request inquiries.',
      route: 'itshop/approvals',
      routeParameters: { inquiries: true },
    });

    this.register('PermissionChangeNotificationPlugin', {
      message: '#LDS#Your permissions have changed. Log out and log in again for the new permissions to take effect.',
      activate: () => {
        this.logout();
      },
    });

    this.authentication.onSessionResponse.subscribe((session: ISessionState) => (this.isLoggedIn = session.IsLoggedIn ?? false));
  }

  private registry: Map<string, NotificationHandler> = new Map();

  public register(id: string, handler: NotificationHandler): void {
    this.registry.set(id, handler);
  }

  public get(id: string) {
    if (this.registry.has(id)) {
      return this.registry.get(id);
    } else {
      this.logger.warn(this, 'Unknown notification type: ' + id);
      return null;
    }
  }

  registerRedirectNotificationHandler(data: { id: string; message: string; route: string; routeParameters?: Params }) {
    this.register(data.id, {
      message: data.message,
      activate: () => {
        // apply extra route parameters
        const extras: NavigationExtras | undefined = data.routeParameters
          ? {
              queryParams: data.routeParameters,
            }
          : undefined;
        this.router.navigate([data.route], extras);
      },
    });
  }

  /**
   * Logs out and ends the session.
   */
  private async logout() {
    if (!this.isLoggedIn) {
      await this.confirmationService.showMessageBox(
        this.translate.instant('#LDS#Heading Log Out'),
        this.translate.instant('#LDS#You are already logged out.'),
        '',
        async () => {},
      );
      return;
    }

    if (
      await this.confirmationService.confirm({
        Title: '#LDS#Heading Log Out',
        Message: '#LDS#Are you sure you want to log out?',
        identifier: 'confirm-logout-',
      })
    ) {
      let overlayRef: OverlayRef;

      this.zone.run(() => {
        if (this.busyService.overlayRefs.length === 0) {
          this.busyService.show();
        }
      });

      try {
        await this.authentication.logout();
      } finally {
        this.busyService.hide();
      }
    }
  }
}
