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

import { Component, OnDestroy } from '@angular/core';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';

import { calculateSidesheetWidth, SnackBarService } from 'qbm';
import { ReportSubscription } from '../subscriptions/report-subscription/report-subscription';
import { ReportSubscriptionService } from '../subscriptions/report-subscription/report-subscription.service';
import { ParameterSidesheetComponent } from './parameter-sidesheet/parameter-sidesheet.component';

@Component({
  templateUrl: './report-button-mail.component.html',
  styleUrls: ['./report-button-mail.component.scss'],
})
export class ReportButtonMailComponent implements OnDestroy {
  public referrer: { uid: string; presetParameters: { [key: string]: string } };

  private subscription: ReportSubscription | undefined;

  constructor(
    private readonly reportSubscriptionService: ReportSubscriptionService,
    private readonly busy: EuiLoadingService,
    private readonly sideSheet: EuiSidesheetService,
    private readonly translator: TranslateService,
    private readonly snackbarService: SnackBarService,
  ) {}

  public ngOnDestroy(): void {
    this.subscription?.unsubscribeEvents;
  }

  public async sendReport(): Promise<void> {
    let over = this.busy.show();

    try {
      if (this.subscription != null) {
        this.subscription.unsubscribeEvents();
        this.subscription = undefined;
      }
      this.subscription = await this.reportSubscriptionService.createNewSubscription(this.referrer.uid, Date.now().toFixed());
    } finally {
      this.busy.hide(over);
    }
    if (!this.subscription) {
      return;
    }

    this.subscription.subscription.ExportFormat.value = 'PDF';

    if (this.hasParametersToCompleteByUser()) {
      const result = await this.sideSheet
        .open(ParameterSidesheetComponent, {
          title: await this.translator.get('#LDS#Heading Specify Parameters').toPromise(),
          padding: '0px',
          width: calculateSidesheetWidth(),
          testId: 'report-button-view-parameter-sidesheet',
          data: { subscription: this.subscription, presetParameter: this.referrer?.presetParameters },
        })
        .afterClosed()
        .toPromise();

      if (!result) {
        return;
      }
    }

    let errors = false;
    over = this.busy.show();
    try {
      await this.subscription.submit();
      await this.reportSubscriptionService.sendViaMail(this.subscription.subscription.GetEntity().GetKeys()[0]);
    } catch {
      errors = true;
    } finally {
      this.busy.hide(over);
      if (!errors) {
        this.snackbarService.open({
          key: '#LDS#The report "{0}" will be sent to you.',
          parameters: [this.subscription.subscription.UID_RPSReport.Column.GetDisplayValue()],
        });
      }
    }
  }

  private hasParametersToCompleteByUser(): boolean {
    if (!this.referrer?.presetParameters) {
      return this.subscription?.hasParameter || false;
    }

    const presetParameter = Object.entries(this.referrer.presetParameters).map((elem) => elem[0]);

    return !!this.subscription?.parameterNames.filter((elem) => presetParameter.indexOf(elem) === -1);
  }
}
