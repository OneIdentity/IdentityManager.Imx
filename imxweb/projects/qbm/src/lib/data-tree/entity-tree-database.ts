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

import { CollectionLoadParameters, IEntity } from 'imx-qbm-dbts';
import { BusyService } from '../base/busy.service';
import { TreeDatabase } from './tree-database';
import { TreeNodeResultParameter } from './tree-node-result-parameter.interface';

export class EntityTreeDatabase extends TreeDatabase {

  constructor(
    private readonly getEntities: (parameters: CollectionLoadParameters) => Promise<IEntity[]>,
    busyService: BusyService
  ) {
    super();
    this.busyService = busyService
  }

  public async getData(showLoading: boolean, parameters: CollectionLoadParameters = {}): Promise<TreeNodeResultParameter> {
    let entities: IEntity[];

    let isBusy = showLoading ? this.busyService.beginBusy() : undefined;

    try {
      entities = await this.getEntities(parameters);
    } finally {      
      isBusy?.endBusy();
    }

    return { entities, canLoadMore: false, totalCount: entities.length };
  }
}
