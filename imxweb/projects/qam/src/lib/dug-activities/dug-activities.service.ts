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

import { Injectable } from '@angular/core';
import { QamApiService } from '../qam-api-client.service';
import { DgeConfigData, ResourceActivityData, TrusteeActivityData } from '../TypedClient';

@Injectable({ providedIn: 'root' })
export class DugActivitiesService {
  constructor(
    private readonly api: QamApiService,
  ) {}


  public async getMostActiveTrustees(): Promise<TrusteeActivityData[]> {
    return this.api.client.portal_dge_mostactivetrustees_get();
  }

  public async getMostActiveResources(): Promise<ResourceActivityData[]> {
    return this.api.client.portal_dge_mostactiveresources_get();
  }

  public async getConfig(): Promise<DgeConfigData>{
    return this.api.client.portal_dgeconfig_get();
  }
}