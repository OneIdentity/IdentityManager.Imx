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
  DataSourceToolbarFilter,
  DataSourceToolbarGroupData,
  DataSourceToolbarSettings,
  DataTableComponent,
  DataTableGroupedData,
  MessageDialogComponent,
  SettingsService,
  UserMessageService
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
import { EntitlementLossDto } from 'imx-api-att';
import { LossPreviewDialogComponent } from './loss-preview-dialog/loss-preview-dialog.component';
import { LossPreview } from './loss-preview.interface';
@Component({
  templateUrl: './attestation-decision.component.html',
  styleUrls: ['./attestation-decision.component.scss'],
})
export class AttestationDecisionComponent implements OnInit, OnDestroy {
  public dstSettings: DataSourceToolbarSettings;
  public selectedCases: AttestationCase[] = [];
  public userUid: string;

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

  constructor(
    public readonly attestationAction: AttestationActionService,
    private readonly attestationCases: AttestationCasesService,
    private readonly busyService: EuiLoadingService,
    private readonly sidesheet: EuiSidesheetService,
    private readonly messageService: UserMessageService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly noCaseDialog: MatDialog,
    private readonly translate: TranslateService,
    private readonly attService: ApiService,
    private readonly attFeatureService: AttestationFeatureGuardService,
    private dialog: MatDialog,
    settingsService: SettingsService,
    authentication: AuthenticationService
  ) {
    this.collectionLoadParameters = { PageSize: settingsService.DefaultPageSize, StartIndex: 0, OrderBy: 'ToSolveTill asc' };
    this.navigationState = this.collectionLoadParameters;
    this.subscriptions.push(
      this.attestationAction.applied.subscribe(() => {
        this.getData();
        this.table.clearSelection();
      })
    );
    this.subscriptions.push(authentication.onSessionResponse.subscribe((sessionState) => (this.userUid = sessionState?.UserUid)));

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

  public switchEscalation(): Promise<void> {
    return this.getData();
  }

  public async ngOnInit(): Promise<void> {
    let busyIndicator: OverlayRef;
    setTimeout(() => (busyIndicator = this.busyService.show()));

    try {
      const config = await this.attService.client.portal_attestation_config_get();
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

      await this.initDataModel();
    } finally {
      setTimeout(() => this.busyService.hide(busyIndicator));
    }

    await this.parseParams();
    await this.getData();
    this.handleDecision();
  }

  public async initDataModel(): Promise<void> {
    this.dataModel = await this.attestationCases.getDataModel();

    this.filterOptions = this.dataModel.Filters;

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

  public ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
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
    setTimeout(() => (busyIndicator = this.busyService.show()));
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
      setTimeout(() => this.busyService.hide(busyIndicator));
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
        height: '60vh',
        maxHeight: '60vh',
        panelClass: 'imx-loss-preview-dialog-wrapper',
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
    return this.getData({ ...this.navigationState, ...{ search } });
  }

  public async getData(newState?: CollectionLoadParameters): Promise<void> {
    if (newState) {
      this.navigationState = newState;
    }

    let busyIndicator: OverlayRef;
    setTimeout(() => (busyIndicator = this.busyService.show()));

    try {
      if (this.dataModel == null) {
        this.dataModel = await this.attestationCases.getDataModel();
      }
      const dataSource = await this.attestationCases.get({
        Escalation: this.attestationCases.isChiefApproval,
        ...this.navigationState,
      });
      const entitySchema = this.attestationCases.attestationApproveSchema;
      this.dstSettings = {
        dataSource,
        entitySchema,
        navigationState: this.navigationState,
        filters: this.filterOptions,
        dataModel: this.dataModel,
        groupData: this.groupData,
        displayedColumns: [
          entitySchema.Columns.UiText,
          {
            ColumnName: 'badges',
            Type: ValType.String,
          },
          {
            ColumnName: 'decision',
            Type: ValType.String,
          },
          {
            ColumnName: 'edit',
            Type: ValType.String,
          },
        ],
        identifierForSessionStore: 'attestation-decision'
      };
    } finally {
      setTimeout(() => this.busyService.hide(busyIndicator));
    }
  }

  public async onGroupingChange(groupKey: string): Promise<void> {
    let overlayRef: OverlayRef;
    setTimeout(() => (overlayRef = this.busyService.show()));

    try {
      const groupedData = this.groupedData[groupKey];
      const navigationState = { ...groupedData.navigationState, Escalation: this.viewEscalation };
      groupedData.data = await this.attestationCases.get(navigationState);
      groupedData.settings = {
        displayedColumns: this.dstSettings.displayedColumns,
        dataSource: groupedData.data,
        entitySchema: this.dstSettings.entitySchema,
        navigationState,
      };
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
  }

  public onSelectionChanged(cases: AttestationCase[]): void {
    this.selectedCases = cases;
  }

  public async edit(attestationCase: AttestationCase): Promise<void> {
    let attestationCaseWithPolicy: AttestationCase;
    let approvers: Approvers;

    let busyIndicator: OverlayRef;
    setTimeout(() => (busyIndicator = this.busyService.show()));

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
      attestationCaseWithPolicy.data.CanSeeComplianceViolations = attestationCase.data.CanSeeComplianceViolations;
      attestationCaseWithPolicy.data.ComplianceViolations = attestationCase.data.ComplianceViolations;

      if (attestationCaseWithPolicy && !['approved', 'denied'].includes(attestationCaseWithPolicy.AttestationState.value)) {
        approvers = await this.attestationCases.getApprovers(attestationCaseWithPolicy);
      }
      this.lossPreview.LossPreviewItems = await this.attestationCases.getLossPreviewEntities(attestationCase);
    } finally {
      setTimeout(() => this.busyService.hide(busyIndicator));
    }

    if (attestationCaseWithPolicy) {
      this.sidesheet.open(AttestationCaseComponent, {
        title: await this.translate.get('#LDS#Heading View Attestation Case Details').toPromise(),
        bodyColour: 'asher-gray',
        headerColour: 'iris-blue',
        panelClass: 'imx-sidesheet',
        padding: '0',
        width: this.lossPreview.LossPreviewItems.length > 0 ? '768px' : '700px',
        testId: 'attestation-case-sidesheet',
        data: {
          case: attestationCaseWithPolicy,
          approvers,
          approvalThreshold: this.approvalThreshold,
          autoRemovalScope: this.autoRemovalScope,
          lossPreview: this.lossPreview,
          mitigatingControlsPerViolation: this.mitigatingControlsPerViolation
        },
      });
    } else {
      this.messageService.subject.next({
        text: '#LDS#You cannot edit the item because the item does not exist. Please reload the page.',
      });
    }
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
