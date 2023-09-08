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

import { DisplayPattern, EntitySchema, IClientProperty, IReadValue, TypedEntity, ValType } from 'imx-qbm-dbts';

export class EntitlementToAddTyped extends TypedEntity {

  public readonly IsAssignedToMe: IReadValue<boolean> = this.GetEntityValue('IsAssignedToMe');
  public readonly IsAssignedToOther: IReadValue<boolean> = this.GetEntityValue('IsAssignedToOther');
  public readonly DisplayName: IReadValue<string> = this.GetEntityValue('DisplayName');
  public readonly CanonicalName: IReadValue<string> = this.GetEntityValue('CanonicalName');
  public readonly UID_AOBApplicationConflicted: IReadValue<string> = this.GetEntityValue('UID_AOBApplicationConflicted');

  public static GetEntitySchema(): EntitySchema {
    const ret: { [key: string]: IClientProperty } = {};

    ret.IsAssignedToMe = {
      Type: ValType.Bool,
      ColumnName: 'IsAssignedToMe'
    };
    ret.IsAssignedToOther = {
      Type: ValType.Bool,
      ColumnName: 'IsAssignedToOther'
    };
    ret.DisplayName = {
      Type: ValType.String,
      ColumnName: 'DisplayName'
    };
    ret.CanonicalName = {
      Type: ValType.String,
      ColumnName: 'CanonicalName'
    };
    ret.UID_AOBApplicationConflicted = {
      Type: ValType.String,
      ColumnName: 'UID_AOBApplicationConflicted'
    };

    return {
      TypeName: 'EntitlementToAddTyped',
      DisplayPattern: new DisplayPattern('%DisplayName%'),
      Columns: ret
    };
  }
}
