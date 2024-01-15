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

import { Injectable } from '@angular/core';
import { OverlayRef } from '@angular/cdk/overlay';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';

import { NonComplianceDecisionInput } from 'imx-api-cpl';
import { ValType } from 'imx-qbm-dbts';
import { SnackBarService, EntityService, ColumnDependentReference, BaseCdr } from 'qbm';
import { JustificationService, JustificationType, UserModelService } from 'qer';
import { ApiService } from '../../api.service';
import { RulesViolationsApproval } from '../rules-violations-approval';
import { RulesViolationsActionComponent } from './rules-violations-action.component';
import { RulesViolationsActionParameters } from './rules-violations-action-parameters.interface';
import { ResolveComponent } from '../resolve/resolve.component';

/**
 * Service that handles the approve and deny of one or more rules violations.
 */
@Injectable({
  providedIn: 'root'
})
export class RulesViolationsActionService {
  public readonly applied = new Subject();

  constructor(
    private readonly justification: JustificationService,
    private readonly cplClient: ApiService,
    private readonly sidesheet: EuiSidesheetService,
    private readonly busyService: EuiLoadingService,
    private readonly translate: TranslateService,
    private readonly snackBar: SnackBarService,
    private readonly userService: UserModelService,
    private readonly entityService: EntityService
  ) { }

  /**
   * Approve the rules violation
   * @param ruleViolationToApprove The rules violation
   * @param input reason and/or standard reason
   */
  public async approve(rulesViolations: RulesViolationsApproval[]): Promise<void> {
    return this.makeDecisions(rulesViolations, true);
  }

  /**
   * Deny the rules violation
   * @param ruleViolationToApprove The rules violation
   * @param input reason and/or standard reason
   */
  public async deny(rulesViolations: RulesViolationsApproval[]): Promise<void> {
    return this.makeDecisions(rulesViolations, false);
  }

  public async resolve(ruleViolation: RulesViolationsApproval): Promise<void> {
    const sidesheetRef = this.sidesheet.open(ResolveComponent, {
      title: await this.translate.get('#LDS#Heading Resolve Rule Violation').toPromise(),
      subTitle: ruleViolation.GetEntity().GetDisplay(),
      padding: '0px',
      width: 'max(600px, 60%)',
      testId: 'rulesviolations-resolve-sidesheet',
      data: {
        uidPerson: ruleViolation.UID_Person.value,
        uidNonCompliance: ruleViolation.UID_NonCompliance.value
      }
    });

    return sidesheetRef.afterClosed().toPromise();
  }

