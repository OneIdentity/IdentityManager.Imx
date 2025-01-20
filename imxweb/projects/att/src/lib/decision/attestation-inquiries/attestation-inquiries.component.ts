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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { PwoExtendedData, ViewConfigData } from '@imx-modules/imx-api-qer';
import {
  CollectionLoadParameters,
  CompareOperator,
  DataModel,
  EntitySchema,
  ExtendedTypedEntityCollection,
  FilterType,
  TypedEntityCollectionData,
  ValType,
} from '@imx-modules/imx-qbm-dbts';
import {
  AuthenticationService,
  BusyService,
  calculateSidesheetWidth,
  ClientPropertyForTableColumns,
  DataSourceToolbarViewConfig,
  DataViewInitParameters,
  DataViewSource,
  UserMessageService,
} from 'qbm';
import { ViewConfigService } from 'qer';
import { AttestationActionService } from '../../attestation-action/attestation-action.service';
import { AttestationFeatureGuardService } from '../../attestation-feature-guard.service';
import { Approvers } from '../approvers.interface';
import { AttestationCase } from '../attestation-case';
import { AttestationCaseComponent } from '../attestation-case.component';
import { AttestationCasesService } from '../attestation-cases.service';
import { LossPreview } from '../loss-preview.interface';
import { AttestationInquiry } from './attestation-inquiry.model';

@Component({
  templateUrl: './attestation-inquiries.component.html',
  selector: 'imx-attestation-inquiries',
  styleUrls: ['./attestation-inquiries.component.scss'],
  providers: [DataViewSource],
})
export class AttestationInquiriesComponent implements OnInit, OnDestroy {
  public readonly entitySchema: EntitySchema;
  public attestationCasesCollection: ExtendedTypedEntityCollection<AttestationCase, PwoExtendedData>;
  public hasData = false;
  public isUserEscalationApprover = false;
  public mitigatingControlsPerViolation: boolean;
  public lossPreview: LossPreview;
  private displayedColumns: ClientPropertyForTableColumns[];
  private readonly subscriptions: Subscription[] = [];
  private dataModel: DataModel;
  private viewConfig: DataSourceToolbarViewConfig;
  private viewConfigPath = 'attestation/approve';
  public userUid: string;
  public AttestationInquiry = AttestationInquiry;
  public busyService = new BusyService();

  constructor(
    public readonly actionService: AttestationActionService,
    private readonly attestationCasesService: AttestationCasesService,
    private readonly attFeatureService: AttestationFeatureGuardService,
    private viewConfigService: ViewConfigService,
    private readonly sidesheet: EuiSidesheetService,
    private readonly messageService: UserMessageService,
    private readonly busyServiceElemental: EuiLoadingService,
    private readonly translate: TranslateService,
    authentication: AuthenticationService,
    public dataSource: DataViewSource<AttestationCase>,
  ) {
    this.entitySchema = attestationCasesService.attestationApproveSchema;
    (this.displayedColumns = [
      {
        ColumnName: 'query',
        Type: ValType.String,
        untranslatedDisplay: AttestationInquiry.queryCaption,
      },
      this.entitySchema?.Columns.UiText,
      {
        ColumnName: 'inquirer',
        Type: ValType.String,
        untranslatedDisplay: AttestationInquiry.headCaption,
      },
      {
        ColumnName: 'queryDate',
        Type: ValType.String,
        untranslatedDisplay: AttestationInquiry.queryDate,
      },
      {
        ColumnName: 'edit',
        Type: ValType.String,
        untranslatedDisplay: '#LDS#Edit',
      },
    ]),
      this.subscriptions.push(
        this.actionService.applied.subscribe(async () => {
          this.getData();
        }),
      );
    this.attFeatureService.getAttestationConfig().then((config) => {
      this.isUserEscalationApprover = config.IsUserInChiefApprovalTeam;
      this.mitigatingControlsPerViolation = config.MitigatingControlsPerViolation;
    });
    this.subscriptions.push(authentication.onSessionResponse.subscribe((session) => (this.userUid = session.UserUid || '')));
  }

  public async ngOnInit(): Promise<void> {
    const isBusy = this.busyService.beginBusy();

    try {
      this.lossPreview = {
        LossPreviewItems: [],
        LossPreviewHeaders: ['Display', 'ObjectDisplay', 'Person'],
        LossPreviewDisplayKeys: {
          Display: '#LDS#Entitlement loss',
          ObjectDisplay: '#LDS#Affected object',
          Person: '#LDS#Affected identity',
        },
      };
      this.dataModel = await this.attestationCasesService.getDataModel();
      this.viewConfig = await this.viewConfigService.getInitialDSTExtension(this.dataModel, this.viewConfigPath);
    } finally {
      isBusy.endBusy();
    }
    await this.getData();
  }

