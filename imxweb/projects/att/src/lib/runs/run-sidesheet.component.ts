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
import { Component, Inject } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { EuiLoadingService, EuiSidesheetRef, EuiSidesheetService, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { EuiDownloadOptions } from '@elemental-ui/core';
import { Subscription } from 'rxjs';

import { CompareOperator, FilterType, TypedEntityCollectionData } from 'imx-qbm-dbts';
import { PortalAttestationRun, PortalAttestationRunApprovers, RunStatisticsConfig } from 'imx-api-att';
import { SnackBarService } from 'qbm';

import { RunsService } from './runs.service';
import { percentage } from './helpers';
import { RunExtendComponent } from './run-extend/run-extend.component';
import { AttestationActionService } from '../attestation-action/attestation-action.service';
import { AttestationHistoryActionService } from '../attestation-history/attestation-history-action.service';
import { AttestationCaseLoadParameters } from '../attestation-history/attestation-case-load-parameters.interface';
import { HelperAlertContent } from 'qer';

@Component({
  templateUrl: './run-sidesheet.component.html',
  styleUrls: ['./run-sidesheet.component.scss']
})
export class RunSidesheetComponent {
  public readonly run: PortalAttestationRun;
  public readonly attestationRunConfig: RunStatisticsConfig;
  public readonly reportDownload: EuiDownloadOptions;

  public readonly threshold: number;

  public approvers: TypedEntityCollectionData<PortalAttestationRunApprovers>;
  public readonly attestationParameters: AttestationCaseLoadParameters;
  public readonly pendingAttestations: HelperAlertContent = { loading: false };

  private readonly subscriptions: Subscription[] = [];

  public get categoryExplanation(): { message: string; limit?: number } {
    if (this.run.DueDate.value == null) {
      return { message: '#LDS#This attestation run is categorized as good because it has no due date.' };
    }

    if (this.runsService.isOverdue(this.run)) {
      return { message: '#LDS#This attestation run is categorized as bad because it is already overdue.' };
    }

    if (this.attestationRunConfig) {
      if (this.run.ForecastProgress.value <= this.attestationRunConfig.LimitBad) {
        return {
          message: '#LDS#This attestation run is categorized bad because the progress on the due date is estimated to be no more than {0}%.',
          limit: percentage(this.attestationRunConfig.LimitBad)
        };
      }

      if (this.run.ForecastProgress.value <= this.attestationRunConfig.LimitGood) {
        return {
          message: '#LDS#This attestation run is categorized as mediocre because the progress on the due date is estimated to be no more than {0}%.',
          limit: percentage(this.attestationRunConfig.LimitGood)
        };
      }

      return {
        message: '#LDS#This attestation run is categorized as good because the progress on the due date is estimated to be more than {0}%.',
        limit: percentage(this.attestationRunConfig.LimitGood)
      };
    }

    return { message: '' };
  }

  constructor(
    @Inject(EUI_SIDESHEET_DATA) public readonly data: {
      run: PortalAttestationRun,
      attestationRunConfig: RunStatisticsConfig,
      canSeeAttestationPolicies: boolean,
      threshold: number,
      completed: boolean
    },
    public readonly runsService: RunsService,
    private readonly snackBarService: SnackBarService,
    private readonly sideSheet: EuiSidesheetService,
    private readonly translate: TranslateService,
    private readonly busyService: EuiLoadingService,
    private readonly sideSheetRef: EuiSidesheetRef,
    private readonly action: AttestationActionService,
    attestationAction: AttestationHistoryActionService
  ) {
    this.run = this.data.run;
    this.attestationRunConfig = this.data.attestationRunConfig;
    this.threshold = data.threshold;
    this.subscriptions.push(
      attestationAction.applied?.subscribe(() => this.updatePendingAttestations())
    );

    this.reportDownload = runsService.getReportDownloadOptions(this.run);
    this.attestationParameters = {
      filter: [{
        CompareOp: CompareOperator.Equal,
        Type: FilterType.Compare,
        ColumnName: 'UID_AttestationRun',
        Value1: this.run.GetEntity().GetKeys()[0]
      },{
        CompareOp: CompareOperator.Equal,
        Type: FilterType.Compare,
        ColumnName: 'UID_AttestationPolicy',
        Value1: this.run.UID_AttestationPolicy.value
      }]
    };
  }

  public async extendAttestationRun(): Promise<void> {
    const data = {
      ProlongateUntil: this.run.DueDate.value,
      reason: this.action.createCdrReason({ display: '#LDS#Reason', mandatory: true })
    };

    const result = await this.sideSheet.open(
      RunExtendComponent,
      {
        title: await this.translate.get('#LDS#Heading Extend Attestation Run').toPromise(),
        subTitle: this.run.GetEntity().GetDisplay(),
        padding: '0px',
        width: '600px',
        testId: 'attestationruns-extendrun-sidesheet',
        data
      }
    ).afterClosed().toPromise();

    if (result) {
      let overlayRef: OverlayRef;
      setTimeout(() => overlayRef = this.busyService.show());

      let success: boolean;

      try {
        await this.runsService.extendRun(this.run, {
          ProlongateUntil: data.ProlongateUntil,
          Reason: data.reason.column.GetValue()
        });
        success = true;
      } finally {
        if (success) {
          this.snackBarService.open({ key: '#LDS#The attestation run has been successfully extended.' });
        }
        setTimeout(() => this.busyService.hide(overlayRef));
        this.sideSheetRef.close(true);
      }
    }
  }

  public async onTabChange(event: MatTabChangeEvent): Promise<void> {
    if (event.index === 1) {
      let overlayRef: OverlayRef;
      setTimeout(() => overlayRef = this.busyService.show());

      try {
        this.approvers = await this.runsService.getApprovers(this.run);
      } finally {
        setTimeout(() => this.busyService.hide(overlayRef));
      }
    }
    if (event.index === 2) {
      let overlayRef: OverlayRef;
      setTimeout(() => overlayRef = this.busyService.show());
      try {
        this.updatePendingAttestations();
      } finally {
        setTimeout(() => this.busyService.hide(overlayRef));
      }
    }
  }

  public cancel(): void {
    this.sideSheetRef.close();
  }

  private async updatePendingAttestations(): Promise<void> {
    this.pendingAttestations.loading = true;

    const total = this.run.ClosedCases.value + this.run.PendingCases.value;

    if (total === 0) {
      this.pendingAttestations.infoItems = [
        { description: '#LDS#There are currently no attestation cases for this attestation run.' }
      ];
    } else {
      const statistics = {
        pendingTotal: this.run.PendingCases.value,
        pendingForUser: await this.runsService.getNumberOfPendingForLoggedInUser(this.attestationParameters)
      };

      this.pendingAttestations.infoItems = [
        { description: '#LDS#Here you can get an overview of all attestation cases in this attestation run.' },
        { description: '#LDS#Pending attestation cases: {0}', value: statistics.pendingTotal },
        { description: '#LDS#Pending attestation cases you can approve or deny: {0}', value: statistics.pendingForUser }
      ];
    }

    this.pendingAttestations.loading = false;
  }
}
