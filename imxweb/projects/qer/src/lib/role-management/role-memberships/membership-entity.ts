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

import { DisplayColumns, EntitySchema,TypedEntity, ValType } from "imx-qbm-dbts";

export class MembershipEntity extends TypedEntity {
  public static GetEntitySchema(): EntitySchema {
    const columns = {
      OrderState: {
        Type: ValType.String,
        ColumnName: 'OrderState',
      },
      UID_Person: {
        Type: ValType.String,
        ColumnName: 'UID_Person',
      },
      UID_PersonWantsOrg: {
        Type: ValType.String,
        ColumnName: 'UID_PersonWantsOrg',
      },
      ValidUntil: {
        Type: ValType.Date,
        ColumnName: 'ValidUntil',
      },
      XOrigin: {
        Type: ValType.String,
        ColumnName: 'XOrigin',
      },
    };

    columns[DisplayColumns.DISPLAY_PROPERTYNAME] = DisplayColumns.DISPLAY_PROPERTY;

    return { Columns: columns };
  }
}
