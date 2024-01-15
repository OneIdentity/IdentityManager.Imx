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
import { ErrorHandler, Injectable } from '@angular/core';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';

import { PortalItshopRequests } from 'imx-api-qer';
import { ValType } from 'imx-qbm-dbts';

import { BaseCdr, ClassloggerService, EntityService, LdsReplacePipe, SnackBarService, UserMessageService } from 'qbm';
import { RequestActionComponent } from './request-action.component';
import { RequestHistoryService } from '../request-history.service';
import { JustificationService } from '../../justification/justification.service';
import { JustificationType } from '../../justification/justification-type.enum';
import { UserModelService } from '../../user/user-model.service';

@Injectable({
  providedIn: 'root',
})
export class RequestActionService {
  public readonly applied = new Subject();

  constructor(
    private readonly sideSheet: EuiSidesheetService,
    private readonly translate: TranslateService,
    private readonly entityService: EntityService,
    private readonly busyService: EuiLoadingService,
    private readonly logger: ClassloggerService,
    private readonly snackBar: SnackBarService,
    private readonly requestHistoryService: RequestHistoryService,
    private readonly justificationService: JustificationService,
    private readonly errorHandler: ErrorHandler,
    private readonly messageService: UserMessageService,
    private readonly userService: UserModelService,
    private readonly ldsReplace: LdsReplacePipe
  ) {}

  public async prolongate(requests: PortalItshopRequests[]): Promise<void> {
    const reason = this.createCdrReason();

    const prolongationProperty = this.requestHistoryService.PortalItshopRequestsSchema.Columns.ValidUntilProlongation;
    prolongationProperty.IsReadOnly = false;
    const prolongation = new BaseCdr(
      this.entityService.createLocalEntityColumn(prolongationProperty, undefined, { ValueConstraint: { MinValue: new Date() } }),
      '#LDS#Renewal date'
    );

    return this.editAction({
      title: '#LDS#Heading Renew Product',
      message: '#LDS#{0} products have been successfully renewed.',
      testId: 'imx-renew-request-parameters',
      data: {
        description: '#LDS#Renew the following products.',
        reason,
        prolongation,
        requests,
      },
      apply: async () => {
        for (const request of requests) {
          await this.requestHistoryService.prolongate(request, {
            Reason: reason.column.GetValue(),
            ProlongationDate: prolongation.column.GetValue(),
          });
        }

        this.logger.debug(this, 'renewing request');
        this.logger.trace(this, 'renewing request, reason', reason.column.GetValue());
        this.logger.trace(this, 'renewing request, date', prolongation.column.GetValue());
      },
    });
  }

  public async escalateDecisions(requests: PortalItshopRequests[]): Promise<void> {
    const reason = this.createCdrReason('#LDS#Reason for escalation', true);

    return this.editAction({
      title: '#LDS#Heading Escalate Approval',
      message: '#LDS#{0} approvals have been successfully escalated.',
      testId: 'imx-escalate-decision',
      data: {
        description: '#LDS#Escalate the request of the following products.',
        reason,
        requests,
      },
      apply: async () => {
        for (const request of requests) {
          await this.requestHistoryService.escalateDecision(request, reason.column.GetValue());
        }

        this.logger.debug(this, 'escalating request');
        this.logger.trace(this, 'escalation request, reason', reason.column.GetValue());
      },
    });
  }

