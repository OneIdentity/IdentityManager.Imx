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

import { Injectable, Type } from '@angular/core';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';

import { AbstractControl } from '@angular/forms';
import {
  CollectionLoadParameters,
  CompareOperator,
  EntityData,
  FilterData,
  FilterType,
  FkProviderItem,
  MetaTableRelationData,
  TypedEntity,
  ValType,
} from '@imx-modules/imx-qbm-dbts';
import { Moment } from 'moment';
import {
  Action,
  BaseCdr,
  BaseReadonlyCdr,
  ClassloggerService,
  EntityService,
  ExtService,
  ProcessingQueueService,
  SnackBarService,
  calculateSidesheetWidth,
} from 'qbm';
import { JustificationType } from '../../justification/justification-type.enum';
import { JustificationService } from '../../justification/justification.service';
import { PersonService } from '../../person/person.service';
import { ProjectConfigurationService } from '../../project-configuration/project-configuration.service';
import { QerApiService } from '../../qer-api-client.service';
import { TermsOfUseAcceptComponent } from '../../terms-of-use/terms-of-use-accept.component';
import { UserModelService } from '../../user/user-model.service';
import { Approval } from '../approval';
import { ApprovalsService } from '../approvals.service';
import { WorkflowActionEditWrapper } from './workflow-action-edit-wrapper.interface';
import { WorkflowActionParameters } from './workflow-action-parameters.interface';
import { WorkflowActionComponent } from './workflow-action.component';

