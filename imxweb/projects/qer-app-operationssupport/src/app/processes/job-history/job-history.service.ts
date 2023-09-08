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
import { OpsupportQueueJobhistory } from 'imx-api-qbm';
import { CollectionLoadParameters, DataModel, EntitySchema, ExtendedTypedEntityCollection } from 'imx-qbm-dbts';

import { imx_SessionService } from 'qbm';

@Injectable({
  providedIn: 'root',
})
export class JobHistoryService {
  constructor(private session: imx_SessionService) {}

  public get EntitySchema(): EntitySchema {
    return this.session.TypedClient.OpsupportQueueJobhistory.GetSchema();
  }

  public async get(parameters: CollectionLoadParameters):Promise<ExtendedTypedEntityCollection<OpsupportQueueJobhistory, unknown>> {
    return  this.session.TypedClient.OpsupportQueueJobhistory.Get(parameters);
  }

  public async getDataModel(): Promise<DataModel> {
    return this.session.Client.opsupport_queue_jobhistory_datamodel_get();
  }
}
