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

import { Injectable } from '@angular/core';
import { OverlayRef } from '@angular/cdk/overlay';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';

import { ValType } from 'imx-qbm-dbts';
import { BaseCdr, EntityService, SnackBarService } from 'qbm';
import { WorkflowActionComponent } from './workflow-action.component';
import { ProjectConfigurationService } from '../../project-configuration/project-configuration.service';
import { PersonService } from '../../person/person.service';
import { Approval } from '../approval';
import { ApprovalsService } from '../approvals.service';
import { QerApiService } from '../../qer-api-client.service';
import { JustificationService } from '../../justification/justification.service';
import { JustificationType } from '../../justification/justification-type.enum';
import { WorkflowActionEditWrapper } from './workflow-action-edit-wrapper.interface';
import { WorkflowActionParameters } from './workflow-action-parameters.interface';

@Injectable({
  providedIn: 'root'
})
export class WorkflowActionService {

  public readonly applied = new Subject();

  constructor(
    private readonly apiService: QerApiService,
    private readonly sideSheet: EuiSidesheetService,
    private readonly translate: TranslateService,
    private readonly entityService: EntityService,
    private readonly busyService: EuiLoadingService,
    private readonly snackBar: SnackBarService,
    private readonly person: PersonService,
    private readonly projectConfig: ProjectConfigurationService,
    private readonly approvalsService: ApprovalsService,
    private readonly justificationService: JustificationService
  ) { }

  public async directDecisions(requests: Approval[], userUid: string): Promise<void> {
    const actionParameters = {
      reason: this.createCdrReason()
    };

    const schema = this.apiService.typedClient.PortalWorkflow.GetSchema();
    const workflow = {
      title: '#LDS#Approval level',
      placeholder: '#LDS#Select approval level',
      entitySchema: schema,
      display: { primary: schema.Columns.LevelDisplay },
      data: {}
    };

    for (const request of requests) {
      const workFlowDataCollection = await this.apiService.typedClient.PortalWorkflow.Get(request.key,
        { PageSize: 1000, /* TODO: why 1000? */ });

      if (workFlowDataCollection && workFlowDataCollection.Data) {
        const levelNumbers = request.getLevelNumbers(userUid);
        workflow.data[request.key] = workFlowDataCollection.Data
          .filter(item => levelNumbers.includes(item.LevelNumber.value))
          .map(item => item.GetEntity());
      }
    }

    return this.editAction({
      title: '#LDS#Heading Reroute Approval',
      message: '#LDS#{0} approvals have been successfully rerouted.',
      data: {
        requests,
        actionParameters,
        workflow
      },
      apply: (request: Approval) => this.approvalsService.directDecision(request, {
        Offset: request.decisionOffset,
        Reason: actionParameters.reason.column.GetValue()
      })
    });
  }

  public async addAdditionalApprovers(requests: Approval[]): Promise<void> {
    const actionParameters = {
      uidPerson: this.createCdrPerson('#LDS#Additional approver'),
      reason: this.createCdrReason()
    };

    return this.editAction({
      title: '#LDS#Heading Add Additional Approver',
      message: '#LDS#"{1}" has been successfully added as additional approver for {0} requests.',
      data: {
        description: '#LDS#Specify an additional approver',
        actionParameters,
        requests
      },
      apply: (request: Approval) => this.approvalsService.addApprover(request, {
        Reason: actionParameters.reason.column.GetValue(),
        UidPerson: actionParameters.uidPerson.column.GetValue()
      })
    });
  }

  public async delegateDecisions(requests: Approval[]): Promise<void> {
    const actionParameters = {
      uidPerson: this.createCdrPerson('#LDS#Delegate to'),
      reason: this.createCdrReason()
    };

    return this.editAction({
      title: '#LDS#Heading Delegate Approval',
      message: '#LDS#{0} approvals have been successfully delegated to "{1}".',
      data: {
        description: '#LDS#Specify an identity who should decide instead',
        actionParameters,
        requests
      },
      apply: (request: Approval) => this.approvalsService.delegateDecision(request, {
        Reason: actionParameters.reason.column.GetValue(),
        UidPerson: actionParameters.uidPerson.column.GetValue()
      })
    });
  }

