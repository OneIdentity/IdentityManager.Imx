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

@Injectable({
  providedIn: 'root'
})
export class DecisionHistoryService {
  public getDecisionTypeCssClass(decisiontype: string): string {
    switch ((decisiontype || '').toLowerCase()) {
      case 'dismiss':
      case 'cancel':
      case 'abort':
      case 'unsubscribe':
      case 'reject': return 'imx-negative';
      case 'grant': return 'imx-positive';
      case 'query': return 'imx-question';
      default: return 'imx-info';
    }
  }

  public getColumnDescriptionForDisplayPersonHead(orderType: string): string {
    switch (orderType) {
      case 'Order':
        return '#LDS#DisplayPersonHead_Order';
      case 'Escalate':
        return '#LDS#DisplayPersonHead_Escalate';
      case 'Dismiss':
        return '#LDS#DisplayPersonHead_Dismiss';
      case 'Prolongate':
        return '#LDS#DisplayPersonHead_Prolongate';
      case 'Query':
        return '#LDS#Inquiry made by';
      case 'Reject':
        return '#LDS#DisplayPersonHead_Reject';
      case 'Grant':
        return '#LDS#DisplayPersonHead_Grant';
      case 'Unsubscribe':
        return '#LDS#DisplayPersonHead_Unsubscribe';
      case 'Answer':
        return '#LDS#DisplayPersonHead_Answer';
      case 'Recall':
        return '#LDS#DisplayPersonHead_Recall';
      case 'Cancel':
        return '#LDS#DisplayPersonHead_Cancel';
      case 'Abort':
        return '#LDS#DisplayPersonHead_Abort';
      case 'Assign':
        return '#LDS#DisplayPersonHead_Assign';
      case 'Waiting':
        return '#LDS#DisplayPersonHead_Waiting';
      case 'Direct':
        return '#LDS#DisplayPersonHead_Direct';
      case 'AddAdditional':
        return '#LDS#DisplayPersonHead_AddAdditional';
      case 'AddInsteadOf':
        return '#LDS#DisplayPersonHead_AddInsteadOf';
      case 'Deny':
        return '#LDS#DisplayPersonHead_Deny';
      case 'RevokeDelegation':
        return '#LDS#DisplayPersonHead_RevokeDelegation';
      case 'RecallQuery':
        return '#LDS#DisplayPersonHead_RecallQuery';
      case 'Reserve':
        return '#LDS#DisplayPersonHead_Reserve';
      case 'ResetReservation':
        return '#LDS#Reservation canceled by';
      case 'AddHistoryEntry':
        return '#LDS#DisplayPersonHead_AddHistoryEntry';
      case 'CreateOrder':
        return '#LDS#DisplayPersonHead_CreateOrder';
      case 'Create':
        return '#LDS#DisplayPersonHead_Create';
      case 'ReAction':
        return '#LDS#DisplayPersonHead_ReAction';
      case 'Reset':
        return '#LDS#DisplayPersonHead_Reset';
    }
  }
}
