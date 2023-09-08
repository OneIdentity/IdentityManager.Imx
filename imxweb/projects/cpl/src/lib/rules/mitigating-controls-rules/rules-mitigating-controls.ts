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

import { IWriteValue } from 'imx-qbm-dbts';
import { BaseCdr, ColumnDependentReference } from 'qbm';
import { PortalRulesMitigatingcontrols } from 'imx-api-cpl';

/**
 * Class thats extends the {@link PortalRulesMitigatingcontrols} with some additional properties that are needed for
 * the components in the approval context.
 */
export class RulesMitigatingControls extends PortalRulesMitigatingcontrols {

  /**
   * The property list depending on the value of the state of a {@link PortalRulesMitigatingcontrols}.
   */
  public readonly propertyInfo: ColumnDependentReference[];


  constructor(
    readonly baseObject: PortalRulesMitigatingcontrols
  ) {
    super(baseObject.GetEntity());

    this.propertyInfo = this.initPropertyInfo();
  }

  private initPropertyInfo(): ColumnDependentReference[] {
    const properties: IWriteValue<any>[] =
      [
        this.UID_MitigatingControl,
      ];

    return properties
      .map(property => new BaseCdr(property.Column));
  }

}
