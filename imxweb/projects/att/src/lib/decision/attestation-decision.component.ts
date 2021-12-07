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

import { CollectionLoadParameters, CompareOperator, FilterType, TypedEntity, ValType } from 'imx-qbm-dbts';
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

@Component({
  templateUrl: './attestation-decision.component.html',
  styleUrls: ['./attestation-decision.component.scss']
})
export class AttestationDecisionComponent implements OnInit, OnDestroy {
  public dstSettings: DataSourceToolbarSettings;
  public selectedCases: AttestationCase[] = [];
  public userUid: string;

  public get canReRouteDecision(): boolean { return this.selectedCases.every(item => item.canRerouteDecision(this.userUid)); }
  public get canAddApprover(): boolean { return this.selectedCases.every(item => item.canAddApprover(this.userUid)); }
  public get canWithdrawAddApprover(): boolean { return this.selectedCases.every(item => item.canWithdrawAddApprover(this.userUid)); }
  public get canDelegateDecision(): boolean { return this.selectedCases.every(item => item.canDelegateDecision(this.userUid)); }
  public get canDenyApproval(): boolean { return this.selectedCases.every(item => item.canDenyApproval(this.userUid)); }

  public get canPerformActions(): boolean {
    return this.selectedCases.length > 0 && (
      this.canWithdrawAddApprover
      || this.canAddApprover
      || this.canDelegateDecision
      || this.canDenyApproval
      || this.canReRouteDecision);
  }

  public groupedData: { [key: string]: DataTableGroupedData } = {};

  private approvalThreshold: number;
  private navigationState: AttestationDecisionLoadParameters;
  private filterOptions: DataSourceToolbarFilter[] = [];
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
    settingsService: SettingsService,
    authentication: AuthenticationService
  ) {
    this.collectionLoadParameters = { PageSize: settingsService.DefaultPageSize, StartIndex: 0, OrderBy: 'ToSolveTill asc' };
    this.navigationState = this.collectionLoadParameters;
    this.subscriptions.push(this.attestationAction.applied.subscribe(() => {
      this.getData();
      this.table.clearSelection();
    }));
    this.subscriptions.push(authentication.onSessionResponse.subscribe(sessionState => this.userUid = sessionState?.UserUid));

    this.attFeatureService.getAttestationConfig().then(config => {
      this.isUserEscalationApprover = config.IsUserInChiefApprovalTeam;
    })
  }

  public isUserEscalationApprover: boolean = false;

  public get viewEscalation() { return this.attestationCases.isChiefApproval; }
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
    setTimeout(() => busyIndicator = this.busyService.show());

    try {
      this.approvalThreshold = (await this.attService.client.portal_attestation_config_get()).ApprovalThreshold;

      await this.initDataModel();

    } finally {
      setTimeout(() => this.busyService.hide(busyIndicator));
    }

    await this.parseParams();
    await this.getData();
    this.handleDecision();
  }

  private async initDataModel() {
    const dataModel = await this.attestationCases.getDataModel();

    this.filterOptions = dataModel.Filters;

    this.groupData = createGroupData(
      dataModel,
      parameters => this.attestationCases.getGroupInfo({
        ...{
          PageSize: this.collectionLoadParameters.PageSize,
          StartIndex: 0
        },
        ...parameters
      }),
      []
    );
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  public async search(search: string): Promise<void> {
    return this.getData({ ...this.navigationState, ...{ search } });
  }

  public async getData(newState?: CollectionLoadParameters): Promise<void> {
    if (newState) {
      this.navigationState = newState;
    }

    let busyIndicator: OverlayRef;
    setTimeout(() => busyIndicator = this.busyService.show());

    try {
      const dataSource = await this.attestationCases.get({
        Escalation: this.attestationCases.isChiefApproval,
        ...this.navigationState
      });
      const entitySchema = this.attestationCases.attestationApproveSchema;
      this.dstSettings = {
        dataSource,
        entitySchema,
        navigationState: this.navigationState,
        filters: this.filterOptions,
        groupData: this.groupData,
        displayedColumns: [
          entitySchema.Columns.UiText,
          {
            ColumnName: 'badges',
            Type: ValType.String
          },
          {
            ColumnName: 'decision',
            Type: ValType.String
          },
          {
            ColumnName: 'edit',
            Type: ValType.String
          }
        ]
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
      groupedData.data = await this.attestationCases.get(groupedData.navigationState);
      groupedData.settings = {
        displayedColumns: this.dstSettings.displayedColumns,
        dataSource: groupedData.data,
        entitySchema: this.dstSettings.entitySchema,
        navigationState: groupedData.navigationState
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
    setTimeout(() => busyIndicator = this.busyService.show());

    try {
      attestationCaseWithPolicy = (await this.attestationCases.get({
        Escalation: this.viewEscalation,
        uidpolicy: attestationCase.UID_AttestationPolicy.value,
        filter: [{
          ColumnName: 'UID_AttestationCase',
          Type: FilterType.Compare,
          CompareOp: CompareOperator.Equal,
          Value1: attestationCase.GetEntity().GetKeys()[0]
        }]
      })).Data[0];

      if (attestationCaseWithPolicy && !['approved', 'denied'].includes(attestationCaseWithPolicy.AttestationState.value)) {
        approvers = await this.attestationCases.getApprovers(attestationCaseWithPolicy);
      }
    } finally {
      setTimeout(() => this.busyService.hide(busyIndicator));
    }

    if (attestationCaseWithPolicy) {
      this.sidesheet.open(AttestationCaseComponent, {
        title: await this.translate.get('#LDS#Heading View Attestation Case Details').toPromise(),
        headerColour: 'iris-blue',
        panelClass: 'imx-sidesheet',
        padding: '0',
        width: '600px',
        testId: 'attestation-case-sidesheet',
        data: {
          case: attestationCaseWithPolicy,
          approvers,
          approvalThreshold: this.approvalThreshold
        }
      });
    } else {
      this.messageService.subject.next({
        text: '#LDS#You cannot edit the item because the item does not exist. Please reload the page.'
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
          Message: await this.translate.get('#LDS#The attestation case does not exist (anymore). To view all attestation cases, close this page and reopen the Pending Attestions page.').toPromise(),
        }
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
        this.edit((this.dstSettings.dataSource.Data[0]) as AttestationCase);
        break;
    }
  }
}