  public async revokeDelegations(requests: Approval[], withdrawAddApprover: boolean = true): Promise<void> {
    const actionParameters = {
      reason: this.createCdrReason()
    };

    return this.editAction({
      title: withdrawAddApprover ? '#LDS#Heading Withdraw Additional Approver' : '#LDS#Heading Withdraw Delegation',
      message: '#LDS#The additional approvers of {0} requests have been successfully withdrawn.',
      data: {
        actionParameters,
        requests
      },
      apply: (request: Approval) => this.approvalsService.revokeDelegation(request, { Reason: actionParameters.reason.column.GetValue() })
    });
  }

  public async denyDecisions(requests: Approval[]): Promise<void> {
    const actionParameters = {
      reason: this.createCdrReason()
    };

    return this.editAction({
      title: '#LDS#Heading Reject Approval',
      message: '#LDS#{0} approvals have been successfully rejected.',
      data: {
        actionParameters,
        requests
      },
      apply: (request: Approval) => this.approvalsService.denyDecision(request, {
        Reason: actionParameters.reason.column.GetValue()
      })
    });
  }

  public async escalateDecisions(requests: Approval[]): Promise<void> {
    const actionParameters = {
      reason: this.createCdrReason()
    };

    return this.editAction({
      title: '#LDS#Heading Escalate Approval',
      message: '#LDS#{0} approvals have been successfully escalated.',
      data: {
        actionParameters,
        requests
      },
      apply: (request: Approval) => this.approvalsService.escalateDecision(request, actionParameters.reason.column.GetValue())
    });
  }

  public async approve(requests: Approval[]): Promise<void> {
    const itShopConfig = (await this.projectConfig.getConfig()).ITShopConfig;

    const schema = this.apiService.typedClient.PortalItshopApproveRequests.GetSchema();

    let justification: BaseCdr;

    let busyIndicator: OverlayRef;
    setTimeout(() => busyIndicator = this.busyService.show());

    try {
      justification = await this.justificationService.createCdr(JustificationType.approve);
    } finally {
      setTimeout(() => this.busyService.hide(busyIndicator));
    }

    const actionParameters: WorkflowActionParameters = {
      justification,
      reason: this.createCdrReason(justification ? '#LDS#Additional comments about your decision' : undefined)
    };

    const showValidDate: { [key: string]: any } = {};

    const minDateFrom = new Date();

    if (itShopConfig.VI_ITShop_ApproverCanSetValidFrom &&
      requests.some(item => item.canSetValidFrom())) {
      showValidDate.validFrom = { key: 'validFrom', placeholder: '#LDS#immediately' };

      const validFromColumn = this.entityService.createLocalEntityColumn(
        schema.Columns.ValidFrom,
        undefined,
        { ValueConstraint: { MinValue: minDateFrom } }
      );

      actionParameters[showValidDate.validFrom.key] = new BaseCdr(validFromColumn);
    }

    if (itShopConfig.VI_ITShop_ApproverCanSetValidUntil &&
      requests.some(item => item.canSetValidUntil(itShopConfig))) {
      showValidDate.validUntil = { key: 'validUntil', placeholder: '#LDS#unlimited' };

      const minDateUntil = new Date();
      minDateUntil.setDate(minDateFrom.getDate() + 1);

      const validUntilColumn = this.entityService.createLocalEntityColumn(
        schema.Columns.ValidUntil,
        undefined,
        { ValueConstraint: { MinValue: minDateUntil } }
      );

      actionParameters[showValidDate.validUntil.key] = new BaseCdr(validUntilColumn);
    }

    const addTimeNowToDate = date => {
      const dateTime = new Date(date);
      const now = new Date();
      dateTime.setHours(
        now.getHours(),
        now.getMinutes() + 1
      );
      return dateTime;
    };

    return this.editAction({
      title: '#LDS#Heading Approve Request',
      headerColour: 'aspen-green',
      message: '#LDS#{0} requests have been successfully approved.',
      discardChangesOnAbort: true,
      data: {
        requests,
        approve: true,
        actionParameters,
        showValidDate
      },
      apply: async (request: Approval) => {
        if (request.canSetValidFrom() && actionParameters.validFrom) {
          const from = actionParameters.validFrom.column.GetValue();
          if (from) {
            request.ValidFrom.value = addTimeNowToDate(from);
          }
        }

        if (request.canSetValidUntil(itShopConfig) && actionParameters.validUntil) {
          const until = actionParameters.validUntil.column.GetValue();
          if (until) {
            request.ValidUntil.value = addTimeNowToDate(until);
          }
        }

        await request.commit();
        await this.approvalsService.makeDecision(request, {
          Reason: actionParameters.reason.column.GetValue(),
          UidJustification: actionParameters.justification?.column?.GetValue(),
          Decision: true
        });
      }
    });
  }

