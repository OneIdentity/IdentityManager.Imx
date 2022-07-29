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

import { PortalRespUnsgroup, PortalTargetsystemUnsAccount } from 'imx-api-tsb';
import { CollectionLoadParameters, CompareOperator, EntitySchema, FilterData, FilterType, TypedEntityCollectionData } from 'imx-qbm-dbts';
import { ArcApiService } from '../../services/arc-api-client.service';
import { TsbApiService } from 'tsb';

export const ADS_NAMESPACE_FILTER: FilterData = {
  ColumnName: PortalTargetsystemUnsAccount.GetEntitySchema().Columns.UID_DPRNameSpace.ColumnName,
  Type: FilterType.Compare,
  CompareOp: CompareOperator.Equal,
  Value1: 'ADS-DPRNameSpace-ADS',
};

@Injectable({
  providedIn: 'root'
})
export class UnsgroupsService {

  constructor(
    private readonly arcApiClient: ArcApiService,
    private readonly tsbApiClient: TsbApiService
  ) { }

  public get respUnsGroupSchema(): EntitySchema {
    return this.tsbApiClient.typedClient.PortalRespUnsgroup.GetSchema();
  }

  public async get(parameters: CollectionLoadParameters): Promise<TypedEntityCollectionData<PortalRespUnsgroup>> {
    parameters.filter.push(ADS_NAMESPACE_FILTER);
    return this.arcApiClient.typedClient.PortalRespUnsgroup.Get(parameters);
  }
}
