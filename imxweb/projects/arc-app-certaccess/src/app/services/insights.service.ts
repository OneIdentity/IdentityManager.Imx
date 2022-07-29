import { Subscription } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';
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
 * Copyright 2022 One Identity LLC.
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
import { ProjectConfig } from 'imx-api-qer';
import { AppInsights } from 'applicationinsights-js';
import { ProjectConfigurationService } from 'qer';
import { OnDestroy } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AppInsightsService implements OnDestroy {
  private routerEvents$: Subscription;

  constructor(private readonly projectConfig: ProjectConfigurationService, private readonly router: Router) {}

  public ngOnDestroy(): void {
    if (this.routerEvents$) {
      this.routerEvents$.unsubscribe();
    }
  }

  public async setup(): Promise<void> {
    const config: ProjectConfig = await this.projectConfig.getConfig();

    if (config.AppInsightsKey && AppInsights.downloadAndSetup) {
      AppInsights.downloadAndSetup({ instrumentationKey: config.AppInsightsKey });

      AppInsights.queue.push(() => {
        AppInsights.context.addTelemetryInitializer((envelope: any) => {
          const telemetryItem = envelope.data.baseData;
          if (typeof screen !== 'undefined') {
            telemetryItem.properties = telemetryItem.properties || {};
            telemetryItem.properties['ai.device.screenResolution'] = screen.width + 'X' + screen.height;
            telemetryItem.properties['ai.device.locale'] = navigator.language || 'unknown';
          }
        });
      });

      this.routerEvents$ = this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          const url = this.sanitiseUrl(window.location.href);
          const path = this.sanitiseUrl(event.urlAfterRedirects);
          // Pass the path as the name and sanitised url
          AppInsights.trackPageView(path, url);
        }
      });
    }
  }

  private sanitiseUrl(url: string): string {
    let returnUrl = url;
    if (url.indexOf('#') > -1) {
      returnUrl = url.substring(0, url.indexOf('#'));
    }
    return returnUrl;
  }
}