  private async makeDecisions(rulesViolationsApprovals: RulesViolationsApproval[], approve: boolean): Promise<void> {
    let justification: ColumnDependentReference;

    let busyIndicator: OverlayRef;
    setTimeout(() => busyIndicator = this.busyService.show());

    try {
      justification = await this.justification.createCdr(
        approve
          ? JustificationType.approveRuleViolation
          : JustificationType.denyRuleViolation
      );
    } finally {
      setTimeout(() => this.busyService.hide(busyIndicator));
    }

    const actionParameters: RulesViolationsActionParameters = {
      justification,
      reason: this.createCdrReason({ display: justification ? '#LDS#Additional comments about your decision' : undefined }),
    };

    if (approve) {
      actionParameters.validUntil = this.createCdrValidUntil();
    }

    const sidesheetTitle = approve
      ? rulesViolationsApprovals.length > 1
        ? '#LDS#Heading Grant Exceptions'
        : '#LDS#Heading Grant Exception'
      : rulesViolationsApprovals.length > 1
        ? '#LDS#Heading Deny Exceptions'
        : '#LDS#Heading Deny Exception';

    return this.editAction({
      title: sidesheetTitle,
      data: { rulesViolationsApprovals, actionParameters, approve, },
      message: approve
        ? '#LDS#Exceptions have been successfully granted for {0} rule violations.'
        : '#LDS#Exceptions have been successfully denied for {0} rule violations.',
      apply: async (rulesViolationsAction: RulesViolationsApproval) => {
        return this.postDecision(rulesViolationsAction, {
          Reason: actionParameters.reason.column.GetValue(),
          UidJustification: actionParameters.justification?.column?.GetValue(),
          ExceptionValidUntil: actionParameters.validUntil?.column?.GetValue(),
          Decision: approve,
        });
      }
    });
  }
  /**
   * Opens the RulesViolationsActionComponent there the user can set the reason and/or standard reason
   * and the ExceptionValidUntil in the approve contest.
   * @param config the configuration for the sidesheet (title) and the corresponding rules violations data
   */
  private async editAction(config: any): Promise<void> {
    const result = await this.sidesheet.open(RulesViolationsActionComponent, {
      title: await this.translate.get(config.title).toPromise(),
      subTitle: config.data.rulesViolationsApprovals.length == 1  
        ? config.data.rulesViolationsApprovals[0].GetEntity().GetDisplay() 
        : '',
      panelClass: 'imx-sidesheet',
      padding: '0',
      width: '600px',
      testId: `rulesvioalations-action-sidesheet-${config.data.approve ? 'approve' : 'deny'}`,
      data: config.data
    }).afterClosed().toPromise();

    if (result) {
      let busyIndicator: OverlayRef;
      setTimeout(() => busyIndicator = this.busyService.show());

      let success: boolean;
      try {
        for (const rulesViolation of config.data.rulesViolationsApprovals) {
          await config.apply(rulesViolation);
        }
        success = true; 
        await this.userService.reloadPendingItems();
      } finally {
        setTimeout(() => this.busyService.hide(busyIndicator));
      }

      if (success) {
        this.snackBar.open(config.getMessage ?
          config.getMessage() :
          { key: config.message, parameters: [config.data.rulesViolationsApprovals.length] }
        );
        this.applied.next();
      }
    } else {
      this.snackBar.open({ key: '#LDS#You have canceled the action.' });
    }
  }

  /**
   * Approve or deny the rules violation
   * @param ruleViolationToApprove The rules violation
   * @param input reason and/or standard reason
   */
  private async postDecision(ruleViolationToApprove: RulesViolationsApproval, input: NonComplianceDecisionInput): Promise<any> {
    return this.cplClient.client.portal_rules_violations_post(
      ruleViolationToApprove.UID_Person.value,
      ruleViolationToApprove.UID_NonCompliance.value,
      input);
  }

  /**
   * Creates a Cdr-Editor for the reason.
   */
  private createCdrReason(metadata: { display?: string, mandatory?: boolean } = {}): ColumnDependentReference {
    return new BaseCdr(
      this.entityService.createLocalEntityColumn({
        ColumnName: 'ReasonHead',
        Type: ValType.Text,
        IsMultiLine: true,
        MinLen: metadata.mandatory ? 1 : 0
      }),
      metadata.display || '#LDS#Reason for your decision'
    );
  }

  /**
   * Creates a Cdr-Editor for the ExceptionValidUntil value.
   */
  private createCdrValidUntil(): ColumnDependentReference {
    const schema = this.cplClient.typedClient.PortalRulesViolations.GetSchema();
    const minDateUntil = new Date();
    minDateUntil.setDate(minDateUntil.getDate() + 1);
    const validUntilColumn = this.entityService.createLocalEntityColumn(
      {
        ColumnName: schema.Columns.ExceptionValidUntil.ColumnName,
        Type: schema.Columns.ExceptionValidUntil.Type,
        IsMultiLine: schema.Columns.ExceptionValidUntil.IsMultiLine,
        MinLen: schema.Columns.ExceptionValidUntil.MinLen,
        Display: schema.Columns.ExceptionValidUntil.Display
      },
      undefined,
      { ValueConstraint: { MinValue: minDateUntil } }
    );

    return new BaseCdr(validUntilColumn);
  }

}
