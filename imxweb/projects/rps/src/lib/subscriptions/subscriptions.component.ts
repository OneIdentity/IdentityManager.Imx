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

import { OverlayRef } from '@angular/cdk/overlay';
import { Component, OnInit } from '@angular/core';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';

import { PortalSubscription } from 'imx-api-rps';
import { CollectionLoadParameters, DisplayColumns, EntitySchema, ValType } from 'imx-qbm-dbts';
import { ConfirmationService, DataSourceToolbarSettings, ClientPropertyForTableColumns, SnackBarService, BusyService } from 'qbm';
import { ReportSubscription } from './report-subscription/report-subscription';
import { ReportSubscriptionService } from './report-subscription/report-subscription.service';
import { ReportViewConfigComponent } from './report-view-config/report-view-config.component';
import { SubscriptionDetailsComponent } from './subscription-details/subscription-details.component';
import { SubscriptionWizardComponent } from './subscription-wizard/subscription-wizard.component';
import { SubscriptionsService } from './subscriptions.service';
import { ListReportViewerSidesheetComponent } from './list-report-viewer-sidesheet/list-report-viewer-sidesheet.component';
import { ListReportViewerService } from '../list-report-viewer/list-report-viewer.service';

@Component({
  selector: 'imx-subscriptions',
  templateUrl: './subscriptions.component.html',
  styleUrls: ['./subscriptions.component.scss'],
})
export class SubscriptionsComponent implements OnInit {
  public readonly entitySchema: EntitySchema;
  public readonly DisplayColumns = DisplayColumns;
  public dstSettings: DataSourceToolbarSettings;
  public canAddSubscription = false;

  private readonly displayedColumns: ClientPropertyForTableColumns[];

  private navigationState: CollectionLoadParameters = { PageSize: 25, StartIndex: 0 };

  public busyService = new BusyService();

  constructor(
    private readonly subscriptionService: SubscriptionsService,
    private readonly rpsReportService: ReportSubscriptionService,
    private readonly confirmationService: ConfirmationService,
    private readonly sideSheet: EuiSidesheetService,
    private readonly snackbar: SnackBarService,
    private readonly translate: TranslateService,
    private readonly busyServiceElemental: EuiLoadingService,
    private readonly listReportViewerService: ListReportViewerService
  ) {
    this.entitySchema = subscriptionService.PortalSubscriptionSchema;
    this.displayedColumns = [
      this.entitySchema.Columns[DisplayColumns.DISPLAY_PROPERTYNAME],
      {
        ColumnName: 'actions',
        Type: ValType.String,
        afterAdditionals: true,
        untranslatedDisplay: '#LDS#Actions',
      },
    ];
  }

  public async ngOnInit(): Promise<void> {
    const isBusy = this.busyService.beginBusy();
    try {
      this.canAddSubscription = await this.subscriptionService.hasReports();
    } finally {
      isBusy.endBusy();
    }
    await this.navigate();
  }

  public async onNavigationStateChanged(newState: CollectionLoadParameters): Promise<void> {
    this.navigationState = newState;
    await this.navigate();
  }

  public async onSearch(keywords: string): Promise<void> {
    this.navigationState = {
      PageSize: this.navigationState.PageSize,
      StartIndex: 0,
      search: keywords,
    };
    return this.navigate();
  }

  public async sendMail(subscription: PortalSubscription, withCc: boolean): Promise<void> {
    await this.subscriptionService.sendMail(subscription.GetEntity().GetKeys()[0], withCc);
    this.snackbar.open({
      key: withCc ? '#LDS#The report "{0}" will be sent to all subscribers.' : '#LDS#The report "{0}" will be sent to you.',
      parameters: [subscription.UID_RPSReport.Column.GetDisplayValue()],
    });
  }

