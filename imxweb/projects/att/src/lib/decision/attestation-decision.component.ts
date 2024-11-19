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
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

import { CollectionLoadParameters, CompareOperator, DataModel, FilterType, TypedEntity, ValType } from 'imx-qbm-dbts';
import {
  AuthenticationService,
  BusyService,
  DataSourceToolbarFilter,
  DataSourceToolbarGroupData,
  DataSourceToolbarSettings,
  DataSourceToolbarViewConfig,
  DataTableComponent,
  DataTableGroupedData,
  MessageDialogComponent,
  SettingsService,
  UserMessageService,
} from 'qbm';
import { AttestationCasesService } from './attestation-cases.service';
import { AttestationCaseComponent } from './attestation-case.component';
import { AttestationActionService } from '../attestation-action/attestation-action.service';
import { AttestationCase } from './attestation-case';
import { Approvers } from './approvers.interface';
import { AttestationDecisionAction, AttestationDecisionLoadParameters } from './attestation-decision-load-parameters';
import { ApiService } from '../api.service';
import { createGroupData } from '../datamodel/datamodel-helper';
import { AttestationFeatureGuardService } from '../attestation-feature-guard.service';
import { EntitlementLossDto, RecommendationEnum } from 'imx-api-att';
import { LossPreviewDialogComponent } from './loss-preview-dialog/loss-preview-dialog.component';
import { LossPreview } from './loss-preview.interface';
import { PendingItemsType, RecommendationSidesheetComponent, UserModelService, ViewConfigService } from 'qer';
import { ViewConfigData } from 'imx-api-qer';
@Component({
  templateUrl: './attestation-decision.component.html',
  styleUrls: ['./attestation-decision.component.scss'],
})
export class AttestationDecisionComponent implements OnInit, OnDestroy {
  public dstSettings: DataSourceToolbarSettings;
  public selectedCases: AttestationCase[] = [];
  public userUid: string;

  public hideToolbar: boolean = false;

  public recApprove = RecommendationEnum.Approve;
  public recDeny = RecommendationEnum.Deny;

  public get canReRouteDecision(): boolean {
    return this.selectedCases.every((item) => item.canRerouteDecision(this.userUid));
  }
  public get canAddApprover(): boolean {
    return this.selectedCases.every((item) => item.canAddApprover(this.userUid));
  }
  public get canWithdrawAddApprover(): boolean {
    return this.selectedCases.every((item) => item.canWithdrawAddApprover(this.userUid));
  }
  public get canDelegateDecision(): boolean {
    return this.selectedCases.every((item) => item.canDelegateDecision(this.userUid));
  }
  public get canDenyApproval(): boolean {
    return this.selectedCases.every((item) => item.canDenyApproval(this.userUid));
  }
  public get canEscalateDecisions(): boolean {
    return this.selectedCases.every((item) => item.canEscalateDecision(this.userUid));
  }

  public get canPerformActions(): boolean {
    return (
      this.selectedCases.length > 0 &&
      (this.canWithdrawAddApprover || this.canAddApprover || this.canDelegateDecision || this.canDenyApproval || this.canReRouteDecision)
    );
  }
  public isUserEscalationApprover = false;
  public mitigatingControlsPerViolation: boolean;

  public groupedData: { [key: string]: DataTableGroupedData } = {};
  public allLossPreviewItems: EntitlementLossDto[];
  public lossPreview: LossPreview;
  public hasInquiries: boolean;
  public tabIndex = 0;
  public busyService = new BusyService();
  public entitySchema = this.attestationCases.attestationApproveSchema;

  private approvalThreshold: number;
  private autoRemovalScope: boolean;
  private navigationState: AttestationDecisionLoadParameters;
  private filterOptions: DataSourceToolbarFilter[] = [];
  private dataModel: DataModel;
  private groupData: DataSourceToolbarGroupData;
  private decisionAction: AttestationDecisionAction = AttestationDecisionAction.none;
  private readonly collectionLoadParameters;
  private readonly subscriptions: Subscription[] = [];
  @ViewChild(DataTableComponent) private readonly table: DataTableComponent<TypedEntity>;

  private viewConfig: DataSourceToolbarViewConfig;
  private viewConfigPath = 'attestation/approve';

