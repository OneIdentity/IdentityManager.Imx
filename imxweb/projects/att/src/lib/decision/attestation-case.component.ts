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

import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { EuiDownloadOptions, EuiSidesheetConfig, EuiSidesheetRef, EuiSidesheetService, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { Subscription } from 'rxjs';

import { AuthenticationService, BaseReadonlyCdr, ColumnDependentReference, TabControlHelper } from 'qbm';
import { AttestationActionService } from '../attestation-action/attestation-action.service';
import { AttestationCase } from './attestation-case';
import { AttestationCasesService } from './attestation-cases.service';
import { Approvers } from './approvers.interface';
import { PortalAttestationCaseHistory } from 'imx-api-att';
import { AttestationSnapshotComponent } from '../attestation-snapshot/attestation-snapshot.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  templateUrl: './attestation-case.component.html',
  selector: 'imx-attestation-case',
  styleUrls: ['./attestation-case.component.scss']
})
export class AttestationCaseComponent implements OnDestroy, OnInit {
  public userUid: string;

  public readonly case: AttestationCase;
  public readonly approvers: Approvers;
  public readonly workflowHistoryData: PortalAttestationCaseHistory[];
  public readonly parameters: ColumnDependentReference[];
  public readonly propertyInfo: ColumnDependentReference[];
  public readonly reportType: string;
  public readonly reportDownload: EuiDownloadOptions;
  public readonly approvalThreshold: number;
  public readonly showRecommendation: boolean;

  private readonly subscriptions: Subscription[] = [];

  constructor(
    @Inject(EUI_SIDESHEET_DATA) data: {
      case: AttestationCase,
      approvers: Approvers,
      approvalThreshold: number
    },
    private readonly sideSheet: EuiSidesheetService,
    private readonly sideSheetRef: EuiSidesheetRef,
    private readonly translate: TranslateService,
    public readonly attestationAction: AttestationActionService,
    private readonly attestationCasesService: AttestationCasesService,
    authentication: AuthenticationService
  ) {
    this.case = data.case;
    this.approvers = data.approvers;
    this.approvalThreshold = data.approvalThreshold;

    this.workflowHistoryData = this.attestationCasesService.createHistoryTypedEntities(this.case.data).Data;

    this.showRecommendation = data.approvalThreshold != null &&
      (data.case.PeerGroupFactor.value != null && data.case.PeerGroupFactor.value !== -1) &&
      this.workflowHistoryData.some(item => item.Ident_PWODecisionStep.value === 'EXWithPeerGroupAnalysis');

    this.parameters = this.case.attestationParameters.map(column => new BaseReadonlyCdr(column));

    this.propertyInfo = this.case.propertyInfo;
    this.reportType = this.case.ReportType.value;

    this.reportDownload = this.attestationCasesService.getReportDownloadOptions(this.case);

    this.subscriptions.push(this.attestationAction.applied.subscribe(() => this.sideSheetRef.close()));
    this.subscriptions.push(authentication.onSessionResponse.subscribe(sessionState => this.userUid = sessionState?.UserUid));
  }

  public ngOnInit(): void {
    /**
     * Resolve an issue where the mat-tab navigation arrows could appear on first load
     */
    setTimeout(() => { TabControlHelper.triggerResizeEvent(); });
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  public async viewSnapshot(): Promise<void> {
      const opts: EuiSidesheetConfig = {
        title: await this.translate.get('#LDS#Heading View More Details').toPromise(),
        bodyColour: 'asher-gray',
        headerColour: 'purple',
        padding: '1em',
        width: '60%',
        icon: 'reports',
        data: {
          uidCase: this.case.key,
          date: this.case.GetEntity().GetColumn('XDateInserted').GetDisplayValue()
        },
      };
    this.sideSheet.open(AttestationSnapshotComponent, opts);
  }
}
