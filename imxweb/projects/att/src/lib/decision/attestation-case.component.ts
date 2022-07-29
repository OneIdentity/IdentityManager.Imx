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

import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { EuiDownloadOptions, EuiLoadingService, EuiSidesheetConfig, EuiSidesheetRef, EuiSidesheetService, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { Subscription } from 'rxjs';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { MatDialog } from '@angular/material/dialog';

import { AuthenticationService, BaseReadonlyCdr, ColumnDependentReference, SnackBarService, TabControlHelper } from 'qbm';
import { AttestationActionService } from '../attestation-action/attestation-action.service';
import { AttestationCase } from './attestation-case';
import { AttestationCasesService } from './attestation-cases.service';
import { Approvers } from './approvers.interface';
import { PortalAttestationCaseHistory } from 'imx-api-att';
import { AttestationSnapshotComponent } from '../attestation-snapshot/attestation-snapshot.component';
import { TranslateService } from '@ngx-translate/core';
import { LossPreview } from './loss-preview.interface';
import { MitigatingControlsComponent } from './mitigating-controls/mitigating-controls.component';


@Component({
  templateUrl: './attestation-case.component.html',
  selector: 'imx-attestation-case',
  styleUrls: ['./attestation-case.component.scss'],
})
export class AttestationCaseComponent implements OnDestroy, OnInit {
  public userUid: string;

  public readonly case: AttestationCase;
  public readonly approvers: Approvers;
  public readonly workflowHistoryData: PortalAttestationCaseHistory[];
  public readonly lossPreview: LossPreview;
  public readonly mitigatingControlsPerViolation: boolean;
  public readonly showLosses: boolean;
  public readonly parameters: ColumnDependentReference[];
  public readonly propertyInfo: ColumnDependentReference[];
  public readonly reportType: string;
  public readonly reportDownload: EuiDownloadOptions;
  public readonly approvalThreshold: number;
  public readonly showRecommendation: boolean;
  public canEditMitigationControl: boolean;
  public complianceTabTitle: string;

  private readonly subscriptions: Subscription[] = [];

  constructor(
    @Inject(EUI_SIDESHEET_DATA)
    data: {
      case: AttestationCase;
      approvers: Approvers;
      approvalThreshold: number;
      autoRemovalScope: boolean;
      lossPreview: LossPreview;
      mitigatingControlsPerViolation: boolean;
    },
    private readonly sideSheet: EuiSidesheetService,
    private readonly sideSheetRef: EuiSidesheetRef,
    private readonly translate: TranslateService,
    public readonly attestationAction: AttestationActionService,
    private readonly attestationCasesService: AttestationCasesService,
    private readonly dialog: MatDialog,
    private readonly snackbar: SnackBarService,
    private readonly busyService: EuiLoadingService,
    authentication: AuthenticationService
  ) {
    this.case = data.case;
    this.approvers = data.approvers;
    this.approvalThreshold = data.approvalThreshold;
    this.mitigatingControlsPerViolation = data.mitigatingControlsPerViolation;
    this.lossPreview = data.lossPreview;
    this.showLosses = data.lossPreview.LossPreviewItems.length > 0 && data.autoRemovalScope;
    this.workflowHistoryData = this.attestationCasesService.createHistoryTypedEntities(this.case.data).Data;

    this.showRecommendation =
      data.approvalThreshold != null &&
      data.case.PeerGroupFactor.value != null &&
      data.case.PeerGroupFactor.value !== -1 &&
      this.workflowHistoryData.some((item) => item.Ident_PWODecisionStep.value === 'EXWithPeerGroupAnalysis');

    this.parameters = this.case.attestationParameters.map((column) => new BaseReadonlyCdr(column));

    this.propertyInfo = this.case.propertyInfo;
    this.reportType = this.case.ReportType.value;

    this.reportDownload = this.attestationCasesService.getReportDownloadOptions(this.case);

    this.subscriptions.push(this.attestationAction.applied.subscribe(() => this.sideSheetRef.close()));
    this.subscriptions.push(authentication.onSessionResponse.subscribe((sessionState) => (this.userUid = sessionState?.UserUid)));
  }

  public async ngOnInit(): Promise<void> {
    /**
     * Resolve an issue where the mat-tab navigation arrows could appear on first load
     */
    setTimeout(() => {
      TabControlHelper.triggerResizeEvent();
    });

    this.complianceTabTitle = await this.translate.get('#LDS#Heading Compliance Violations').toPromise();
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
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
        date: this.case.GetEntity().GetColumn('XDateInserted').GetDisplayValue(),
      },
    };
    this.sideSheet.open(AttestationSnapshotComponent, opts);
  }

  public async editMitigatingControls(): Promise<void> {
    const result = await this.dialog.open(MitigatingControlsComponent, {
      width: 'min(700px,50%)',
      autoFocus: false,
      data: {
        column: this.case.MControls.Column
      }
    }).afterClosed().toPromise();

    if (result) {
      const overlay = this.busyService.show();
      try{
        this.case.typedEntity.GetEntity().Commit(true);
      } finally {
        this.busyService.hide(overlay);
        this.snackbar.open({key: '#LDS#Your changes have been successfully saved.'});
      }
    } else {
      this.case.typedEntity.GetEntity().DiscardChanges();
    }
  }

  public updateButtonInformation(change: MatTabChangeEvent): void {
    this.canEditMitigationControl = this.mitigatingControlsPerViolation && change.tab.textLabel === this.complianceTabTitle;
  }
}
