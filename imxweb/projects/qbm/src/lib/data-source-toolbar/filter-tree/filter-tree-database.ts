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

import { EuiLoadingService } from '@elemental-ui/core';

import { CollectionLoadParameters, FilterTreeData, IEntity } from 'imx-qbm-dbts';
import { TreeDatabase } from '../../data-tree/tree-database';
import { TreeNode } from '../../data-tree/tree-node';
import { TreeNodeResultParameter } from '../../data-tree/tree-node-result-parameter.interface';
import { FilterTreeEntityWrapperService } from './filter-tree-entity-wrapper.service';

export class FilterTreeDatabase extends TreeDatabase {
  

  constructor(
    private readonly entityWrapper: FilterTreeEntityWrapperService,
    private readonly getFilterTree: (parentkey: string) => Promise<FilterTreeData>,
    private readonly busyLoadingService: EuiLoadingService
  ) {
    super();
  }

  public async getData(showLoading: boolean, parameters: CollectionLoadParameters = {}): Promise<TreeNodeResultParameter> {
    let entities: IEntity[];
    if (showLoading) {
      setTimeout(() => this.busyLoadingService.show());
    }

    try {
      entities = this.entityWrapper.convertToEntities(await this.getFilterTree(parameters.ParentKey), parameters['parentDisplay']);
    } finally {
      if (showLoading) {
        setTimeout(() => this.busyLoadingService.hide());
      }
    }

    return { entities, canLoadMore: false, totalCount: entities.length };
  }

  /** return children for a given tree node including the information, if more elements are available on the server */
  public async getChildren(node: TreeNode, startIndex: number)
    : Promise<{ nodes: TreeNode[], canLoadMore: boolean }> {

    const entities = await this.getData(false, { ParentKey: node.name, StartIndex: startIndex, parentDisplay: node.item.GetColumn('LongDisplay').GetValue() });

    const nodes = this.createSortedNodes(entities.entities, node.level + 1);
    return {
      nodes: entities.entities.map(entity => nodes.find(x => this.getId(x.item) === this.getId(entity))),
      canLoadMore: entities.canLoadMore
    };
  }

  public getId(entity: IEntity): string {
    return entity.GetColumn('ObjectKey').GetValue();
  }
}
