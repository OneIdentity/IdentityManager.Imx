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

import { DisplayColumns, IEntityColumn, TypedEntity } from 'imx-qbm-dbts';
import { CdrFactoryService } from 'qbm';

export class AccountTypedEntity extends TypedEntity {
  // TODO fix this: we are in TSB, not ADS
  public readonly displayColumn = this.GetEntity().GetColumn(DisplayColumns.DISPLAY_PROPERTYNAME);
  public readonly isNeverConnectManualColumn = CdrFactoryService.tryGetColumn(this.GetEntity(), 'IsNeverConnectManual');
  public readonly objectKeyManagerColumn = CdrFactoryService.tryGetColumn(this.GetEntity(), 'ObjectKeyManager');
  public readonly uidPersonColumn = CdrFactoryService.tryGetColumn(this.GetEntity(), 'UID_Person');
  public readonly uidADSDomain = CdrFactoryService.tryGetColumn(this.GetEntity(), 'UID_ADSDomain');
}
