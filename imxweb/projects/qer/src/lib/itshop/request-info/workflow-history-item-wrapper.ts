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

import { PortalItshopApproveHistory } from 'imx-api-qer';
import { IReadValue } from 'imx-qbm-dbts';
import { BaseReadonlyCdr, ColumnDependentReference } from 'qbm';
import { DecisionHistoryService } from '../decision-history.service';

export class WorkflowHistoryItemWrapper {
  public readonly approver: ColumnDependentReference;
  public readonly columns: ColumnDependentReference[];

  constructor(public readonly approveHistory: PortalItshopApproveHistory, public readonly decisionHistory: DecisionHistoryService) {
    this.approver = this.createApproverCdr(this.approveHistory),
      this.columns = this.createCdrList(this.approveHistory);
  }

  public getReasonDisplay(): string {
    if (this.approveHistory.DecisionType.value === 'Query') {
      return '#LDS#Query';
    } else if (this.approveHistory.DecisionType.value === 'Answer') {
      return '#LDS#Answer';
    }

    return this.approveHistory.ReasonHead.GetMetadata().GetDisplay();
  }

  private createApproverCdr(historyItem: PortalItshopApproveHistory): BaseReadonlyCdr {
    if (historyItem.DisplayPersonHead.value) {
      return new BaseReadonlyCdr(historyItem.DisplayPersonHead.Column,
        this.decisionHistory.getColumnDescriptionForDisplayPersonHead(historyItem.DecisionType.value));
    }

    if (historyItem.IsDecisionBySystem.value) {
      return new BaseReadonlyCdr(historyItem.IsDecisionBySystem.Column);
    }

    return undefined;
  }

  private createCdrList(historyItem: PortalItshopApproveHistory): BaseReadonlyCdr[] {
    const properties = [
      historyItem.RulerLevel.value !== 0 ? historyItem.RulerLevel : undefined,
      historyItem.UID_PWODecisionRule,
      ['Query', 'AddInsteadOf', 'AddAdditional'].includes(historyItem.DecisionType.value) ? historyItem.UID_PersonRelated : undefined,
      historyItem.IsFromDelegation,
      historyItem.ValidUntil,
      historyItem.ValidUntilProlongation,
      historyItem.ValidUntilUnsubscribe
    ];

    const customDisplays = {
      UID_PersonRelated: historyItem.DecisionType.value === 'AddInsteadOf' ? '#LDS#Delegated approver' :
        ['Query', 'AddAdditional'].includes(historyItem.DecisionType.value) ? '#LDS#Recipient' : undefined
    };

    return properties.filter(property => this.isToView(property)).map(property =>
      new BaseReadonlyCdr(property.Column, customDisplays[property.Column.ColumnName])
    );
  }

  private isToView(property: IReadValue<any>): boolean {
    if (!property || property.value == null || property.value === '') { return false; }
    return property.Column.ColumnName !== 'IsFromDelegation' || property.value;
  }
}