  public async deny(requests: Approval[]): Promise<void> {
    const itShopConfig = (await this.projectConfig.getConfig()).ITShopConfig;

    let justification: BaseCdr;

    let busyIndicator: OverlayRef;
    setTimeout(() => busyIndicator = this.busyService.show());

    try {
      justification = await this.justificationService.createCdr(JustificationType.deny);
    } finally {
      setTimeout(() => this.busyService.hide(busyIndicator));
    }

    const actionParameters: WorkflowActionParameters = {
      justification,
      reason: this.createCdrReason(justification ? '#LDS#Additional comments about your decision' : undefined)
    };

    return this.editAction(
      {
        title: '#LDS#Heading Deny Request',
        headerColour: 'corbin-orange',
        message: '#LDS#{0} requests have been successfully denied.',
        discardChangesOnAbort: true,
        data: {
          requests,
          actionParameters,
          customValidation: itShopConfig.VI_ITShop_ApproverReasonMandatoryOnDeny ? {
            validate: () => {
              const reasonValue = actionParameters.reason.column.GetValue();
              const justificationValue = actionParameters.justification?.column?.GetValue();
              return (reasonValue != null && reasonValue.length > 0) ||
                (justificationValue != null && justificationValue.length > 0);
            },
            message: '#LDS#Please enter or select a reason for your decision.'
          } : undefined
        },
        apply: async (request: Approval) => {
          try {
            await request.GetEntity().Commit(true);
            await this.approvalsService.makeDecision(request, {
              Reason: actionParameters.reason.column.GetValue(),
              UidJustification: actionParameters.justification?.column?.GetValue(),
              Decision: false
            });
          } catch (error) {
            await request.GetEntity().DiscardChanges();
            throw error;
          }
        }
      }
    );
  }

  private async editAction(config: WorkflowActionEditWrapper): Promise<void> {
    const result = await this.sideSheet.open(WorkflowActionComponent, {
      title: await this.translate.get(config.title).toPromise(),
      headerColour: config.headerColour ?? 'iris-blue',
      bodyColour: 'asher-gray',
      padding: '10px',
      width: '600px',
      testId: 'workflow-action',
      data: config.data
    }).afterClosed().toPromise();

    if (result) {
      let busyIndicator: OverlayRef;
      setTimeout(() => busyIndicator = this.busyService.show());

      let success: boolean;
      try {
        for (const request of config.data.requests) {
          await config.apply(request);
        }
        success = true;
      } finally {
        setTimeout(() => this.busyService.hide(busyIndicator));
      }

      if (success) {
        this.snackBar.open({
          key: config.message, parameters: [config.data.requests.length,
          config.data.actionParameters.uidPerson ? config.data.actionParameters.uidPerson.column.GetDisplayValue() : '']
        });
        this.applied.next();
      }
    } else {
      if (config.discardChangesOnAbort) {
        for (const approval of config.data.requests) {
          await approval.GetEntity().DiscardChanges();
        }
      }
      this.snackBar.open({ key: '#LDS#You have canceled the action.' });
    }
  }

  private createCdrReason(display?: string): BaseCdr {
    const column = this.entityService.createLocalEntityColumn({
      ColumnName: 'ReasonHead',
      Type: ValType.Text,
      IsMultiLine: true
    });

    return new BaseCdr(column, display || '#LDS#Reason for your decision');
  }

  private createCdrPerson(display: string): BaseCdr {
    const fkRelation = {
      ChildColumnName: 'UID_PersonRelated',
      ParentTableName: 'Person',
      ParentColumnName: 'UID_Person',
      IsMemberRelation: false
    };

    const column = this.entityService.createLocalEntityColumn(
      {
        ColumnName: fkRelation.ChildColumnName,
        Type: ValType.String,
        FkRelation: fkRelation,
        IsValidColumnForFiltering: true,
        MinLen: 1
      },
      [this.person.createFkProviderItem(fkRelation)]
    );

    return new BaseCdr(column, display);
  }
}