  public ngOnDestroy(): void {
    // Set service value back to false since the toggle value is stored there
    this.attestationCasesService.isChiefApproval = false;
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  public async getData(): Promise<void> {
    const dataViewInitParameters: DataViewInitParameters<AttestationCase> = {
      execute: (params: CollectionLoadParameters, signal: AbortSignal): Promise<TypedEntityCollectionData<AttestationCase>> =>
        this.attestationCasesService.get({ ...params, forinquiry: true }),
      schema: this.entitySchema,
      columnsToDisplay: this.displayedColumns,
      dataModel: this.dataModel,
      exportFunction: this.attestationCasesService.exportData(),
      viewConfig: this.viewConfig,
      highlightEntity: (identity: AttestationCase) => {
        this.editCase(identity);
      },
    };
    await this.dataSource.init(dataViewInitParameters);
  }

  public async updateConfig(config: ViewConfigData): Promise<void> {
    await this.viewConfigService.putViewConfig(config);
    this.viewConfig = await this.viewConfigService.getDSTExtensionChanges(this.viewConfigPath);
    this.dataSource.viewConfig.set(this.viewConfig);
  }

  public async deleteConfigById(id: string): Promise<void> {
    await this.viewConfigService.deleteViewConfig(id);
    this.viewConfig = await this.viewConfigService.getDSTExtensionChanges(this.viewConfigPath);
    this.dataSource.viewConfig.set(this.viewConfig);
  }

  /**
   * Occurs when user clicks the edit button for a request
   *
   * @param pwo Selected PortalItshopApproveRequests.
   */
  public async editCase(attestationCase: AttestationCase): Promise<void> {
    let attestationCaseWithPolicy: AttestationCase;
    let approvers: Approvers | undefined;
    if (this.busyServiceElemental.overlayRefs.length === 0) {
      this.busyServiceElemental.show();
    }

    try {
      attestationCaseWithPolicy = (
        await this.attestationCasesService.get({
          Escalation: false,
          uidpolicy: attestationCase.UID_AttestationPolicy.value,
          forinquiry: true,
          filter: [
            {
              ColumnName: 'UID_AttestationCase',
              Type: FilterType.Compare,
              CompareOp: CompareOperator.Equal,
              Value1: attestationCase.GetEntity().GetKeys()[0],
            },
          ],
        })
      ).Data[0];

      // Add additional violation data to this case
      if (attestationCaseWithPolicy.data) {
        attestationCaseWithPolicy.data.CanSeeComplianceViolations = !!attestationCase.data?.CanSeeComplianceViolations;
        attestationCaseWithPolicy.data.ComplianceViolations = attestationCase.data?.ComplianceViolations || [];
        attestationCaseWithPolicy.data.CanSeePolicyViolations = !!attestationCase.data?.CanSeePolicyViolations;
        attestationCaseWithPolicy.data.PolicyViolations = attestationCase.data?.PolicyViolations || [];
      }

      if (attestationCaseWithPolicy && !['approved', 'denied'].includes(attestationCaseWithPolicy.AttestationState.value)) {
        approvers = await this.attestationCasesService.getApprovers(attestationCaseWithPolicy);
      }
      this.lossPreview.LossPreviewItems = await this.attestationCasesService.getLossPreviewEntities(attestationCase);
    } finally {
      this.busyServiceElemental.hide();
    }

    if (attestationCaseWithPolicy) {
      this.sidesheet.open(AttestationCaseComponent, {
        title: await this.translate.get('#LDS#Heading View Attestation Case Details').toPromise(),
        subTitle: attestationCaseWithPolicy.GetEntity().GetDisplay(),
        padding: '0px',
        width: calculateSidesheetWidth(1000),
        testId: 'attestation-case-sidesheet',
        data: {
          case: attestationCaseWithPolicy,
          approvers,
          approvalThreshold: 0,
          autoRemovalScope: 0,
          lossPreview: this.lossPreview,
          mitigatingControlsPerViolation: this.mitigatingControlsPerViolation,
          isInquiry: true,
        },
      });
    } else {
      this.messageService.subject.next({
        text: '#LDS#You cannot edit the item because the item does not exist. Please reload the page.',
      });
    }
  }

  public getInquiryText(pwo: AttestationCase): string {
    return this.actionService.getCaseData(pwo)?.Columns?.ReasonHead.Value || '';
  }
  public getInquirer(pwo: AttestationCase): string {
    return this.actionService.getCaseData(pwo)?.Columns?.DisplayPersonHead.Value || '';
  }
  public getQueryDate(pwo: AttestationCase): string {
    return this.actionService.getCaseData(pwo)?.Columns?.DateHead.Value || '';
  }
}
