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

import { ObjectInfo, PortalPoliciesViolationslist } from 'imx-api-pol';
import { BaseReadonlyCdr, ColumnDependentReference } from 'qbm';

export class PolicyViolation extends PortalPoliciesViolationslist {

  public properties: ColumnDependentReference[];
  /**
   * The color and the caption depending on the value of the state of a {@link PortalPoliciesViolationslist}.
   */
  public get stateBadge(): { color: 'blue' | 'orange' | 'green', caption: string } {
    return {
      color: this.stateBadgeColor,
      caption: this.stateCaption
    };
  };
  public readonly data: ObjectInfo[];
  private stateBadgeColor: 'blue' | 'orange' | 'green';
  private stateCaption: string;


  constructor(
    private readonly baseObject: PortalPoliciesViolationslist,
    extendedData:  ObjectInfo[]
  ) {
    super(baseObject.GetEntity());
    this.initPropertyInfo();
    this.initStateBadge();
    this.data = extendedData || [];
  }

  public get key(): string {
    return this.baseObject.GetEntity().GetKeys()[0];
  }

  private initPropertyInfo(): void {
    const props: any[] =
      [
        this.UID_QERPolicy,
        this.Description,
        this.ObjectKey
      ];

    if (this.State.value.toLowerCase() !== 'pending') {
      props.push(...[
        this.UID_PersonDecisionMade,
        this.UID_QERJustification,
        this.DecisionReason,
        this.DecisionDate
      ]);
    }

    this.properties = props
      .filter(property => property.value != null && property.value !== '')
      .map(property => new BaseReadonlyCdr(property.Column));
  }

  private async initStateBadge(): Promise<void> {
    switch (this.State.value) {
      case 'approved':
        this.stateBadgeColor = 'green';
        this.stateCaption = '#LDS#Exception granted';
        break;
      case 'denied':
        this.stateBadgeColor = 'orange';
        this.stateCaption = '#LDS#Exception denied';
        break;
      default:
        this.stateBadgeColor = 'blue';
        this.stateCaption = '#LDS#Approval decision pending';
    }
  }
}
