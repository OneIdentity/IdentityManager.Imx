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
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { PwoExtendedData, ViewConfigData } from 'imx-api-qer';
import {
  ValType,
  ExtendedTypedEntityCollection,
  TypedEntity,
  EntitySchema,
  DataModel,
  CollectionLoadParameters,
  FilterType,
  CompareOperator,
} from 'imx-qbm-dbts';
import {
  DataSourceToolbarSettings,
  AuthenticationService,
  DataTableComponent,
  SettingsService,
  UserMessageService,
  ClientPropertyForTableColumns,
  BusyService,
  DataSourceToolbarViewConfig,
} from 'qbm';
import { AttestationCase } from '../attestation-case';
import { AttestationCaseComponent } from '../attestation-case.component';
import { AttestationCasesService } from '../attestation-cases.service';
import { AttestationActionService } from '../../attestation-action/attestation-action.service';
import { Approvers } from '../approvers.interface';
import { AttestationFeatureGuardService } from '../../attestation-feature-guard.service';
import { LossPreview } from '../loss-preview.interface';
import { AttestationInquiry } from './attestation-inquiry.model';
import { ViewConfigService } from 'qer';

@Component({
  templateUrl: './attestation-inquiries.component.html',
  selector: 'imx-attestation-inquiries',
  styleUrls: ['./attestation-inquiries.component.scss'],
})
export class AttestationInquiriesComponent implements OnInit, OnDestroy {
  public dstSettings: DataSourceToolbarSettings;
  public readonly entitySchema: EntitySchema;
  public attestationCasesCollection: ExtendedTypedEntityCollection<AttestationCase, PwoExtendedData>;
  public hasData = false;
  public isUserEscalationApprover = false;
  public mitigatingControlsPerViolation: boolean;
  @ViewChild(DataTableComponent) private readonly table: DataTableComponent<TypedEntity>;
  public lossPreview: LossPreview;

  private navigationState: CollectionLoadParameters;
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
    settingsService: SettingsService,
    authentication: AuthenticationService
  ) {
    this.navigationState = { PageSize: settingsService.DefaultPageSize, StartIndex: 0 };
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
          this.table.clearSelection();
        })
      );
    this.attFeatureService.getAttestationConfig().then((config) => {
      this.isUserEscalationApprover = config.IsUserInChiefApprovalTeam;
      this.mitigatingControlsPerViolation = config.MitigatingControlsPerViolation;
    });
    this.subscriptions.push(authentication.onSessionResponse.subscribe((session) => (this.userUid = session.UserUid)));
  }

  public async ngOnInit(): Promise<void> {
    this.navigationState.forinquiry = true;
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
    await this.getData(undefined, true);
  }

  public ngOnDestroy(): void {
    // Set service value back to false since the toggle value is stored there
    this.attestationCasesService.isChiefApproval = false;
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  public async getData(parameters?: CollectionLoadParameters, isInitialLoad: boolean = false): Promise<void> {
    if (parameters) {
      this.navigationState = parameters;
    }

    const isBusy = this.busyService.beginBusy();

    try {
      this.attestationCasesCollection = isInitialLoad
        ? { totalCount: 0, Data: [] }
        : await this.attestationCasesService.get(this.navigationState);
      this.hasData = this.attestationCasesCollection.totalCount > 0 || (this.navigationState.search ?? '') !== '';
      this.updateTable();
    } finally {
      isBusy.endBusy();
    }
  }

  public async updateConfig(config: ViewConfigData): Promise<void> {
    await this.viewConfigService.putViewConfig(config);
    this.viewConfig = await this.viewConfigService.getDSTExtensionChanges(this.viewConfigPath);
    this.dstSettings.viewConfig = this.viewConfig;
  }

  public async deleteConfigById(id: string): Promise<void> {
    await this.viewConfigService.deleteViewConfig(id);
    this.viewConfig = await this.viewConfigService.getDSTExtensionChanges(this.viewConfigPath);
    this.dstSettings.viewConfig = this.viewConfig;
  }

  /**
   * Occurs when user clicks the edit button for a request
   *
   * @param pwo Selected PortalItshopApproveRequests.
   */
  public async editCase(attestationCase: AttestationCase): Promise<void> {
    let attestationCaseWithPolicy: AttestationCase;
    let approvers: Approvers;

    let busyIndicator: OverlayRef;
    setTimeout(() => (busyIndicator = this.busyServiceElemental.show()));

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
      attestationCaseWithPolicy.data.CanSeeComplianceViolations = attestationCase.data.CanSeeComplianceViolations;
      attestationCaseWithPolicy.data.ComplianceViolations = attestationCase.data.ComplianceViolations;
      attestationCaseWithPolicy.data.CanSeePolicyViolations = attestationCase.data.CanSeePolicyViolations;
      attestationCaseWithPolicy.data.PolicyViolations = attestationCase.data.PolicyViolations;

      if (attestationCaseWithPolicy && !['approved', 'denied'].includes(attestationCaseWithPolicy.AttestationState.value)) {
        approvers = await this.attestationCasesService.getApprovers(attestationCaseWithPolicy);
      }
      this.lossPreview.LossPreviewItems = await this.attestationCasesService.getLossPreviewEntities(attestationCase);
    } finally {
      setTimeout(() => this.busyServiceElemental.hide(busyIndicator));
    }

    if (attestationCaseWithPolicy) {
      this.sidesheet.open(AttestationCaseComponent, {
        title: await this.translate.get('#LDS#Heading View Attestation Case Details').toPromise(),
        subTitle: attestationCaseWithPolicy.GetEntity().GetDisplay(),
        padding: '0px',
        width: 'max(60%,700px)',
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
    return this.actionService.getCaseData(pwo).Columns.ReasonHead.Value;
  }
  public getInquirer(pwo: AttestationCase): string {
    return this.actionService.getCaseData(pwo).Columns.DisplayPersonHead.Value;
  }
  public getQueryDate(pwo: AttestationCase): Date {
    return new Date(this.actionService.getCaseData(pwo).Columns.DateHead.Value);
  }

  public onSearch(keywords: string): Promise<void> {
    const navigationState = {
      ...this.navigationState,
      ...{
        StartIndex: 0,
        search: keywords,
      },
    };

    return this.getData(navigationState);
  }

  private updateTable(): void {
    if (this.attestationCasesCollection) {
      const exportMethod = this.attestationCasesService.exportData(this.navigationState);
      exportMethod.initialColumns = this.displayedColumns.map((col) => col.ColumnName);
      this.dstSettings = {
        dataSource: this.attestationCasesCollection,
        extendedData: this.attestationCasesCollection?.extendedData?.Data,
        entitySchema: this.entitySchema,
        navigationState: this.navigationState,
        displayedColumns: this.displayedColumns,
        dataModel: this.dataModel,
        viewConfig: this.viewConfig,
        exportMethod,
      };
    } else {
      this.dstSettings = undefined;
    }
  }
}