@Injectable({
  providedIn: 'root',
})
export class WorkflowActionService {
  public readonly applied = new Subject<void>();

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
    private readonly userService: UserModelService,
    private readonly queueService: ProcessingQueueService,
  ) {}

  public async directDecisions(requests: (Approval | TypedEntity)[], userUid: string): Promise<void> {
    const actionParameters = {
      reason: this.createCdrReason(),
    };

    const schema = this.apiService.typedClient.PortalWorkflow.GetSchema();
    const workflow = {
      title: '#LDS#Approval level',
      placeholder: '#LDS#Select approval level',
      entitySchema: schema,
      display: { primary: schema.Columns.LevelDisplay },
      data: {},
    };

    for (const req of requests) {
      const request = req as Approval;
      const workFlowDataCollection = await this.apiService.typedClient.PortalWorkflow.Get(request.key, {
        PageSize: 1000 /* TODO: why 1000? */,
      });

      if (workFlowDataCollection && workFlowDataCollection.Data) {
        const levelNumbers = request.getLevelNumbers(userUid);
        workflow.data[request.key] = workFlowDataCollection.Data.filter((item) => levelNumbers.includes(item.LevelNumber.value)).map(
          (item) => item.GetEntity(),
        );
      }
    }

    return this.editAction({
      title: '#LDS#Heading Reroute Approval',
      message: '#LDS#{0} approvals have been successfully rerouted.',
      data: {
        requests,
        actionParameters,
        workflow,
      },
      apply: (request: Approval) =>
        this.approvalsService.directDecision(request, {
          Offset: request.decisionOffset,
          Reason: actionParameters.reason.column.GetValue(),
        }),
    });
  }

  public async addAdditionalApprovers(requests: TypedEntity[]): Promise<void> {
    const actionParameters = {
      uidPerson: this.createCdrPerson('#LDS#Additional approver'),
      reason: this.createCdrReason(),
    };

    return this.editAction({
      title: '#LDS#Heading Add Additional Approver',
      message: '#LDS#"{1}" has been successfully added as additional approver for {0} requests.',
      data: {
        description: '#LDS#Specify an additional approver',
        actionParameters,
        requests,
      },
      apply: (request: Approval) =>
        this.approvalsService.addApprover(request, {
          Reason: actionParameters.reason.column.GetValue(),
          UidPerson: actionParameters.uidPerson.column.GetValue(),
        }),
    });
  }

  public async withDrawApprover(requests: TypedEntity[]): Promise<void> {
    const actionParameters = {
      reason: this.createCdrReason(),
    };

    return this.editAction({
      title: '#LDS#Heading Withdraw Additional Approver',
      message: '#LDS#The additional approvers of {0} requests have been successfully withdrawn.',
      data: {
        actionParameters,
        requests,
      },
      apply: (request: Approval) =>
        this.approvalsService.withdrawAdditionalApprover(request, { Reason: actionParameters.reason.column.GetValue() }),
    });
  }

  public async delegateDecisions(requests: TypedEntity[]): Promise<void> {
    const actionParameters = {
      uidPerson: this.createCdrPerson('#LDS#Delegate to'),
      reason: this.createCdrReason(),
    };

    return this.editAction({
      title: '#LDS#Heading Delegate Approval',
      message: '#LDS#{0} approvals have been successfully delegated to "{1}".',
      data: {
        description: '#LDS#Specify an identity who should decide instead',
        actionParameters,
        requests,
      },
      apply: (request: Approval) =>
        this.approvalsService.delegateDecision(request, {
          Reason: actionParameters.reason.column.GetValue(),
          UidPerson: actionParameters.uidPerson.column.GetValue(),
        }),
    });
  }

  public async revokeDelegations(requests: TypedEntity[], withdrawAddApprover: boolean = true): Promise<void> {
    const actionParameters = {
      reason: this.createCdrReason(),
    };

    return this.editAction({
      title: withdrawAddApprover ? '#LDS#Heading Withdraw Additional Approver' : '#LDS#Heading Withdraw Delegation',
      message: '#LDS#The additional approvers of {0} requests have been successfully withdrawn.',
      data: {
        actionParameters,
        requests,
      },
      apply: (request: Approval) => this.approvalsService.revokeDelegation(request, { Reason: actionParameters.reason.column.GetValue() }),
    });
  }

  public async denyDecisions(requests: TypedEntity[]): Promise<void> {
    const actionParameters = {
      reason: this.createCdrReason(),
    };

    return this.editAction({
      title: '#LDS#Heading Reject Approval',
      message: '#LDS#{0} approvals have been successfully rejected.',
      data: {
        actionParameters,
        requests,
      },
      apply: (request: Approval) =>
        this.approvalsService.denyDecision(request, {
          Reason: actionParameters.reason.column.GetValue(),
        }),
    });
  }

  public async escalateDecisions(requests: TypedEntity[]): Promise<void> {
    const actionParameters = {
      reason: this.createCdrReason(),
    };

    return this.editAction({
      title: '#LDS#Heading Escalate Approval',
      message: '#LDS#{0} approvals have been successfully escalated.',
      data: {
        actionParameters,
        requests,
      },
      apply: (request: Approval) => this.approvalsService.escalateDecision(request, actionParameters.reason.column.GetValue()),
    });
  }

  public async checkMFA(uidPwo: string[]): Promise<boolean> {
    this.busyService.show();
    let workflowActionId: string = '';
    let mfaComponent: Type<any> | undefined;
    let response: boolean = false;
    try {
      workflowActionId = (await this.getStepupId(uidPwo)) || '';
      mfaComponent = (await this.extService.getFittingComponent('mfaComponent'))?.instance;
    } catch (err) {
      throw Error('The OLG module is not configured correctly');
    } finally {
      this.busyService.hide();
      if (mfaComponent) {
        response = await this.sideSheet
          .open(mfaComponent, {
            title: await this.translate.get('#LDS#Heading Authenticate Using OneLogin').toPromise(),
            padding: '0px',
            testId: 'imx-request-approval-mfa',
            width: calculateSidesheetWidth(1000),
            data: {
              workflowActionId,
            },
          })
          .afterClosed()
          .toPromise();
      }
    }
    return response;
  }

  public async getStepupId(uidPwo: string[]): Promise<string> {
    return this.apiService.v2Client.portal_itshop_approve_requests_stepup_post({ UidPwo: uidPwo });
  }

  public async approve(entities: (Approval | TypedEntity)[]): Promise<void> {
    const requests = entities as Approval[];
    const term = await this.checkTermsOfUse(requests);
    if (!term.isChecked) {
      this.snackBar.open({ key: '#LDS#You have canceled the action.' });
      return;
    }

    const itShopConfig = (await this.projectConfig.getConfig()).ITShopConfig;

    const schema = this.apiService.typedClient.PortalItshopApproveRequests.GetSchema();
    const mfaRequests = requests.filter((req) => req.IsApproveRequiresMfa?.value);
    if (itShopConfig && itShopConfig.StepUpAuthenticationProvider !== 'NoAuth' && mfaRequests.length > 0) {
      // Check for MFA, don't continue unless true
      const isMFA = term.isAuthenticated || (await this.checkMFA(mfaRequests.map((request) => request.key)));
      if (!isMFA) {
        return;
      }
    }

    let justification: BaseCdr | undefined;

    this.showBusyIndicator();

    const maxApproveReasonType = Math.max(...requests.map((elem) => elem.ApproveReasonType.value));

    try {
      justification = await this.justificationService.createCdr(JustificationType.approve);
    } finally {
      this.busyService.hide();
    }

    const actionParameters: WorkflowActionParameters = {
      maxReasonType: maxApproveReasonType,
      justification,
      reason: this.createCdrReason(justification ? '#LDS#Additional comments about your decision' : undefined),
    };

    const showValidDate: { [key: string]: any } = {};

    const minDateFrom = new Date();

    if (itShopConfig && itShopConfig.VI_ITShop_ApproverCanSetValidFrom && requests.some((item) => item.canSetValidFrom())) {
      showValidDate.validFrom = { key: 'validFrom', placeholder: '#LDS#immediately' };

      const validFromColumn = this.entityService.createLocalEntityColumn(schema.Columns.ValidFrom, undefined, {
        ValueConstraint: { MinValue: minDateFrom },
      });

      actionParameters[showValidDate.validFrom.key] = new BaseCdr(validFromColumn);
    }

    if (itShopConfig && itShopConfig.VI_ITShop_ApproverCanSetValidUntil && requests.some((item) => item.canSetValidUntil(itShopConfig))) {
      showValidDate.validUntil = { key: 'validUntil', placeholder: '#LDS#unlimited' };

      const minDateUntil = new Date();
      minDateUntil.setDate(minDateFrom.getDate() + 1);

      const validUntilColumn = this.entityService.createLocalEntityColumn(schema.Columns.ValidUntil, undefined, {
        ValueConstraint: { MinValue: minDateUntil },
      });

      actionParameters[showValidDate.validUntil.key] = new BaseCdr(validUntilColumn);
    }

    const addTimeNowToDate = (date) => {
      const dateTime = new Date(date);
      const now = new Date();
      dateTime.setHours(now.getHours(), now.getMinutes() + 1);
      return dateTime;
    };

    return this.editAction({
      title: '#LDS#Heading Approve Request',
      message: '#LDS#{0} requests have been successfully approved.',
      discardChangesOnAbort: true,
      data: {
        requests,
        approve: true,
        actionParameters,
        showValidDate,
        withGuidance: true,
        customValidation: {
          validate: (control: AbstractControl) => {
            const validUntilMoment: Moment = control.value[schema.Columns.ValidUntil.ColumnName!];
            const validFromMoment: Moment = control.value[schema.Columns.ValidFrom.ColumnName!];
            if (!!validFromMoment && !!validUntilMoment && !validUntilMoment.isAfter(validFromMoment)) {
              return false;
            }
            return true;
          },
          message:
            '#LDS#The validity period you specified is not valid. The validity end date lies before the validity start date, or vice versa. Change the validity period.',
        },
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
          Reason: actionParameters.reason?.column.GetValue(),
          UidJustification: actionParameters.justification?.column?.GetValue(),
          Decision: true,
        });
      },
    });
  }

  public async deny(requests: TypedEntity[]): Promise<void> {
    const itShopConfig = (await this.projectConfig.getConfig()).ITShopConfig;

    let justification: BaseCdr | undefined;

    this.showBusyIndicator();

    const maxDenyReasonType = Math.max(...requests.map((elem: Approval) => elem.DenyReasonType.value));
    try {
      justification = await this.justificationService.createCdr(JustificationType.deny);
    } finally {
      this.busyService.hide();
    }

    const actionParameters: WorkflowActionParameters = {
      justification,
      maxReasonType: maxDenyReasonType,
      reason: this.createCdrReason(justification ? '#LDS#Additional comments about your decision' : undefined),
    };

    return this.editAction({
      title: '#LDS#Heading Deny Request',
      message: '#LDS#{0} requests have been successfully denied.',
      discardChangesOnAbort: true,
      data: {
        requests,
        actionParameters,
        withGuidance: true,
        customValidation: itShopConfig?.VI_ITShop_ApproverReasonMandatoryOnDeny
          ? {
              validate: () => {
                const reasonValue = actionParameters.reason?.column.GetValue();
                const justificationValue = actionParameters.justification?.column?.GetValue();
                return (reasonValue != null && reasonValue.length > 0) || (justificationValue != null && justificationValue.length > 0);
              },
              message: '#LDS#Please enter or select a reason for your decision.',
            }
          : undefined,
      },
      apply: async (request: Approval) => {
        try {
          await request.GetEntity().Commit(true);
          await this.approvalsService.makeDecision(request, {
            Reason: actionParameters.reason?.column.GetValue(),
            UidJustification: actionParameters.justification?.column?.GetValue(),
            Decision: false,
          });
        } catch (error) {
          await request.GetEntity().DiscardChanges();
          throw error;
        }
      },
    });
  }

  public async recallInquiry(requests: TypedEntity[]): Promise<void> {
    const actionParameters = {
      reason: this.createCdrReason(),
    };

    return this.editAction({
      title: '#LDS#Heading Withdraw Inquiry',
      message: '#LDS#The inquiry has been successfully withdrawn.',
      data: {
        actionParameters,
        requests,
      },
      apply: (request: Approval) => this.approvalsService.recallInquiry(request, { Reason: actionParameters.reason.column.GetValue() }),
    });
  }

  public async resetReservation(requests: TypedEntity[]): Promise<void> {
    return this.editAction({
      title: '#LDS#Heading Cancel Reservation',
      message: '#LDS#The reservation has been successfully canceled.',
      data: {
        actionParameters: {},
        requests,
      },
      apply: (request: Approval) => this.approvalsService.resetReservation(request, { Reason: '' }),
    });
  }

  public async askForHelp(requests: Approval[], uidPerson: string): Promise<void> {
    const actionParameters = {
      reason: this.createCdrText(),
      uidPerson: this.createCdrQuestioneer(uidPerson),
    };

    return this.editAction({
      title: '#LDS#Heading Send Inquiry',
      message: '#LDS#The inquiry has been successfully sent.',
      data: {
        actionParameters,
        requests,
      },
      apply: (request: Approval) =>
        this.approvalsService.askForHelp(request, {
          UidPerson: actionParameters.uidPerson.column.GetValue(),
          Text: actionParameters.reason.column.GetValue(),
        }),
    });
  }

  public async answerQuestion(request: Approval, userUid: string): Promise<void> {
    const actionParameters = {
      reason: this.createCdrReason('#LDS#Reply', 2),
    };

    const pwo = this.getPwoData(request, userUid);
    const additionalInfo = [
      new BaseReadonlyCdr(
        this.entityService.createLocalEntityColumn(
          { Type: ValType.Date, ColumnName: 'DateHead', Display: '#LDS#Inquiry made on' },
          undefined,
          pwo?.Columns?.DateHead,
        ),
      ),
      new BaseReadonlyCdr(
        this.entityService.createLocalEntityColumn(
          { Type: ValType.String, ColumnName: 'ReasonHead', Display: '#LDS#Inquiry' },
          undefined,
          pwo?.Columns?.ReasonHead,
        ),
      ),
      new BaseReadonlyCdr(
        this.entityService.createLocalEntityColumn(
          { Type: ValType.String, ColumnName: 'DisplayPersonHead', Display: '#LDS#Inquiry made by' },
          undefined,
          pwo?.Columns?.DisplayPersonHead,
        ),
      ),
    ];

    return this.editAction({
      title: '#LDS#Heading Reply to Inquiry',
      message: '#LDS#The reply to the inquiry has been successfully sent.',
      data: {
        actionParameters,
        additionalInfo,
        requests: [request],
      },
      apply: (request: Approval) => this.approvalsService.answerQuestion(request, actionParameters.reason.column.GetValue()),
    });
  }

  public getPwoData(pwo: Approval, userUid: string): EntityData | undefined {
    return pwo.pwoData.WorkflowHistory?.Entities?.find(
      (entityData) =>
        entityData.Columns?.DecisionType.Value === 'Query' &&
        entityData.Columns?.UID_PersonRelated.Value === userUid &&
        entityData.Columns?.DecisionLevel.Value === pwo.DecisionLevel.value,
    );
  }

  private async editAction(config: WorkflowActionEditWrapper): Promise<void> {
    const title = this.translate.instant(config.title);

    const result = await this.sideSheet
      .open(WorkflowActionComponent, {
        title,
        subTitle: config.data.requests.length === 1 ? config.data.requests[0].GetEntity().GetDisplay() : '',
        padding: '0',
        width: config.data.withGuidance && config.data.requests.length === 1 ? '700px' : '600px',
        testId: 'workflow-action',
        data: config.data,
      })
      .afterClosed()
      .toPromise();

    if (result) {
      if (config.data.requests.length > this.queueService.actionThreshold) {
        const actions: Action[] = [];
        for (const request of config.data.requests) {
          actions.push(
            new Action(
              request.GetEntity().GetDisplay(),
              '',
              async () => {
                await config.apply(request as Approval);
              },
              request.GetEntity().GetKeys().join(','),
            ),
          );
        }
        this.queueService.submitGroupAction(title, actions, async () => {
          // Once all actions are complete, trigger a data refresh
          this.applied.next();
        });
      } else {
        this.showBusyIndicator();
        let success: boolean;
        try {
          for (const request of config.data.requests) {
            await config.apply(request as Approval);
          }
          success = true;
        } finally {
          this.busyService.hide();
        }

        if (success) {
          this.snackBar.open({
            key: config.message,
            parameters: [
              config.data.requests.length,
              config.data.actionParameters.uidPerson ? config.data.actionParameters.uidPerson.column.GetDisplayValue() : '',
            ],
          });
          await this.userService.reloadPendingItems();
          this.applied.next();
        }
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

  private createCdrText(): BaseCdr {
    const column = this.entityService.createLocalEntityColumn({
      ColumnName: 'Querytext',
      Type: ValType.Text,
      IsMultiLine: true,
      MinLen: 1,
    });

    return new BaseCdr(column, '#LDS#Inquiry');
  }

  private createCdrReason(display?: string, reasonType: number = 0): BaseCdr {
    const column = this.entityService.createLocalEntityColumn({
      ColumnName: 'ReasonHead',
      Type: ValType.Text,
      IsMultiLine: true,
      MinLen: reasonType === 2 ? 1 : 0,
    });

    return new BaseCdr(column, display || '#LDS#Reason for your decision');
  }

  private createCdrPerson(display: string): BaseCdr {
    const fkRelation = {
      ChildColumnName: 'UID_PersonRelated',
      ParentTableName: 'Person',
      ParentColumnName: 'UID_Person',
      IsMemberRelation: false,
    };

    const column = this.entityService.createLocalEntityColumn(
      {
        ColumnName: fkRelation.ChildColumnName,
        Type: ValType.String,
        FkRelation: fkRelation,
        MinLen: 1,
      },
      [this.createFkProviderItemItShopInstead(fkRelation)],
    );

    return new BaseCdr(column, display);
  }

  private createCdrQuestioneer(uidPerson: string): BaseCdr {
    const fkRelation = {
      ChildColumnName: 'UID_PersonRelated',
      ParentTableName: 'Person',
      ParentColumnName: 'UID_Person',
      IsMemberRelation: false,
    };

    const column = this.entityService.createLocalEntityColumn(
      {
        ColumnName: fkRelation.ChildColumnName,
        Type: ValType.String,
        FkRelation: fkRelation,
        MinLen: 1,
      },
      [
        this.person.createFkProviderItem(fkRelation, [
          { ColumnName: 'UID_Person', CompareOp: CompareOperator.NotEqual, Type: FilterType.Compare, Value1: uidPerson },
        ]),
      ],
    );

    return new BaseCdr(column, '#LDS#Recipient of the inquiry');
  }

  private async checkTermsOfUse(requests: Approval[]): Promise<{ isChecked: boolean; isAuthenticated: boolean }> {
    // get all cart items with terms of uses
    const approvalItemsWithTermsOfUseToAccept = requests.filter(
      (item) => item.UID_QERTermsOfUse?.value !== null && item.UID_QERTermsOfUse?.value !== '',
    );

    if (approvalItemsWithTermsOfUseToAccept.length > 0) {
      this.logger.debug(
        this,
        `There are ${approvalItemsWithTermsOfUseToAccept.length} service items with terms of use the user have to accepted.`,
      );

      const termsOfUseAccepted = await this.sideSheet
        .open(TermsOfUseAcceptComponent, {
          title: await this.translate.get('#LDS#Heading Accept Terms of Use').toPromise(),
          padding: '0px',
          width: calculateSidesheetWidth(),
          data: {
            acceptCartItems: false,
            approvalItems: approvalItemsWithTermsOfUseToAccept,
          },
          testId: 'approvalitems-terms-of-use-accept-sidesheet',
        })
        .afterClosed()
        .toPromise();

      return termsOfUseAccepted;
    } else {
      this.logger.debug(this, 'there are no service items with terms of use the user have to accepted.');
      return { isChecked: true, isAuthenticated: false };
    }
  }

  private createFkProviderItemItShopInstead(fkRelation: MetaTableRelationData, filter?: FilterData[]): FkProviderItem {
    return {
      columnName: fkRelation.ChildColumnName || '',
      fkTableName: fkRelation.ParentTableName || '',
      parameterNames: ['OrderBy', 'StartIndex', 'PageSize', 'filter', 'withProperties', 'search', 'foritshopapprover'],
      load: async (_, parameters: CollectionLoadParameters = {}) =>
        this.apiService.v2Client.portal_candidates_Person_get({ ...parameters, filter, foritshopapprover: true }),
      getDataModel: async () => ({}),
      getFilterTree: async () => ({ Elements: [] }),
    };
  }

  private showBusyIndicator(): void {
    if (this.busyService.overlayRefs.length === 0) {
      this.busyService.show();
    }
  }
}
