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

import { Component, Inject } from '@angular/core';
import { EUI_SIDESHEET_DATA } from '@elemental-ui/core';

import { PortalAttestationPolicy } from 'imx-api-att';

@Component({
  selector: 'imx-policy-details',
  templateUrl: './policy-details.component.html',
  styleUrls: ['./policy-details.component.scss']
})
export class PolicyDetailsComponent {

  public uidAttestationPolicy: string;
  public status: string;

  public get policy(): PortalAttestationPolicy {
    return this.data.policy;
   }

  constructor(
    @Inject(EUI_SIDESHEET_DATA) public readonly data: { policy: PortalAttestationPolicy },
  ) {
    this.uidAttestationPolicy = data.policy.GetEntity().GetKeys()[0];
    this.status = data.policy.IsProcessing.value ? '#LDS#Processing'
      : data.policy.CountCases.value === 0
        ? '#LDS#Not run yet' :
        data.policy.CountOpenCases.value === 0 ? '#LDS#Completed'
          : '#LDS#Pending';
  }

}
