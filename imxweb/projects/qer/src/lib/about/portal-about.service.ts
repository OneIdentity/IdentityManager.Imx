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
import { PortalSysteminfoThirdparty } from '@imx-modules/imx-api-qer';
import { CollectionLoadParameters, EntitySchema, TypedEntityCollectionData } from '@imx-modules/imx-qbm-dbts';
import { AboutService, ApiClientService } from 'qbm';
import { QerApiService } from '../qer-api-client.service';

@Injectable({
  providedIn: 'root',
})
export class PortalAboutService extends AboutService {
  constructor(
    private readonly apiClient: QerApiService,
    private apiProvider: ApiClientService,
  ) {
    super();
  }

  get EntitySchema(): EntitySchema {
    return this.apiClient.typedClient.PortalSysteminfoThirdparty.GetSchema();
  }

  async get(parameters?: CollectionLoadParameters): Promise<TypedEntityCollectionData<PortalSysteminfoThirdparty> | undefined> {
    return this.apiProvider.request(() =>
      this.apiClient.typedClient.PortalSysteminfoThirdparty.Get(parameters, {
        signal: this.abortController.signal,
      }),
    );
  }
}
