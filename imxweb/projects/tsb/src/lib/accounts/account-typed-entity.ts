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

import { DisplayColumns, IEntityColumn, TypedEntity } from 'imx-qbm-dbts';

export class AccountTypedEntity extends TypedEntity {

  // TODO fix this: we are in TSB, not ADS
  public readonly displayColumn = this.GetEntity().GetColumn(DisplayColumns.DISPLAY_PROPERTYNAME);
  public readonly isNeverConnectManualColumn = this.tryGetColumn('IsNeverConnectManual');
  public readonly objectKeyManagerColumn = this.tryGetColumn('ObjectKeyManager');
  public readonly uidPersonColumn = this.tryGetColumn('UID_Person');
  public readonly uidADSDomain = this.tryGetColumn('UID_ADSDomain');

  private tryGetColumn(name: string): IEntityColumn {
    try {
      return this.GetEntity().GetColumn(name);
    } catch {
      return undefined;
    }
  }
}
