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
import { AdminSysteminfoThirdparty } from '@imx-modules/imx-api-qbm';
import { CollectionLoadParameters, EntitySchema, TypedEntityCollectionData } from '@imx-modules/imx-qbm-dbts';
import { AboutService } from '../../about/About.service';
import { ApiClientService } from '../../api-client/api-client.service';
import { imx_SessionService } from '../../session/imx-session.service';

@Injectable({
  providedIn: 'root',
})
export class AdminAboutService extends AboutService {
  constructor(
    private session: imx_SessionService,
    private readonly apiProvider: ApiClientService,
  ) {
    super();
  }

  get EntitySchema(): EntitySchema {
    return this.session.TypedClient.AdminSysteminfoThirdparty.GetSchema();
  }

  async get(parameters?: CollectionLoadParameters): Promise<TypedEntityCollectionData<AdminSysteminfoThirdparty> | undefined> {
    return this.apiProvider.request(() =>
      this.session.TypedClient.AdminSysteminfoThirdparty.Get(parameters, {
        signal: this.abortController.signal,
      }),
    );
  }
}
