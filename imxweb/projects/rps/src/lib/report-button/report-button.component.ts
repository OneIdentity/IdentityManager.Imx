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

import { Overlay } from '@angular/cdk/overlay';
import { HttpClient } from '@angular/common/http';
import { Component, Injector, OnInit } from '@angular/core';
import { EuiDownloadDirective, EuiDownloadOptions, EuiLoadingService } from '@elemental-ui/core';

import { V2ApiClientMethodFactory } from 'imx-api-rps';
import { MethodDefinition } from 'imx-qbm-dbts';
import { AppConfigService, ElementalUiConfigService, SystemInfoService } from 'qbm';
import { UserModelService } from 'qer';
import { ReportSubscription } from '../subscriptions/report-subscription/report-subscription';
import { ReportSubscriptionService } from '../subscriptions/report-subscription/report-subscription.service';
import { ReportButtonParameter } from './report-button-parameter';

@Component({
  selector: 'imx-report-button',
  templateUrl: './report-button.component.html',
  styleUrls: ['./report-button.component.scss']
})
export class ReportButtonComponent implements OnInit {
  public downloadOptions: EuiDownloadOptions;

  public inputData: ReportButtonParameter;
  public isButtonRendered = true;
  public referrer: any;

  private readonly apiMethodFactory: V2ApiClientMethodFactory = new V2ApiClientMethodFactory();

  constructor(
    private readonly elementalUiConfigService: ElementalUiConfigService,
    private readonly config: AppConfigService,
    private readonly http: HttpClient,
    private readonly injector: Injector,
    private readonly reportSubscriptionService: ReportSubscriptionService,
    private readonly overlay: Overlay,
    private readonly busy: EuiLoadingService,
    private readonly system: SystemInfoService,
    private readonly userModelService: UserModelService,
  ) { }

  public async ngOnInit(): Promise<void> {
    if (this.inputData.groups == null && this.inputData.preprop == null) {
      this.isButtonRendered = true;
      return;
    }
    const over = this.busy.show();
    try {
      const info = await this.system.get();
      const user = (await this.userModelService.getGroups()).map(elem => elem.Name);

      const pre = this.inputData.preprop == null ||
        this.inputData.preprop.some(elem => info.PreProps.find(item => item.toUpperCase() === elem) != null);
      const groups = this.inputData.groups == null ||
        this.inputData.groups.some(elem => user.find(item => item.toUpperCase() === elem) != null);

      this.isButtonRendered = pre && groups;
    } finally {
      this.busy.hide(over);
    }
  }

  public async viewReport(): Promise<void> {
    const over = this.busy.show();
    let subscription: ReportSubscription;

    try {
      subscription = await this.reportSubscriptionService.createNewSubscription(this.inputData.uidReport);
    } finally {
      this.busy.hide(over);
    }
    if (!subscription) { return; }
    subscription.subscription.ExportFormat.value = 'PDF';
    const parameters = subscription.subscription.enrichMethodCallParameters();
    const def = new MethodDefinition(this.apiMethodFactory.portal_subscription_interactive_report_get(parameters.entityid, parameters));

    // not pretty, but the download directive does not support dynamic URLs
    const directive = new EuiDownloadDirective(null /* no element */, this.http, this.overlay, this.injector);
    directive.downloadOptions = {
      ...this.elementalUiConfigService.Config.downloadOptions,
      fileMimeType: '', // override elementalUiConfigService; get mime type from server
      url: this.config.BaseUrl + def.path,
      disableElement: false,
    };
    // start the report download
    directive.onClick();
  }
}
