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
import { Router, Route } from '@angular/router';
import { DynamicMethodService, ExtService, TabItem } from 'qbm';
import { RequestableEntitlementType, RequestableEntitlementTypeService } from 'qer';
import { ReportButtonParameter } from './report-button/report-button-parameter';
import { ReportButtonComponent } from './report-button/report-button.component';
import { RpsApiService } from './rps-api-client.service';
import { SubscriptionsComponent } from './subscriptions/subscriptions.component';


@Injectable({ providedIn: 'root' })
export class InitService {
  constructor(
    private readonly router: Router,
    private readonly entlTypeService: RequestableEntitlementTypeService,
    private readonly apiService: RpsApiService,
    private readonly dynamicMethodService: DynamicMethodService,
    private readonly extService: ExtService
  ) {
  }

  public onInit(routes: Route[]): void {
    this.addRoutes(routes);
    this.extService.register('profile', {
      instance: SubscriptionsComponent,
      inputData: {
        id: 'subscriptions',
        label: '#LDS#Heading Report Subscriptions',
        checkVisibility: async _ => true
      },
      SortOrder: 0
    } as TabItem);

    const inputData: ReportButtonParameter = {
      uidReport: 'CPL-77d3c04ac2084a968433ef7daf7e56ff',
        caption: '#LDS#Download report on rule violations by identities who report directly to you',
        preprop: ['COMPLIANCE'],
        groups: ['VI_4_ALLMANAGER']
    };
    this.extService.register('identityReports', {
      instance: ReportButtonComponent,
      inputData
    });

    this.entlTypeService.Register(async () => [
      new RequestableEntitlementType('RPSReport',
        this.apiService.apiClient,
        'UID_RPSReport',
        this.dynamicMethodService)
    ]);
  }

  private addRoutes(routes: Route[]): void {
    const config = this.router.config;
    routes.forEach(route => {
      config.unshift(route);
    });
    this.router.resetConfig(config);
  }
}
