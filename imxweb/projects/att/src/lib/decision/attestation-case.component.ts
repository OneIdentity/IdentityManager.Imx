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

import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { EUI_SIDESHEET_DATA, EuiDownloadOptions, EuiLoadingService, EuiSidesheetRef, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { AttestationRelatedObject, PortalAttestationCaseHistory } from 'imx-api-att';
import { DbObjectKey } from 'imx-qbm-dbts';
import _ from 'lodash';
import {
  AuthenticationService,
  BaseReadonlyCdr,
  ClassloggerService,
  ColumnDependentReference,
  MetadataService,
  SnackBarService,
  SystemInfoService,
} from 'qbm';
import {
  RiskAnalysisSidesheetComponent,
  SourceDetectiveSidesheetComponent,
  SourceDetectiveSidesheetData,
  SourceDetectiveType,
  TermsOfUseViewerComponent,
} from 'qer';
import { AttestationActionService } from '../attestation-action/attestation-action.service';
import { Approvers } from './approvers.interface';
import { AttestationCase } from './attestation-case';
import { AttestationCasesService } from './attestation-cases.service';
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
  public readonly mitigatingControlsPerViolation: boolean;
  public readonly parameters: ColumnDependentReference[];
  public readonly propertyInfo: ColumnDependentReference[];
  public readonly reportType: string;
  public readonly reportDownload: EuiDownloadOptions;
  public readonly approvalThreshold: number;
  public readonly showRecommendation: boolean;
  public canEditMitigationControl: boolean;
  public complianceTabTitle: string;
  public policyTabTitle: string;
  public canAnalyzeRisk = false;
  public isUserEscalationApprover: boolean;
  public selectedHyperviewType: string;
  public selectedHyperviewUID: string;
  public selectedOption: AttestationRelatedObject;
  public relatedOptions: AttestationRelatedObject[] = [];

  private readonly subscriptions$: Subscription[] = [];

  constructor(
    @Inject(EUI_SIDESHEET_DATA)
    public data: {
      case: AttestationCase;
      approvers: Approvers;
      approvalThreshold: number;
      autoRemovalScope: boolean;
      lossPreview: LossPreview;
      mitigatingControlsPerViolation: boolean;
      isInquiry?: boolean;
      isUserEscalationApprover: boolean;
    },
    private readonly sideSheet: EuiSidesheetService,
    private readonly sidesheetRef: EuiSidesheetRef,
    private readonly translate: TranslateService,
    public readonly attestationAction: AttestationActionService,
    private readonly attestationCasesService: AttestationCasesService,
    private readonly dialog: MatDialog,
    private readonly snackbar: SnackBarService,
    private readonly busyService: EuiLoadingService,
    private readonly systemInfoService: SystemInfoService,
    private readonly logger: ClassloggerService,
    private readonly metadataService: MetadataService,
    authentication: AuthenticationService
  ) {
    this.case = data.case;
    this.approvers = data.approvers;
    this.approvalThreshold = data.approvalThreshold;
    this.mitigatingControlsPerViolation = data.mitigatingControlsPerViolation;
    this.isUserEscalationApprover = data.isUserEscalationApprover;
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

    this.subscriptions$.push(this.attestationAction.applied.subscribe(() => this.sidesheetRef.close()));
    this.subscriptions$.push(authentication.onSessionResponse.subscribe((sessionState) => (this.userUid = sessionState?.UserUid)));
  }

  public async ngOnInit(): Promise<void> {
    this.setRelatedOptions();
    const overlay = this.busyService.show();
    try {
      this.complianceTabTitle = await this.translate.get('#LDS#Heading Rule Violations').toPromise();
      this.policyTabTitle = await this.translate.get('#LDS#Heading Policy Violations').toPromise();
      const info = await this.systemInfoService.get();
      this.canAnalyzeRisk = info.PreProps.includes('RISKINDEX') && this.case.RiskIndex.value > 0;
    } finally {
      this.busyService.hide(overlay);
    }
  }

  public ngOnDestroy(): void {
    this.subscriptions$.forEach((s) => s.unsubscribe());
  }

  public async showTermsOfUse(): Promise<void> {
    this.sideSheet.open(TermsOfUseViewerComponent, {
      title: await this.translate.get('#LDS#Heading View Terms of Use').toPromise(),
      subTitle: this.case.GetEntity().GetDisplay(),
      padding: '0px',
      width: '60%',
      icon: 'accesscertification',
      testId: 'attestation-view-terms-of-use',
      data: this.case.UID_QERTermsOfUse,
    });
  }

  public async analyzeRisk(): Promise<void> {
    const key = this.case.ObjectKeyBase.value;
    this.sideSheet.open(RiskAnalysisSidesheetComponent, {
      title: await this.translate.get('#LDS#Heading Analyze Risk').toPromise(),
      subTitle: this.case.GetEntity().GetDisplay(),
      padding: '0px',
      width: 'max(600px,60%)',
      data: { objectKey: key },
    });
  }

  public async editMitigatingControls(): Promise<void> {
    const result = await this.dialog
      .open(MitigatingControlsComponent, {
        width: 'min(700px,50%)',
        autoFocus: false,
        data: {
          column: this.case.MControls.Column,
        },
      })
      .afterClosed()
      .toPromise();

    if (result) {
      const overlay = this.busyService.show();
      try {
        this.case.typedEntity.GetEntity().Commit(true);
      } finally {
        this.busyService.hide(overlay);
        this.snackbar.open({ key: '#LDS#Your changes have been successfully saved.' });
      }
    } else {
      this.case.typedEntity.GetEntity().DiscardChanges();
    }
  }

  public updateButtonInformation(change: MatTabChangeEvent): void {
    this.canEditMitigationControl = this.mitigatingControlsPerViolation && change.tab.textLabel === this.complianceTabTitle;
  }

  public async viewSource() {
    const uidPerson = this.case.UID_Person.value;

    const objectKey = DbObjectKey.FromXml(this.case.ObjectKeyBase.value);

    if (uidPerson == null || objectKey == null) {
      this.logger.log(this, 'Source detective can not be opened, because one of its parameter is null');
      return;
    }

    const data: SourceDetectiveSidesheetData = {
      UID_Person: uidPerson,
      Type: SourceDetectiveType.MembershipOfSystemEntitlement,
      UID: objectKey.Keys.join(','),
      TableName: objectKey.TableName,
    };
    this.sideSheet.open(SourceDetectiveSidesheetComponent, {
      title: await this.translate.get('#LDS#Heading View Assignment Analysis').toPromise(),
      subTitle: this.case.GetEntity().GetDisplay(),
      padding: '0px',
      width: 'max(60%,600px)',
      disableClose: false,
      testId: 'attestation-history-details-assignment-analysis',
      data,
    });
  }

  public async setRelatedOptions(): Promise<void> {
    this.relatedOptions =
      (await Promise.all(
        this.data.case.data?.RelatedObjects.map(async (relatedObject) => {
          const objectType = DbObjectKey.FromXml(relatedObject.ObjectKey);
          if (!this.metadataService.tables[objectType.TableName]) {
            await this.metadataService.updateNonExisting([objectType.TableName]);
          }
          return {
            ObjectKey: relatedObject.ObjectKey,
            Display: `${relatedObject.Display} - ${this.metadataService.tables[objectType.TableName].DisplaySingular}`,
          };
        })
      )) || [];
  }

  public setHyperviewObject(selectedRelatedObject: AttestationRelatedObject): void {
    const dbKey = DbObjectKey.FromXml(selectedRelatedObject.ObjectKey);
    this.selectedHyperviewType = dbKey.TableName;
    this.selectedHyperviewUID = dbKey.Keys.join(',');
  }

  public onHyperviewOptionSelected(): void {
    this.setHyperviewObject(this.selectedOption);
  }

  public onAttestationApprove() {
    this.attestationAction.checkForViolations([_.cloneDeep(this.case)]);
  }
}
