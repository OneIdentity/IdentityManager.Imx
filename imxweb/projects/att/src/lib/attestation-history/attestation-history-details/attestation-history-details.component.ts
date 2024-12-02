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

import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { EUI_SIDESHEET_DATA, EuiDownloadOptions, EuiSidesheetRef, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { AttestationRelatedObject, PortalAttestationCaseHistory } from '@imx-modules/imx-api-att';
import { DbObjectKey } from '@imx-modules/imx-qbm-dbts';
import { AuthenticationService, BaseReadonlyCdr, ColumnDependentReference, MetadataService, calculateSidesheetWidth } from 'qbm';
import { SourceDetectiveSidesheetComponent, SourceDetectiveSidesheetData, SourceDetectiveType } from 'qer';
import { Approvers } from '../../decision/approvers.interface';
import { AttestationCasesService } from '../../decision/attestation-cases.service';
import { AttestationHistoryActionService } from '../attestation-history-action.service';
import { AttestationHistoryCase } from '../attestation-history-case';
@Component({
  selector: 'imx-attestation-history-details',
  templateUrl: './attestation-history-details.component.html',
  styleUrls: ['./attestation-history-details.component.scss'],
})
export class AttestationHistoryDetailsComponent implements OnDestroy, OnInit {
  public get canDecide(): boolean {
    return this.case.isPending && this.approvers?.current?.find((entity) => entity.Columns?.UID_PersonHead.Value === this.userUid) != null;
  }

  public get allowedActionCount(): number {
    const actions = this.showApprovalActions
      ? [this.canDecide, this.reportType === 'PDF', this.case?.SupportsAssignmentAnalysis?.value]
      : [
          this.case.canRecallDecision,
          this.case.canWithdrawDelegation(this.userUid),
          this.reportType === 'PDF',
          this.case?.SupportsAssignmentAnalysis?.value,
        ];
    return actions.filter((condition) => condition).length;
  }

  public userUid: string;

  public readonly case: AttestationHistoryCase;
  public readonly approvers: Approvers;
  public readonly workflowHistoryData: PortalAttestationCaseHistory[];
  public readonly parameters: ColumnDependentReference[];
  public readonly propertyInfo: ColumnDependentReference[];
  public readonly reportType: string;
  public readonly reportDownload: EuiDownloadOptions;
  public readonly showApprovalActions: boolean;
  public relatedOptions: AttestationRelatedObject[] = [];
  public selectedOption: AttestationRelatedObject;
  public selectedHyperviewType: string;
  public selectedHyperviewUID: string;
  private readonly subscriptions: Subscription[] = [];

  constructor(
    @Inject(EUI_SIDESHEET_DATA)
    data: {
      case: AttestationHistoryCase;
      approvers: Approvers;
      showApprovalActions: boolean;
    },
    private readonly sideSheet: EuiSidesheetService,
    private readonly translate: TranslateService,
    private readonly sideSheetRef: EuiSidesheetRef,
    public readonly attestationAction: AttestationHistoryActionService,
    private readonly attestationCasesService: AttestationCasesService,
    authentication: AuthenticationService,
    private readonly metadataService: MetadataService,
  ) {
    this.case = data.case;
    this.approvers = data.approvers;
    this.showApprovalActions = data.showApprovalActions;

    if (this.case.data) {
      this.workflowHistoryData = this.attestationCasesService.createHistoryTypedEntities(this.case.data).Data;
    }

    this.parameters = this.case.attestationParameters.map((column) => new BaseReadonlyCdr(column));

    this.propertyInfo = this.case.propertyInfo;
    this.reportType = this.case.ReportType.value;
    this.reportDownload = this.attestationCasesService.getReportDownloadOptions(this.case);

    this.subscriptions.push(this.attestationAction.applied.subscribe(() => this.sideSheetRef.close()));

    this.subscriptions.push(authentication.onSessionResponse.subscribe((sessionState) => (this.userUid = sessionState?.UserUid || '')));
  }
  public ngOnInit(): void {
    this.setRelatedOptions();
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  public async viewSource() {
    const uidPerson = this.case.UID_Person.value;

    const objectKey = DbObjectKey.FromXml(this.case.ObjectKeyBase.value);

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
      width: calculateSidesheetWidth(),
      disableClose: false,
      testId: 'attestation-history-details-assignment-analysis',
      data,
    });
  }

  public async setRelatedOptions(): Promise<void> {
    if (!!this.case.data?.RelatedObjects) {
      this.relatedOptions =
        (await Promise.all(
          this.case.data?.RelatedObjects.map(async (relatedObject) => {
            const objectType = DbObjectKey.FromXml(relatedObject.ObjectKey || '');
            await this.metadataService.updateNonExisting([objectType.TableName]);
            return {
              ObjectKey: relatedObject.ObjectKey,
              Display: `${relatedObject.Display} - ${this.metadataService.tables[objectType.TableName]?.DisplaySingular}`,
            };
          }),
        )) || [];
      if (this.relatedOptions.length > 0) {
        this.selectedOption = this.relatedOptions[0];
        this.setHyperviewObject();
      }
    }
  }

  public setHyperviewObject(): void {
    const dbKey = DbObjectKey.FromXml(this.selectedOption.ObjectKey || '');
    this.selectedHyperviewType = dbKey.TableName;
    this.selectedHyperviewUID = dbKey.Keys.join(',');
  }
}
