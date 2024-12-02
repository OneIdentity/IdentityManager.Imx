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

export enum EventChangeTypes {
  Edit,
  Add,
  Remove,
}
export type EventChangeType = EventChangeTypes.Add | EventChangeTypes.Edit | EventChangeTypes.Remove;

export enum HistoryEventChangeType {
  'Object created' = EventChangeTypes.Edit,
  'PropertyChange' = EventChangeTypes.Edit,
  'AddResponsibility' = EventChangeTypes.Add,
  'AddMembership' = EventChangeTypes.Add,
  'Entitlement has been added' = EventChangeTypes.Add,
  'Rule violation resolved' = EventChangeTypes.Add,
  'Rule violation detected' = EventChangeTypes.Remove,
  'Entitlement removed' = EventChangeTypes.Remove,
  'Entitlement has been removed' = EventChangeTypes.Remove,
  'Membership removed' = EventChangeTypes.Remove,
  'Object deleted' = EventChangeTypes.Remove,
  'AddAccount' = EventChangeTypes.Add,
  'AddPermission' = EventChangeTypes.Add,
  'RemoveNonCompliance' = EventChangeTypes.Add,
  'AddNonCompliance' = EventChangeTypes.Remove,
  'RemoveResponsibility' = EventChangeTypes.Remove,
  'RemovePermission' = EventChangeTypes.Remove,
  'RemoveAccount' = EventChangeTypes.Remove,
}
