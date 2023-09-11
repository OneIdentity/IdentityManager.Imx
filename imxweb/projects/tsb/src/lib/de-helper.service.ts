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
import {
  ExtendedTypedEntityCollection,
  CollectionLoadParameters,
  TypedEntityCollectionData,
} from 'imx-qbm-dbts';
import { PortalTargetsystemUnsContainer, PortalTargetsystemUnsSystem } from 'imx-api-tsb';
import { Subject } from 'rxjs';
import { EuiLoadingService } from '@elemental-ui/core';
import { TsbApiService } from './tsb-api-client.service';

@Injectable({ providedIn: 'root' })
export class DeHelperService {
  public authorityDataDeleted: Subject<string> = new Subject();

  constructor(
    private loader: EuiLoadingService,
    private tsbClient: TsbApiService
  ) {}

  public async getAuthorityData(search?: string, skipLoader?: boolean): Promise<DataDeleteOptions> {
    const loadParams: CollectionLoadParameters = { PageSize: 50, StartIndex: 0 };
    if (search) {
      loadParams.search = search;
    }
    const method = this.tsbClient.typedClient.PortalTargetsystemUnsSystem;
    let data: ExtendedTypedEntityCollection<PortalTargetsystemUnsSystem, {}>;
    if (skipLoader) {
      data = await method.Get(loadParams);
    } else {
      data = await this.handlePromiseLoader(method.Get(loadParams));
    }
    return {
      hasAuthorities: data.totalCount > 0,
      authorities: data.Data,
    };
  }

  public async getContainers(
    navigationState: CollectionLoadParameters
  ): Promise<TypedEntityCollectionData<PortalTargetsystemUnsContainer>> {
    return this.tsbClient.typedClient.PortalTargetsystemUnsContainer.Get(navigationState);
  }

  private handlePromiseLoader(promise: Promise<any>): Promise<any> {
    const loaderRef = this.loader.show();
    return promise.finally(() => this.loader.hide(loaderRef));
  }
}

export interface DataDeleteOptions {
  authorities?: PortalTargetsystemUnsSystem[];
  hasAuthorities: boolean;
}
