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
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';

import { AttestationConfig, EntitlementLossDto, RecommendationEnum } from '@imx-modules/imx-api-att';
import { ViewConfigData } from '@imx-modules/imx-api-qer';
import {
  CollectionLoadParameters,
  CompareOperator,
  DataModel,
  EntitySchema,
  FilterType,
  TypedEntityCollectionData,
  ValType,
} from '@imx-modules/imx-qbm-dbts';
import {
  AuthenticationService,
  BusyService,
  DataSourceToolbarViewConfig,
  DataViewInitParameters,
  DataViewSource,
  LdsReplacePipe,
  MessageDialogComponent,
  QueuedActionState,
  UserMessageService,
  calculateSidesheetWidth,
  setFilterDisplay,
} from 'qbm';
import { PendingItemsType, RecommendationSidesheetComponent, UserModelService, ViewConfigService } from 'qer';
import { AttestationActionService } from '../attestation-action/attestation-action.service';
import { AttestationFeatureGuardService } from '../attestation-feature-guard.service';
import { Approvers } from './approvers.interface';
import { AttestationCase } from './attestation-case';
import { AttestationCaseComponent } from './attestation-case.component';
import { AttestationCasesService } from './attestation-cases.service';
import { AttestationDecisionAction, AttestationDecisionLoadParameters } from './attestation-decision-load-parameters';
import { LossPreviewSidesheetComponent } from './loss-preview-sidesheet/loss-preview-sidesheet.component';
import { LossPreview } from './loss-preview.interface';
@Component({
  templateUrl: './attestation-decision.component.html',
  styleUrls: ['./attestation-decision.component.scss'],
  providers: [DataViewSource],
})
export class AttestationDecisionComponent implements OnInit, OnDestroy {
  public stateOptions = QueuedActionState;
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
  public get canEscalateDecision(): boolean {
    return this.selectedCases.every((item) => item.canEscalateDecision(this.userUid));
  }
  public get canSendInquiry(): boolean {
    return this.selectedCases.every((item) => item.canAskAQuestion);
  }
  public get canRecallInquiry(): boolean {
    return this.selectedCases.every((item) => item.IsReserved.value && item.hasAskedLastQuestion(this.userUid));
  }
  public get canCancelReservation(): boolean {
    return this.selectedCases.every(
      (item) => item.IsReserved.value && (item.hasAskedLastQuestion(this.userUid) || this.isUserEscalationApprover),
    );
  }

  public get canPerformActions(): boolean {
    return (
      this.selectedCases.length > 0 &&
      (this.canWithdrawAddApprover ||
        this.canAddApprover ||
        this.canDelegateDecision ||
        this.canDenyApproval ||
        this.canReRouteDecision ||
        this.canEscalateDecision ||
        this.canRecallInquiry ||
        this.canSendInquiry ||
        this.canCancelReservation)
    );
  }
  public isUserEscalationApprover = false;
  public mitigatingControlsPerViolation: boolean;

  public allLossPreviewItems: EntitlementLossDto[];
  public lossPreview: LossPreview;
  public hasInquiries: boolean;
  public tabIndex = 0;
  public busyService = new BusyService();
  public entitySchema: EntitySchema;

  private approvalThreshold: number | undefined;
  private autoRemovalScope: boolean;
  private dataModel: DataModel;
  private decisionAction: AttestationDecisionAction = AttestationDecisionAction.none;
  private additionalParameter: { uid_attestationhelper?: string; uid_attestationcase?: string } = {};
  private readonly subscriptions: Subscription[] = [];

