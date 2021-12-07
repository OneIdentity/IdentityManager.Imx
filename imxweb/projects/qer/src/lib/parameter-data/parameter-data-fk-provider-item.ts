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
 * Copyright 2021 One Identity LLC.
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

import { CollectionLoadParameters, EntityCollectionData, FkProviderItem, IEntity } from 'imx-qbm-dbts';
import { ParameterDataLoadParameters } from './parameter-data-load-parameters.interface';

export class ParameterDataFkProviderItem implements FkProviderItem {
  constructor(
    public readonly columnName: string,
    public readonly fkTableName: string,
    private readonly entity: IEntity,
    private readonly getCandidates: (loadParameters: ParameterDataLoadParameters) => Promise<EntityCollectionData>,
    public readonly parameterNames: string[] = [
      'OrderBy',
      'StartIndex',
      'PageSize',
      'filter',
      'search'
    ]
  ) {}

  public async load(__: IEntity, parameters: CollectionLoadParameters): Promise<EntityCollectionData> {
    return this.getCandidates(
      { ...parameters, ...{ columnName: this.columnName, fkTableName: this.fkTableName, diffData: this.entity.GetDiffData() } }
    );
  }
}
