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

import { Injectable } from '@angular/core';
import { CollectionLoadParameters, TypedEntityCollectionData } from 'imx-qbm-dbts';
import {
  PortalTargetsystemUnsContainer,
  PortalTargetsystemUnsSystem,
} from 'imx-api-arc';
import { ArcApiService } from '../services/arc-api-client.service';
import { SettingsService } from 'qbm';

@Injectable()
export class ReportsService {
  constructor(private arcClient: ArcApiService,
    private readonly settingService: SettingsService) { }

  public async authorityData(search?: string): Promise<TypedEntityCollectionData<PortalTargetsystemUnsSystem>> {
    const options: CollectionLoadParameters = this.getDefaultDataOptions(search);

    return this.arcClient.typedClient.PortalTargetsystemUnsSystem.Get(options);
  }

  public async containerData(search?: string): Promise<TypedEntityCollectionData<PortalTargetsystemUnsContainer>> {
    const options: CollectionLoadParameters = this.getDefaultDataOptions(search);

    return this.arcClient.typedClient.PortalTargetsystemUnsContainer.Get(options);
  }

  private getDefaultDataOptions(search?: string): CollectionLoadParameters {
    const options: CollectionLoadParameters = {
      PageSize: this.settingService.DefaultPageSize,
      StartIndex: 0,
      ParentKey: '',
    };

    if (search) {
      options.search = search;
    }

    return options;
  }
}
