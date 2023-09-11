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
import { IRoleSplitItem, RoleSplitInput, UiActionData } from 'imx-api-qer';
import { QerApiService } from '../../qer-api-client.service';

@Injectable({
  providedIn: 'root',
})
export class SplitService {
  constructor(private readonly apiService: QerApiService) {}

  public async getSplitItems(roletype: string, uidrole: string, newroletype: string, newroleid: string): Promise<IRoleSplitItem[]> {
    return await this.apiService.v2Client.portal_roles_split_get(roletype, uidrole, newroletype, newroleid);
  }

  public async getSplitOptions
(
    roletype: string,
    uidrole: string,
    newroletype: string,
    newroleid: string,
    inputData: RoleSplitInput
  ): Promise<UiActionData[]> {
    return await this.apiService.v2Client.portal_roles_split_post(roletype, uidrole, newroletype, newroleid, inputData);
  }
}
