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
 * Copyright 2022 One Identity LLC.
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

import { Injectable, Type } from '@angular/core';
import { OverlayRef } from '@angular/cdk/overlay';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';

import { ValType } from 'imx-qbm-dbts';
import { BaseCdr, ClassloggerService, EntityService, ExtService, SnackBarService } from 'qbm';
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
import { TermsOfUseAcceptComponent } from '../../terms-of-use/terms-of-use-accept.component';

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
    private readonly logger: ClassloggerService,
    private readonly person: PersonService,
    private readonly projectConfig: ProjectConfigurationService,
    private readonly approvalsService: ApprovalsService,
    private readonly justificationService: JustificationService,
    private readonly extService: ExtService,
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

  public async withDrawApprover(requests: Approval[]): Promise<void> {
    const actionParameters = {
      reason: this.createCdrReason()
    };

    return this.editAction({
      title: '#LDS#Heading Withdraw Additional Approver',
      message: '#LDS#The additional approvers of {0} requests have been successfully withdrawn.',
      data: {
        actionParameters,
        requests
      },
      apply: (request: Approval) => this.approvalsService.withdrawAdditionalApprover(request, { Reason: actionParameters.reason.column.GetValue() })
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

  public async checkMFA(uidPwo: string[]): Promise<boolean> {
    this.busyService.show();
    let workflowActionId: string;
    let mfaComponent: Type<any>;
    let response: boolean;
    try {
      workflowActionId = await this.apiService.v2Client.portal_itshop_approve_requests_stepup_post({UidPwo: uidPwo});
      mfaComponent = (await this.extService.getFittingComponent('mfaComponent')).instance;
    } catch {
      throw Error('The OLG module is not configured correctly');
    } finally {
      this.busyService.hide();
    }
    response = await this.sideSheet.open(mfaComponent, {
      title: await this.translate.get('#LDS#Header Authenticate using OneLogin').toPromise(),
      padding: '0px',
      headerColour: 'iris-blue',
      bodyColour: 'asher-gray',
      testId: 'imx-request-approval-mfa',
      width: 'max(700px, 60%)',
      data: {
        workflowActionId
      }
    }).afterClosed().toPromise();
    return response;
  }

  public async approve(requests: Approval[]): Promise<void> {

    if (!await this.checkTermsOfUse(requests)) {
      this.snackBar.open({ key: '#LDS#You have canceled the action.' });
      return;
    }

    const schema = this.apiService.typedClient.PortalItshopApproveRequests.GetSchema();
    // Check for itshop stepup and if any cases have mfa required
    const itShopConfig = (await this.projectConfig.getConfig()).ITShopConfig;
    const uidCases: string[] = []
    const anyMFACases = requests.map(request => {
      uidCases.push(request.GetEntity().GetKeys()[0])
      return request?.IsApproveRequiresMfa.value;
    }).some(isMFA => isMFA);

    if (itShopConfig && itShopConfig.StepUpAuthenticationProvider !== 'NoAuth' && anyMFACases) {
      // Check for MFA, don't continue unless true
      const isMFA = await this.checkMFA(uidCases);
      if (!isMFA) {
        return;
      }
    }

    let justification: BaseCdr;

    let busyIndicator: OverlayRef;
    setTimeout(() => busyIndicator = this.busyService.show());

    const maxApproveReasonType = Math.max(...requests.map(elem => elem.ApproveReasonType.value));

    try {
      justification = await this.justificationService.createCdr(JustificationType.approve, maxApproveReasonType);
    } finally {
      setTimeout(() => this.busyService.hide(busyIndicator));
    }

    const actionParameters: WorkflowActionParameters = {
      maxReasonType: maxApproveReasonType,
      justification,
      reason: this.createCdrReason(justification ? '#LDS#Additional comments about your decision' : undefined, maxApproveReasonType)
    };

    const showValidDate: { [key: string]: any } = {};

    const minDateFrom = new Date();

    if (itShopConfig && itShopConfig.VI_ITShop_ApproverCanSetValidFrom &&
      requests.some(item => item.canSetValidFrom())) {
      showValidDate.validFrom = { key: 'validFrom', placeholder: '#LDS#immediately' };

      const validFromColumn = this.entityService.createLocalEntityColumn(
        schema.Columns.ValidFrom,
        undefined,
        { ValueConstraint: { MinValue: minDateFrom } }
      );

      actionParameters[showValidDate.validFrom.key] = new BaseCdr(validFromColumn);
    }

    if (itShopConfig && itShopConfig.VI_ITShop_ApproverCanSetValidUntil &&
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

    const maxDenyReasonType = Math.max(...requests.map(elem => elem.DenyReasonType.value));
    try {
      justification = await this.justificationService.createCdr(JustificationType.deny, maxDenyReasonType);
    } finally {
      setTimeout(() => this.busyService.hide(busyIndicator));
    }

    const actionParameters: WorkflowActionParameters = {
      justification,
      maxReasonType: maxDenyReasonType,
      reason: this.createCdrReason(justification ? '#LDS#Additional comments about your decision' : undefined, maxDenyReasonType)
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

  private createCdrReason(display?: string, reasonType?: number): BaseCdr {
    const column = this.entityService.createLocalEntityColumn({
      ColumnName: 'ReasonHead',
      Type: ValType.Text,
      IsMultiLine: true,
      MinLen: reasonType === 2 ? 1 : 0
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

  private async checkTermsOfUse(requests: Approval[]): Promise<boolean> {

    // get all cart items with terms of uses
    const approvalItemsWithTermsOfUseToAccept = requests.filter(item =>
      item.UID_QERTermsOfUse?.value !== null
      && item.UID_QERTermsOfUse?.value !== ''
    );

    if (approvalItemsWithTermsOfUseToAccept.length > 0) {
      this.logger.debug(this,
        `There are ${approvalItemsWithTermsOfUseToAccept.length} service items with terms of use the user have to accepted.`);

      const termsOfUseAccepted = await this.sideSheet.open(TermsOfUseAcceptComponent, {
        title: await this.translate.get('#LDS#Heading Accept Terms Of Use').toPromise(),
        headerColour: 'iris-blue',
        bodyColour: 'asher-gray',
        padding: '0px',
        width: 'max(600px, 60%)',
        data: {
          acceptCartItems: false,
          approvalItems: approvalItemsWithTermsOfUseToAccept
        },
        testId: 'approvalitems-terms-of-use-accept-sidesheet'
      }).afterClosed().toPromise();

      if (termsOfUseAccepted) {
        this.logger.debug(this, 'all terms of use were accepted.');
        return true;
      } else {
        this.logger.debug(this, 'at least one terms of use was not accepted.');
        return false;
      }

    } else {
      this.logger.debug(this, 'there are no service items with terms of use the user have to accepted.');
      return true;
    }
  }
}