  public async viewReportSubscription(subscription: PortalSubscription): Promise<void> {
    let reportSub;
    const over = this.busyServiceElemental.show();
    try {
      const sub = await this.subscriptionService.getSubscriptionInteractive(subscription.GetEntity().GetKeys()[0]);
      reportSub = await this.rpsReportService.buildRpsSubscription(sub.Data[0]);
    } finally {
      this.busyServiceElemental.hide(over);
    }
    if (!reportSub) {
      return;
    }
    this.listReportViewerService.setUidReport(subscription.UID_RPSReport.value);
    const data = { dataService: this.listReportViewerService, subscription: reportSub };
    this.sideSheet.open(ListReportViewerSidesheetComponent, {
      title: await this.translate.get('#LDS#Heading View Report').toPromise(),
      subTitle: subscription.GetEntity().GetDisplay(),
      padding: '0',
      width: 'max(550px,55%)',
      testId: 'subscription-report-viewer',
      data,
    });
  }

  public async delete(subscription: PortalSubscription): Promise<void> {
    if (
      await this.confirmationService.confirm({
        Title: '#LDS#Heading Unsubscribe Report',
        Message: '#LDS#Do you want to unsubscribe from this report?',
        identifier: 'subscriptions-confirm-unsubscribe-report',
      })
    ) {
      let overlayRef: OverlayRef;
      setTimeout(() => (overlayRef = this.busyServiceElemental.show()));
      try {
        await this.subscriptionService.deleteSubscription(subscription.GetEntity().GetKeys()[0]);
      } finally {
        setTimeout(() => this.busyServiceElemental.hide(overlayRef));
      }
      const message = {
        key: '#LDS#You have successfully unsubscribed from the report "{0}".',
        parameters: [subscription.GetEntity().GetDisplay()],
      };

      this.navigate();
      this.snackbar.open(message);
    }
  }

  public async editSubscription(subscription: PortalSubscription): Promise<void> {
    let rpsSubscription: ReportSubscription;
    let overlayRef: OverlayRef;
    setTimeout(() => (overlayRef = this.busyServiceElemental.show()));
    try {
      const sub = await this.subscriptionService.getSubscriptionInteractive(subscription.GetEntity().GetKeys()[0]);
      if (sub.Data.length > 0) {
        rpsSubscription = this.rpsReportService.buildRpsSubscription(sub.Data[0]);
      }
    } finally {
      setTimeout(() => this.busyServiceElemental.hide(overlayRef));
    }

    if (rpsSubscription) {
      const sidesheetRef = this.sideSheet.open(SubscriptionDetailsComponent, {
        title: await this.translate.get('#LDS#Heading Edit Subscription').toPromise(),
        subTitle: subscription.GetEntity().GetDisplay(),
        testId: 'edit-subscription-sidesheet',
        padding: '0px',
        width: 'max(700px,70%)',
        disableClose: true,
        data: rpsSubscription,
      });

      if (await sidesheetRef.afterClosed().toPromise()) {
        return this.navigate();
      }
    }
  }

  public async createSubscription(): Promise<void> {
    const sidesheetRef = this.sideSheet.open(SubscriptionWizardComponent, {
      title: await this.translate.get('#LDS#Heading Add Report Subscription').toPromise(),
      padding: '0px',
      width: '70%',
      disableClose: true,
      testId: 'subscriptions-create',
    });

    if (await sidesheetRef.afterClosed().toPromise()) {
      this.snackbar.open({ key: '#LDS#The subscription has been successfully created.' });

      return this.navigate();
    }
  }

  public async viewReport(): Promise<void> {
    const sidesheetRef = this.sideSheet.open(ReportViewConfigComponent, {
      title: await this.translate.get('#LDS#Heading View a Report').toPromise(),
      padding: '0px',
      width: '70%',
      testId: 'subscriptions-view-config',
    });

    if (await sidesheetRef.afterClosed().toPromise()) {
      this.snackbar.open({ key: '#LDS#The subscription has been successfully created.' });

      return this.navigate();
    }
  }

  private async navigate(): Promise<void> {
    const isBusy = this.busyService.beginBusy();
    try {
      const subscriptions = await this.subscriptionService.getSubscriptions(this.navigationState);

      this.dstSettings = {
        displayedColumns: this.displayedColumns,
        dataSource: subscriptions,
        entitySchema: this.entitySchema,
        navigationState: this.navigationState,
      };
    } finally {
      isBusy.endBusy();
    }
  }
}