  private attestationConfig: AttestationConfig;
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
    private readonly ldsReplace: LdsReplacePipe,
    private readonly attFeatureService: AttestationFeatureGuardService,
    private viewConfigService: ViewConfigService,
    private readonly usermodelService: UserModelService,
    authentication: AuthenticationService,
    public dataSource: DataViewSource<AttestationCase>,
  ) {
    this.entitySchema = this.attestationCases.attestationApproveSchema;
    this.subscriptions.push(
      this.attestationAction.applied.subscribe(() => {
        this.dataSource.updateState();
        this.dataSource.selection.clear();
      }),
    );
    this.subscriptions.push(
      authentication.onSessionResponse.subscribe((sessionState) => {
        this.userUid = sessionState?.UserUid || '';
        this.attestationCases.isChiefApproval = false;
      }),
    );
  }

  public get viewEscalation(): boolean {
    return this.attestationCases.isChiefApproval;
  }
  public set viewEscalation(val: boolean) {
    this.attestationCases.isChiefApproval = val;

    // reload data model for changed filter options when the user toggles escalation mode
    this.getData();
  }

  public async ngOnInit(): Promise<void> {
    const isBusy = this.busyService.beginBusy();

    try {
      this.attestationConfig = await this.attFeatureService.getAttestationConfig();
      const pendingItems: PendingItemsType = await this.usermodelService.getPendingItems();
      this.hasInquiries = pendingItems.OpenInquiriesAttestation > 0;
      const params = await this.activatedRoute.queryParams.pipe(first()).toPromise();
      this.approvalThreshold = this.attestationConfig.ApprovalThreshold;
      this.autoRemovalScope = this.attestationConfig.AutoRemovalScope;
      this.isUserEscalationApprover = this.attestationConfig.IsUserInChiefApprovalTeam;
      this.mitigatingControlsPerViolation = this.attestationConfig.MitigatingControlsPerViolation;
      this.lossPreview = {
        LossPreviewItems: [],
        LossPreviewHeaders: ['Display', 'ObjectDisplay', 'Person'],
        LossPreviewDisplayKeys: {
          Display: '#LDS#Entitlement loss',
          ObjectDisplay: '#LDS#Affected object',
          Person: '#LDS#Affected identity',
        },
      };
      if (params?.inquiries) {
        this.tabIndex = 1;
        this.hasInquiries = true;
      }

      await this.parseParams();
      await this.getData();
      this.handleDecision();
    } finally {
      isBusy.endBusy();
    }
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
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

  public isNewLoss(loss: EntitlementLossDto): boolean {
    return this.allLossPreviewItems.indexOf(loss) === -1 ? true : false;
  }

  public async openLossDialog(func: string, cases: AttestationCase[]): Promise<void> {
    if (!this.autoRemovalScope) {
      // We can skip accumulation and go ahead with handle
      this.attestationAction[func](cases);
      return;
    }
    if (this.busyServiceElemental.overlayRefs.length === 0) {
      this.busyServiceElemental.show();
    }
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
        }),
      );
    } finally {
      this.busyServiceElemental.hide();
    }
    if (this.allLossPreviewItems.length === 0) {
      // There are no losses, go ahead with handle
      this.attestationAction[func](cases);
      return;
    }
    // There are losses, show them
    this.lossPreview.LossPreviewItems = this.allLossPreviewItems;
    const subTitle =
      cases.length === 1
        ? cases[0].UiText.Column.GetDisplayValue()
        : this.ldsReplace.transform(await this.translate.get('#LDS#Denying {0} attestation cases').toPromise(), cases.length);
    await this.sidesheet
      .open(LossPreviewSidesheetComponent, {
        title: await this.translate.get('#LDS#Heading View Entitlement Loss').toPromise(),
        subTitle,
        icon: 'warning',
        padding: '0px',
        width: calculateSidesheetWidth(1000),
        testId: 'attestation-case-sidesheet',
        data: {
          lossPreview: this.lossPreview,
          decisionFunc: async () => {
            await this.attestationAction[func](cases);
          },
        },
      })
      .afterClosed()
      .toPromise();
  }

  public async getData(): Promise<void> {
    const displayedColumns = [
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
    ];
    let busyIndicator = this.busyServiceElemental.show();
    try {
      this.dataModel = await this.attestationCases.getDataModel();
      this.viewConfig = await this.viewConfigService.getInitialDSTExtension(this.dataModel, this.viewConfigPath);
    } finally {
      this.busyServiceElemental.hide(busyIndicator);
    }

    const dataViewInitParameters: DataViewInitParameters<AttestationCase> = {
      execute: (params: CollectionLoadParameters, signal: AbortSignal): Promise<TypedEntityCollectionData<AttestationCase>> => {
        const newParams: AttestationDecisionLoadParameters = {
          Escalation: this.viewEscalation,
          ...params,
        };
        if (this.additionalParameter.uid_attestationcase) {
          newParams.uid_attestationcase = this.additionalParameter.uid_attestationcase;
        }
        if (this.additionalParameter.uid_attestationhelper) {
          newParams.uid_attestationhelper = this.additionalParameter.uid_attestationhelper;
        }
        return this.attestationCases.get(newParams, signal);
      },
      schema: this.entitySchema,
      columnsToDisplay: displayedColumns,
      dataModel: this.dataModel,
      exportFunction: this.attestationCases.exportData(),
      viewConfig: this.viewConfig,
      highlightEntity: (identity: AttestationCase) => {
        this.edit(identity);
      },
      groupExecute: (column: string, params: CollectionLoadParameters, signal: AbortSignal) => {
        return this.attestationCases.getGroupInfo(this.getGroupParams(column, params)).then((groupData) => {
          groupData.Groups?.map((group) => {
            setFilterDisplay(group);
            return group;
          });
          return groupData;
        });
      },
      selectionChange: (selection: AttestationCase[]) => this.onSelectionChanged(selection),
    };
    await this.dataSource.init(dataViewInitParameters);
  }

  public onSelectionChanged(cases: AttestationCase[]): void {
    this.selectedCases = cases;
  }

  public async edit(attestationCase: AttestationCase): Promise<void> {
    let attestationCaseWithPolicy: AttestationCase;
    let approvers: Approvers | undefined;
    if (this.busyServiceElemental.overlayRefs.length === 0) {
      this.busyServiceElemental.show();
    }

    try {
      attestationCaseWithPolicy = (
        await this.attestationCases.get({
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
        })
      ).Data[0];
      // Add additional violation data to this case
      if (attestationCaseWithPolicy?.data) {
        attestationCaseWithPolicy.data.CanSeeComplianceViolations = !!attestationCase.data?.CanSeeComplianceViolations;
        attestationCaseWithPolicy.data.ComplianceViolations = attestationCase.data?.ComplianceViolations || [];
        attestationCaseWithPolicy.data.CanSeePolicyViolations = !!attestationCase.data?.CanSeePolicyViolations;
        attestationCaseWithPolicy.data.PolicyViolations = attestationCase.data?.PolicyViolations || [];
        attestationCaseWithPolicy.data.WorkflowSteps = attestationCase.data?.WorkflowSteps;
      }

      if (attestationCaseWithPolicy && !['approved', 'denied'].includes(attestationCaseWithPolicy.AttestationState.value)) {
        approvers = await this.attestationCases.getApprovers(attestationCaseWithPolicy);
      }
      this.lossPreview.Case = attestationCase;
    } finally {
      this.busyServiceElemental.hide();
    }

    if (attestationCaseWithPolicy) {
      this.sidesheet.open(AttestationCaseComponent, {
        title: await this.translate.get('#LDS#Heading View Attestation Case Details').toPromise(),
        subTitle: attestationCaseWithPolicy.UiText.Column.GetDisplayValue(),
        padding: '0px',
        width: calculateSidesheetWidth(1000),
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
        subTitle: attestationCase.UiText.Column.GetDisplayValue(),
        panelClass: 'imx-sidesheet',
        padding: '0',
        width: calculateSidesheetWidth(1000),
        testId: 'attestation-recommendation-sidesheet',
        data: {
          recommendations: attestationCase.data?.Recommendation,
          informationTexts: {
            approve: '#LDS#Based on an analysis of currently available data, it is recommended that you approve this attestation case.',
            reject: '#LDS#Based on an analysis of currently available data, it is recommended that you deny this attestation case.',
            noRecord:
              '#LDS#Based on an analysis of currently available data, no definitive recommendation can be made for this attestation case.',
          },
        },
      })
      .afterClosed()
      .toPromise();

    if (decision === 'approve') {
      await this.attestationAction.approve([attestationCase]);
    } else if (decision === 'deny') {
      await this.attestationAction.deny([attestationCase]);
    }
  }

  private async parseParams(): Promise<void> {
    const queryParams = (await this.activatedRoute.queryParams.pipe(first()).toPromise()) || [];

    // Cases: VI_BuildAttestationLink_Approve, VI_BuildAttestationLink_Deny, VI_BuildAttestationLink_Reject
    if (queryParams['uid_attestationhelper'] && queryParams['decision']) {
      this.additionalParameter.uid_attestationhelper = queryParams['uid_attestationhelper'];
      // Will otherwise result in a string
      this.decisionAction = AttestationDecisionAction[queryParams['decision'].toLowerCase()] as unknown as AttestationDecisionAction;
      return;
    }

    // Case: VI_BuildAttestationLink_Show
    if (queryParams['uid_attestationhelper']) {
      this.additionalParameter.uid_attestationhelper = queryParams['uid_attestationhelper'];
      return;
    }

    // Case: VI_BuildAttestationLink_ViewDetails
    if (queryParams['uid_attestationcase']) {
      this.additionalParameter.uid_attestationcase = queryParams['uid_attestationcase'];
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

    if (this.dataSource.data.length === 0) {
      const dialogRef = this.noCaseDialog.open(MessageDialogComponent, {
        data: {
          ShowOk: true,
          Title: await this.translate.instant('#LDS#Heading Cannot Find Attestation Case'),
          Message: await this.translate.instant(
            '#LDS#The attestation case does not exist (anymore). To view all attestation cases, close this page and reopen the Pending Attestions page.',
          ),
        },
      });
      return;
    }

    switch (this.decisionAction) {
      case AttestationDecisionAction.approve:
        this.attestationAction.approve(this.dataSource.data);
        break;
      case AttestationDecisionAction.deny:
        this.attestationAction.deny(this.dataSource.data);
        break;
      case AttestationDecisionAction.denydecision:
        this.attestationAction.denyDecisions(this.dataSource.data);
        break;
      case AttestationDecisionAction.showcase:
        this.edit(this.dataSource.data[0]);
        break;
    }
  }

  private getGroupParams(column: string, params: CollectionLoadParameters): { by?: string; def?: string } & CollectionLoadParameters {
    if (this.dataModel.Properties?.find((property) => property.Property?.ColumnName === column)) {
      return { ...params, by: column };
    } else {
      return { ...params, def: column };
    }
  }
}