  public async unsubscribe(requests: PortalItshopRequests[]): Promise<void> {
    const reason = this.createCdrReason('#LDS#Additional comments about your decision');

    let justification: BaseCdr;

    let busyIndicator: OverlayRef;
    setTimeout(() => (busyIndicator = this.busyService.show()));

    try {
      justification = await this.justificationService.createCdr(JustificationType.unsubscribe);
    } finally {
      setTimeout(() => this.busyService.hide(busyIndicator));
    }

    const unsubscribeProperty = this.requestHistoryService.PortalItshopRequestsSchema.Columns.ValidUntilUnsubscribe;
    unsubscribeProperty.IsReadOnly = false;
    const unsubscription = new BaseCdr(
      this.entityService.createLocalEntityColumn(unsubscribeProperty, undefined, { ValueConstraint: { MinValue: new Date() } })
    );

    return this.editAction({
      title: '#LDS#Heading Unsubscribe Product',
      message: '#LDS#{0} products have been successfully unsubscribed.',
      testId: 'imx-unsubscribe-parameters',
      data: {
        description: '#LDS#Unsubscribe the following products.',
        reason,
        justification,
        unsubscription,
        requests,
      },
      apply: async () => {
        await this.requestHistoryService.unsubscribe({
          UidPwo: requests.map((request) => request.GetEntity().GetKeys()[0]),
          Reason: reason.column.GetValue(),
          UidJustification: justification?.column?.GetValue(),
          UnsubscribeFrom: unsubscription.column.GetValue(),
        });

        this.logger.debug(this, 'unsubscribing request');
        this.logger.trace(this, 'unsubscribing request, reason', reason.column.GetValue());
        this.logger.trace(this, 'unsubscribing request, date', unsubscription.column.GetValue());
      },
    });
  }

  public async withdrawRequest(requests: PortalItshopRequests[]): Promise<void> {
    const reason = this.createCdrReason();

    return this.editAction({
      title: await this.translate.get('#LDS#Heading Cancel Request').toPromise(),
      message: '#LDS#{0} requests have been successfully canceled.',
      testId: 'imx-withdraw-reason',
      data: {
        description: '#LDS#Cancel the following requests.',
        reason,
        requests,
      },
      apply: async () => {
        for (const request of requests) {
          await this.requestHistoryService.cancelRequest(request, reason.column.GetValue());
        }

        this.logger.debug(this, 'withdraw request');
        this.logger.trace(this, 'withdraw request Reason', reason.column.GetValue());
      },
    });
  }

  public async recallLastQuestion(requests: PortalItshopRequests[]): Promise<void> {
    const reason = this.createCdrReason();

    return this.editAction({
      title: await this.translate.get('#LDS#Heading Withdraw Inquiry').toPromise(),
      message: '#LDS#{0} inquiries have been successfully withdrawn.',
      testId: 'imx-recall-last-question-reason',
      data: {
        description: '#LDS#Withdraw inquiries for the following requests.',
        reason,
        requests,
      },
      apply: async () => {
        for (const request of requests) {
          await this.requestHistoryService.recallQuery(request, reason.column.GetValue());
        }

        this.logger.debug(this, 'recall last question');
        this.logger.trace(this, 'recall last question Reason', reason.column.GetValue());
      },
    });
  }

  public async revokeHoldStatus(requests: PortalItshopRequests[]): Promise<void> {
    const reason = this.createCdrReason();

    return this.editAction({
      title: await this.translate.get('#LDS#Heading Cancel Reservation').toPromise(),
      message: '#LDS#The reservation for {0} requests has been successfully canceled.',
      testId: 'imx-revoke-hold-status-reason',
      data: {
        description: '#LDS#Cancel the reservation for the following requests.',
        reason,
        requests,
      },
      apply: async () => {
        for (const request of requests) {
          await this.requestHistoryService.resetReservation(request, reason.column.GetValue());
        }

        this.logger.debug(this, 'revoke hold status');
        this.logger.trace(this, 'revoke hold status Reason', reason.column.GetValue());
      },
    });
  }

  public async revokeDelegation(requests: PortalItshopRequests[], title: string, message: string, description: string): Promise<void> {
    const reason = this.createCdrReason();

    return this.editAction({
      title: await this.translate.get(title).toPromise(),
      message: await this.translate.get(message).toPromise(),
      testId: 'imx-revoke-delegation-reason',
      data: {
        description: await this.translate.get(description).toPromise(),
        reason,
        requests,
      },
      apply: async () => {
        for (const request of requests) {
          await this.requestHistoryService.revokeDelegation(request, reason.column.GetValue());
        }

        this.logger.debug(this, 'revoke delegation');
        this.logger.trace(this, 'revoke delegation Reason', reason.column.GetValue());
      },
    });
  }