  constructor(
    public readonly attestationAction: AttestationActionService,
    private readonly attestationCases: AttestationCasesService,
    private readonly busyServiceElemental: EuiLoadingService,
    private readonly sidesheet: EuiSidesheetService,
    private readonly messageService: UserMessageService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly noCaseDialog: MatDialog,
    private readonly translate: TranslateService,
    private readonly attService: ApiService,
    private readonly attFeatureService: AttestationFeatureGuardService,
    private viewConfigService: ViewConfigService,
    private dialog: MatDialog,
    private readonly usermodelService: UserModelService,
    settingsService: SettingsService,
    authentication: AuthenticationService
  ) {
    this.collectionLoadParameters = { PageSize: settingsService.DefaultPageSize, StartIndex: 0 };
    this.navigationState = this.collectionLoadParameters;
    this.subscriptions.push(
      this.attestationAction.applied.subscribe(() => {
        this.getData();
        this.table?.clearSelection();
      })
    );
    this.subscriptions.push(
      authentication.onSessionResponse.subscribe((sessionState) => {
        this.userUid = sessionState?.UserUid;
        this.attestationCases.isChiefApproval = false;
      })
    );

    this.attFeatureService.getAttestationConfig().then((config) => {
      this.isUserEscalationApprover = config.IsUserInChiefApprovalTeam;
      this.mitigatingControlsPerViolation = config.MitigatingControlsPerViolation;
    });
  }

  get isMobile(): boolean {
    return document.body.offsetWidth <= 768;
  }

  public get viewEscalation(): boolean {
    return this.attestationCases.isChiefApproval;
  }
  public set viewEscalation(val: boolean) {
    this.attestationCases.isChiefApproval = val;

    // reload data model for changed filter options when the user toggles escalation mode
    this.initDataModel();
  }

  public async switchEscalation(): Promise<void> {
    this.attestationCases.isChiefApproval = !this.attestationCases.isChiefApproval;
    await this.initDataModel();
    return this.getData();
  }

