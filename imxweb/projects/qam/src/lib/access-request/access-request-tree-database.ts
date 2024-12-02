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

import { IEntity, TypedEntityBuilder } from '@imx-modules/imx-qbm-dbts';

import { TreeDatabase, TreeNode } from 'qbm';
import { QamResourcetree, QamTreeNode } from './qam-resourcetree';

/** Provider of DgeResources for the imx-data-tree */
export class AccessRequestTreeDatabase extends TreeDatabase {
  private readonly builder = new TypedEntityBuilder(QamResourcetree);

  constructor(private readonly dgeResourcesNodes: QamTreeNode[]) {
    super();
    this.identifierColumnName = 'UidQamDug';
    this.canSearch = false;
  }

  /** Initial data from database */
  public async initialize(): Promise<TreeNode[]> {
    let rootNodes: TreeNode[] = [];
    rootNodes = this.createTreeNodes(this.dgeResourcesNodes, 0);
    this.initialized.next();
    return rootNodes;
  }
  /** creates recursively all {@link TreeNode | tree nodes} from the given {@link QamTreeNode | qamTree nodes} */
  public createTreeNodes(qamTreeNodes: QamTreeNode[], levelNumber: number): TreeNode[] {
    let treeNodes: TreeNode[] = [];

    for (const qamTreeNode of qamTreeNodes) {
      // create IEntity
      const qamResourcetree = this.builder.buildReadWriteEntity({
        entitySchema: QamResourcetree.GetEntitySchema(),
        entityData: QamResourcetree.buildSingleEntityData(qamTreeNode),
      });

      // create TreeNode
      const treeNode = this.createNode(qamResourcetree.GetEntity(), levelNumber);
      treeNode.isSelectable = qamResourcetree.IsTarget.value;

      // create TreeNodes also for the chiild nodes
      if (qamTreeNode.Nodes && qamTreeNode.Nodes.length > 0) {
        const childNodes = this.createTreeNodes(qamTreeNode.Nodes, levelNumber + 1);
        treeNode.nodes = childNodes;
      }

      // push to result
      treeNodes.push(treeNode);
    }
    return treeNodes;
  }

  /** return children for a given tree node including the information, if more elements are available on the server */
  public async getChildren(node: TreeNode, startIndex: number): Promise<{ nodes: TreeNode[]; canLoadMore: boolean }> {
    return {
      nodes: node.nodes as TreeNode[],
      canLoadMore: false,
    };
  }

  /** Returns the UID of the QamDug */
  public getId(entity: IEntity): string {
    const qamNode = entity.GetColumn('UidQamDug')?.GetValue();
    return qamNode.length > 0 ? qamNode : entity.GetDisplay();
  }
}
