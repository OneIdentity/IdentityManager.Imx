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

import { OpsupportSyncDatastore } from 'imx-api-dpr';
import { EntitySchema, TypedEntityCollectionData } from 'imx-qbm-dbts';
import { DprApiService } from '../../../dpr-api-client.service';

@Injectable({
  providedIn: 'root'
})
export class UnresolvedRefsService {
  public schema: EntitySchema;

  constructor(private readonly dprClient: DprApiService) {
    this.schema = this.dprClient.typedClient.OpsupportSyncDatastore.GetSchema();
  }

  public get(): Promise<TypedEntityCollectionData<OpsupportSyncDatastore>> {
    return this.dprClient.typedClient.OpsupportSyncDatastore.Get();
  }
}