  public async ngOnInit(): Promise<void> {
    let isBusy: any;
    setTimeout(() => {
      isBusy = this.busyService.beginBusy();
    });
    try {
      const config = await this.attService.client.portal_attestation_config_get();
      const pendingItems: PendingItemsType = await this.usermodelService.getPendingItems();
      this.hasInquiries = pendingItems.OpenInquiriesAttestation > 0;
      const params = await this.activatedRoute.queryParams.pipe(first()).toPromise();
      this.approvalThreshold = config.ApprovalThreshold;
      this.autoRemovalScope = config.AutoRemovalScope;
      this.lossPreview = {
        LossPreviewItems: [],
        LossPreviewHeaders: ['Display', 'ObjectDisplay', 'Person'],
        LossPreviewDisplayKeys: {
          Display: '#LDS#Entitlement loss',
          ObjectDisplay: '#LDS#Affected object',
          Person: '#LDS#Affected identity',
        },
      };
      if (params.inquiries) {
        this.tabIndex = 1;
        this.hasInquiries = true;
      }
      await this.initDataModel(true);

      await this.parseParams();
      await this.getData();
      this.handleDecision();
    } finally {
      setTimeout(() => {
        isBusy.endBusy();
      });
    }
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
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

  public isNewLoss(loss: EntitlementLossDto): boolean {
    return this.allLossPreviewItems.indexOf(loss) === -1 ? true : false;
  }

  public async openLossDialog(func: string, cases: AttestationCase[]): Promise<void> {
    if (!this.autoRemovalScope) {
      // We can skip accumulation and go ahead with handle
      this.attestationAction[func](cases);
      return;
    }
    let busyIndicator: OverlayRef;
    setTimeout(() => (busyIndicator = this.busyServiceElemental.show()));
    try {
      // Accumulate all losses
      this.allLossPreviewItems = [];
      await Promise.all(
        cases.map(async (selectedCase) => {
          const selectedLosses = await this.attestationCases.getLossPreviewEntities(selectedCase);
          selectedLosses.forEach((loss) => {
            if (this.isNewLoss(loss)) {
              this.allLossPreviewItems.push(loss);
            }
          });
        })
      );
    } finally {
      setTimeout(() => this.busyServiceElemental.hide(busyIndicator));
    }
    if (this.allLossPreviewItems.length === 0) {
      // There are no losses, go ahead with handle
      this.attestationAction[func](cases);
      return;
    }
    // There are losses, show them
    this.lossPreview.LossPreviewItems = this.allLossPreviewItems;
    const selection = await this.dialog
      .open(LossPreviewDialogComponent, {
        width: this.isMobile ? '90vw' : '60vw',
        maxWidth: this.isMobile ? '90vw' : '80vw',
        height: '70vh',
        maxHeight: '70vh',
        data: this.lossPreview,
      })
      .afterClosed()
      .toPromise();

    if (selection) {
      // Handle function
      this.attestationAction[func](cases);
    }
  }

  public async search(search: string): Promise<void> {
    this.attestationCases.abortCall();
    return this.getData({ ...this.navigationState, ...{ search } });
  }

  public async getData(newState?: CollectionLoadParameters): Promise<void> {
    if (newState) {
      this.navigationState = newState;
    }

    const isBusy = this.busyService.beginBusy();

    try {
      this.navigationState = {
        ...this.navigationState,
        Escalation: this.attestationCases.isChiefApproval,
      };
      const dataSource = await this.attestationCases.get(this.navigationState, this.isUserEscalationApprover);
      if (dataSource) {
        const exportMethod = this.attestationCases.exportData(this.navigationState);
        this.dstSettings = {
          dataSource,
          entitySchema: this.entitySchema,
          navigationState: this.navigationState,
          filters: this.filterOptions,
          dataModel: this.dataModel,
          groupData: this.groupData,
          displayedColumns: [
            this.entitySchema.Columns.UiText,
            {
              ColumnName: 'badges',
              Type: ValType.String,
              untranslatedDisplay: '#LDS#Badges',
            },
            {
              ColumnName: 'decision',
              Type: ValType.String,
              afterAdditionals: true,
              untranslatedDisplay: '#LDS#Decision',
            },
            {
              ColumnName: 'recommendations',
              Type: ValType.String,
              afterAdditionals: true,
              untranslatedDisplay: '#LDS#Recommendation',
            },
          ],
          exportMethod,
          viewConfig: this.viewConfig,
        };
      }
    } finally {
      isBusy.endBusy();
    }
  }

  public async onGroupingChange(groupKey: string): Promise<void> {
    const isBusy = this.busyService.beginBusy();

    try {
      const groupedData = this.groupedData[groupKey];
      const navigationState = { ...groupedData.navigationState, Escalation: this.viewEscalation };
      groupedData.data = await this.attestationCases.get(navigationState, this.isUserEscalationApprover);
      groupedData.settings = {
        displayedColumns: this.dstSettings.displayedColumns,
        dataModel: this.dstSettings.dataModel,
        dataSource: groupedData.data,
        entitySchema: this.dstSettings.entitySchema,
        navigationState,
      };
    } finally {
      isBusy.endBusy();
    }
  }

  public onSelectionChanged(cases: AttestationCase[]): void {
    this.selectedCases = cases;
  }

  public async edit(attestationCase: AttestationCase): Promise<void> {
    let attestationCaseWithPolicy: AttestationCase;
    let approvers: Approvers;

    let busyIndicator: OverlayRef;
    setTimeout(() => (busyIndicator = this.busyServiceElemental.show()));

    try {
      attestationCaseWithPolicy = (
        await this.attestationCases.get(
          {
            Escalation: this.viewEscalation,
            uidpolicy: attestationCase.UID_AttestationPolicy.value,
            filter: [
              {
                ColumnName: 'UID_AttestationCase',
                Type: FilterType.Compare,
                CompareOp: CompareOperator.Equal,
                Value1: attestationCase.GetEntity().GetKeys()[0],
              },
            ],
          },
          this.isUserEscalationApprover
        )
      ).Data[0];
      // Add additional violation data to this case
      attestationCaseWithPolicy.data.CanSeeComplianceViolations = attestationCase.data.CanSeeComplianceViolations;
      attestationCaseWithPolicy.data.ComplianceViolations = attestationCase.data.ComplianceViolations;
      attestationCaseWithPolicy.data.CanSeePolicyViolations = attestationCase.data.CanSeePolicyViolations;
      attestationCaseWithPolicy.data.PolicyViolations = attestationCase.data.PolicyViolations;

      if (attestationCaseWithPolicy && !['approved', 'denied'].includes(attestationCaseWithPolicy.AttestationState.value)) {
        approvers = await this.attestationCases.getApprovers(attestationCaseWithPolicy);
      }
      this.lossPreview.Case = attestationCase;
    } finally {
      setTimeout(() => this.busyServiceElemental.hide(busyIndicator));
    }

    if (attestationCaseWithPolicy) {
      this.sidesheet.open(AttestationCaseComponent, {
        title: await this.translate.get('#LDS#Heading View Attestation Case Details').toPromise(),
        subTitle: attestationCaseWithPolicy.GetEntity().GetDisplay(),
        padding: '0px',
        width: 'max(70%,768px)',
        testId: 'attestation-case-sidesheet',
        data: {
          case: attestationCaseWithPolicy,
          approvers,
          approvalThreshold: this.approvalThreshold,
          autoRemovalScope: this.autoRemovalScope,
          lossPreview: this.lossPreview,
          mitigatingControlsPerViolation: this.mitigatingControlsPerViolation,
          isInquiry: false,
          isUserEscalationApprover: this.isUserEscalationApprover,
        },
      });
    } else {
      this.messageService.subject.next({
        text: '#LDS#You cannot edit the item because the item does not exist. Please reload the page.',
      });
    }
  }

  public async viewRecommendationDetails(attestationCase: AttestationCase): Promise<void> {
    const decision: 'approve' | 'deny' | null = await this.sidesheet
      .open(RecommendationSidesheetComponent, {
        title: await this.translate.get('#LDS#Heading View Recommendation Details').toPromise(),
        subTitle: attestationCase.GetEntity().GetDisplay(),
        panelClass: 'imx-sidesheet',
        padding: '0',
        width: 'max(700px, 60%)',
        testId: 'attestation-recommendation-sidesheet',
        data: attestationCase.data.Recommendation,
      })
      .afterClosed()
      .toPromise();

    if (decision === 'approve') {
      await this.attestationAction.approve([attestationCase]);
    } else if (decision === 'deny') {
      await this.attestationAction.deny([attestationCase]);
    }
  }

  private async initDataModel(checkConfigs = false): Promise<void> {
    this.dataModel = await this.attestationCases.getDataModel();
    this.viewConfig = await this.viewConfigService.getInitialDSTExtension(this.dataModel, this.viewConfigPath);
    if (checkConfigs) {
      // We will check the configs for default state only on ini
      if (!this.viewConfigService.isDefaultConfigSet()) {
        // If we have no default settings, we will use the due date to sort
        this.navigationState.OrderBy = 'ToSolveTill';
      }
    }

    this.filterOptions = this.dataModel?.Filters ?? [];

    this.groupData = createGroupData(
      this.dataModel,
      (parameters) =>
        this.attestationCases.getGroupInfo({
          ...{
            PageSize: this.collectionLoadParameters.PageSize,
            StartIndex: 0,
          },
          ...parameters,
        }),
      []
    );
  }

  private async parseParams(): Promise<void> {
    const queryParams = await this.activatedRoute.queryParams.pipe(first()).toPromise();

    // Cases: VI_BuildAttestationLink_Approve, VI_BuildAttestationLink_Deny, VI_BuildAttestationLink_Reject
    if (queryParams['uid_attestationhelper'] && queryParams['decision']) {
      this.navigationState.uid_attestationhelper = queryParams['uid_attestationhelper'];

      // Will otherwise result in a string
      this.decisionAction = AttestationDecisionAction[queryParams['decision'].toLowerCase()] as unknown as AttestationDecisionAction;
      return;
    }

    // Case: VI_BuildAttestationLink_Show
    if (queryParams['uid_attestationhelper']) {
      this.navigationState.uid_attestationhelper = queryParams['uid_attestationhelper'];
      return;
    }

    // Case: VI_BuildAttestationLink_ViewDetails
    if (queryParams['uid_attestationcase']) {
      this.navigationState.uid_attestationcase = queryParams['uid_attestationcase'];
      this.decisionAction = AttestationDecisionAction.showcase;
      this.hideToolbar = true;
      return;
    }

    // Case: VI_BuildAttestationLink_Pending
    // Nothing to handle here.
  }

  private async handleDecision(): Promise<void> {
    if (this.decisionAction === AttestationDecisionAction.none) {
      return;
    }

    if (this.dstSettings.dataSource.Data == null || this.dstSettings.dataSource.Data.length === 0) {
      const dialogRef = this.noCaseDialog.open(MessageDialogComponent, {
        data: {
          ShowOk: true,
          Title: await this.translate.get('#LDS#Heading Cannot Find Attestation Case').toPromise(),
          Message: await this.translate
            .get(
              '#LDS#The attestation case does not exist (anymore). To view all attestation cases, close this page and reopen the Pending Attestions page.'
            )
            .toPromise(),
        },
      });
      return;
    }

    switch (this.decisionAction) {
      case AttestationDecisionAction.approve:
        this.attestationAction.approve(this.dstSettings.dataSource.Data as AttestationCase[]);
        break;
      case AttestationDecisionAction.deny:
        this.attestationAction.deny(this.dstSettings.dataSource.Data as AttestationCase[]);
        break;
      case AttestationDecisionAction.denydecision:
        this.attestationAction.denyDecisions(this.dstSettings.dataSource.Data as AttestationCase[]);
        break;
      case AttestationDecisionAction.showcase:
        this.edit(this.dstSettings.dataSource.Data[0] as AttestationCase);
        break;
    }
  }
}
