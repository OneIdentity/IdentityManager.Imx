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

import { Component, ElementRef, ErrorHandler, Input, OnInit, ViewChild } from '@angular/core';
import { EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { PortalRequestsWorkflowsSubmethods, PortalRequestsWorkflowsSubmethodsInteractive } from 'imx-api-qer';
import { CollectionLoadParameters, DisplayColumns, EntitySchema } from 'imx-qbm-dbts';
import {
  DataSourceToolbarSettings,
  DataSourceWrapper,
  DataTableComponent,
  ConfirmationService,
  LdsReplacePipe, BusyService,
  HelpContextualComponent,
  HelpContextualService,
  HELP_CONTEXTUAL
} from 'qbm';
import { QerPermissionsService } from '../../admin/qer-permissions.service';
import { ApprovalWorkflowDataService } from '../approval-workflow-data.service';
import { ApprovalWorkflowEditComponent } from '../approval-workflow-edit/approval-workflow-edit.component';
import { ApprovalWorkflowFormComponent } from '../approval-workflow-form/approval-workflow-form.component';
import { EditorData, RequestWorkflowData } from '../approval-workflow.interface';
import { AwmColorsService } from '../awm-colors.service';

@Component({
  selector: 'imx-approval-workflow-home',
  templateUrl: './approval-workflow-home.component.html',
  styleUrls: ['./approval-workflow-home.component.scss'],
})
export class ApprovalWorkflowHomeComponent implements OnInit {
  @ViewChild('dataTable', { static: false }) public dataTable: DataTableComponent<PortalRequestsWorkflowsSubmethods>;

  public readonly dstWrapper: DataSourceWrapper<PortalRequestsWorkflowsSubmethods>;
  public dstSettings: DataSourceToolbarSettings;
  public selectedWorkFlows: PortalRequestsWorkflowsSubmethods[] = [];

  public standbyWorkFlowInteractive: PortalRequestsWorkflowsSubmethodsInteractive;
  public standbyPromise: Promise<any>;
  public busyService = new BusyService();
  public entitySchema: EntitySchema;
  public DisplayColumns = DisplayColumns;

  @Input() public isAdmin: boolean;

  constructor(
    private readonly approvalWorkFlowDataService: ApprovalWorkflowDataService,
    private colorService: AwmColorsService,
    private readonly sidesheetService: EuiSidesheetService,
    private readonly translate: TranslateService,
    private readonly errorHandler: ErrorHandler,
    private readonly qerPermissionService: QerPermissionsService,
    private elementRef: ElementRef,
    private readonly helpContextualService: HelpContextualService,
    private confirmation: ConfirmationService,
    private ldsReplace: LdsReplacePipe
  ) {
    const entityWorkFlowSchema = this.approvalWorkFlowDataService.approvalworkflowSchema;
    this.entitySchema = entityWorkFlowSchema;
    this.dstWrapper = new DataSourceWrapper(
      (state) => this.approvalWorkFlowDataService.getWorkFlows(state),
      [entityWorkFlowSchema.Columns[DisplayColumns.DISPLAY_PROPERTYNAME], entityWorkFlowSchema.Columns.DaysToAbort],
      entityWorkFlowSchema
    );
  }

  public get canDelete(): boolean {
    return this.isAdmin && this.selectedWorkFlows.length > 0;
  }

  public async ngOnInit(): Promise<void> {
    const isBusy = this.busyService.beginBusy();
    try {
      this.isAdmin = await this.qerPermissionService.isPersonAdmin();
      this.colorService.getAndStoreColor(this.elementRef);
      await this.getData();
      this.getNextWorkFlow();
    } finally {
      isBusy.endBusy();
    }
  }

  public onSelectionChanged(workflows: PortalRequestsWorkflowsSubmethods[]): void {
    this.selectedWorkFlows = workflows;
  }

  public async deleteMultiple(): Promise<void> {
    if (!await this.confirmation.confirm({
      Title: '#LDS#Heading Delete Workflow',
      Message: this.selectedWorkFlows.length > 1
        ? this.ldsReplace.transform('#LDS#Are you sure you want to delete {0} workflows?', this.selectedWorkFlows.length)
        : '#LDS#Are you sure you want to delete the workflow?'
    })) {
      return;
    }
    this.approvalWorkFlowDataService.handleOpenLoader();
    try {
      await Promise.all(
        this.selectedWorkFlows.map((workFlow) => this.approvalWorkFlowDataService.workFlowDelete(workFlow.GetEntity().GetKeys().join(',')))
      );
      await this.getData();
      this.selectedWorkFlows = [];
      this.dataTable.clearSelection();
    } finally {
      this.approvalWorkFlowDataService.handleCloseLoader();
    }
  }

  public async getNextWorkFlow(): Promise<void> {
    if (Promise.all([this.standbyPromise])) {
      this.standbyWorkFlowInteractive = undefined;
      this.standbyPromise = this.approvalWorkFlowDataService.getNewWorkFlow().then((workflow) => {
        this.standbyWorkFlowInteractive = workflow;
      });
    }
  }

  public async getData(newState?: CollectionLoadParameters): Promise<void> {
    const isBusy = this.busyService.beginBusy();
    try {
      this.dstSettings = await this.dstWrapper.getDstSettings(newState);
    } finally {
      isBusy.endBusy();
    }
  }

  public async createWorkflow(): Promise<void> {
    if (this.standbyWorkFlowInteractive === undefined) {
      this.approvalWorkFlowDataService.handleOpenLoader();
      try {
        await Promise.all([this.standbyPromise]);
      } finally {
        this.approvalWorkFlowDataService.handleCloseLoader();
      }
    }
    this.helpContextualService.setHelpContextId(HELP_CONTEXTUAL.ApprovalWorkflowManagerCreate);
    const requestData: RequestWorkflowData = {
      Object: this.standbyWorkFlowInteractive,
      Data: this.approvalWorkFlowDataService.approvalWorkFlowRequestColumns,
      SaveBeforeClosing: true,
    };
    const result = await this.sidesheetService
      .open(ApprovalWorkflowFormComponent, {
        title: await this.translate.get('#LDS#Heading Create Approval Workflow').toPromise(),
        icon: 'add',
        padding: '0',
        width: 'max(700px, 70%)',
        disableClose: true,
        testId: 'approval-workflow-create-sidesheet',
        data: requestData,
        headerComponent: HelpContextualComponent
      })
      .afterClosed()
      .toPromise();

    if (result) {
      try {
        // Move directly into the editor
        await this.viewDetails({ isNew: true });
        this.getNextWorkFlow();
      } catch (error) {
        this.errorHandler.handleError(error);
      }
    }
  }

  public async grabInteractive(key: string): Promise<EditorData> {
    const workFlowInteractive = await this.approvalWorkFlowDataService.getWorkFlowInteractve(key);
    const workFlowSteps = await this.approvalWorkFlowDataService.getWorkFlowSteps(key);
    return {
      WorkFlowKey: key,
      WorkFlow: workFlowInteractive,
      WorkFlowSteps: workFlowSteps,
    };
  }

  public async viewDetails(args: { workFlow?: PortalRequestsWorkflowsSubmethods; isNew?: boolean }): Promise<void> {
    this.approvalWorkFlowDataService.handleOpenLoader();
    try {
      let sideSheetData: EditorData;
      if (args.isNew) {
        sideSheetData = {
          WorkFlowKey: this.standbyWorkFlowInteractive.GetEntity().GetKeys()[0],
          WorkFlow: this.standbyWorkFlowInteractive,
          WorkFlowSteps: [],
        };
      } else {
        // Make API call for details, throw an error if we fail
        sideSheetData = await this.grabInteractive(args.workFlow.GetEntity().GetKeys()[0]);
      }
      const result = await this.sidesheetService
        .open(ApprovalWorkflowEditComponent, {
          title: await this.translate.get('#LDS#Heading Edit Approval Workflow').toPromise(),
          icon: 'workflow',
          padding: '0',
          width: 'max(700px, 70%)',
          disableClose: true,
          testId: 'approval-workflow-edit-sidesheet',
          data: sideSheetData,
        })
        .afterClosed()
        .toPromise();
      if (result || args.isNew) {
        // Sidesheet says we should update the data in the table
        await this.getData();
      }
    } catch (error) {
      this.errorHandler.handleError(error);
    }
    this.approvalWorkFlowDataService.handleCloseLoader();
  }
}