  public async revokeAdditionalApprover(
    requests: PortalItshopRequests[],
    title: string,
    message: string,
    description: string
  ): Promise<void> {
    const reason = this.createCdrReason();

    return this.editAction({
      title: await this.translate.get(title).toPromise(),
      message: await this.translate.get(message).toPromise(),
      testId: 'imx-revoke-additional-approver-reason',
      data: {
        description: await this.translate.get(description).toPromise(),
        reason,
        requests,
      },
      apply: async () => {
        for (const request of requests) {
          await this.requestHistoryService.revokeAdditionalApprover(request, reason.column.GetValue());
        }

        this.logger.debug(this, 'revoke delegation');
        this.logger.trace(this, 'revoke delegation Reason', reason.column.GetValue());
      },
    });
  }

  public async recallDecision(requests: PortalItshopRequests[]): Promise<void> {
    const reason = this.createCdrReason();

    return this.editAction({
      title: await this.translate.get('#LDS#Heading Undo Approval Decision').toPromise(),
      message: '#LDS#{0} approval decisions have been successfully undone.',
      testId: 'imx-recall-decision-reason',
      data: {
        description: '#LDS#Undo approval decisions for the following requests.',
        reason,
        requests,
      },
      apply: async () => {
        for (const request of requests) {
          await this.requestHistoryService.recallDecision(request, reason.column.GetValue());
        }

        this.logger.debug(this, 'recall last question');
        this.logger.trace(this, 'recall last question Reason', reason.column.GetValue());
      },
    });
  }

  public async copyItems(requests: PortalItshopRequests[]): Promise<void> {
    let busyIndicator: OverlayRef;
    setTimeout(() => (busyIndicator = this.busyService.show()));
    const errorRequests: PortalItshopRequests[] = [];
    try {
      for (const request of requests) {
        try {
          await this.requestHistoryService.copyRequest(request);
        } catch {
          errorRequests.push(request);
        }
      }
    } finally {
      setTimeout(() => this.busyService.hide(busyIndicator));
      this.snackBar.open({
        key: '#LDS#{0} products have been successfully added to the shopping cart.',
        parameters: [requests.length - errorRequests.length],
      });
      if (errorRequests.length > 0) {
        const errorText = errorRequests.map((request) => request.DisplayOrg.Column.GetDisplayValue()).join(', ');
        this.messageService.subject.next({
          text: this.ldsReplace.transform(this.translate.instant('#LDS#The following {0} products could not be added to the shopping cart: {1}'), errorRequests.length, errorText),
          type: 'error',
        });
      }      
      await this.userService.reloadPendingItems();
      this.applied.next();
    }
  }

  private async editAction(config: any): Promise<void> {
    const result = await this.sideSheet
      .open(RequestActionComponent, {
        title: await this.translate.get(config.title).toPromise(),
        subTitle: config.data.requests.length === 1 ? config.data.requests[0].GetEntity().GetDisplay() : ' ',
        padding: '0',
        width: '600px',
        testId: config.testId,
        data: config.data,
      })
      .afterClosed()
      .toPromise();

    if (result) {
      let busyIndicator: OverlayRef;
      setTimeout(() => (busyIndicator = this.busyService.show()));

      let success: boolean;
      try {
        await config.apply();
        success = true;
      } catch (error) {
        this.errorHandler.handleError(error);
      } finally {
        setTimeout(() => this.busyService.hide(busyIndicator));
      }

      if (success) {
        this.snackBar.open({
          key: config.message,
          parameters: [config.data.requests.length],
        });        
        await this.userService.reloadPendingItems();
        this.applied.next();
      }
    } else {
      this.snackBar.open({ key: '#LDS#You have canceled the action.' });
    }
  }

  private createCdrReason(display: string = '#LDS#Reason for your decision', required: boolean = false): BaseCdr {
    const column = this.entityService.createLocalEntityColumn({
      ColumnName: 'ReasonHead',
      Type: ValType.Text,
      IsMultiLine: true,
      MinLen: required ? 0 : 1,
    });

    return new BaseCdr(column, display);
  }
}
