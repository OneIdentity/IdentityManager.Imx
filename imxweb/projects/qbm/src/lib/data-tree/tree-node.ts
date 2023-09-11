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

import { IEntity } from 'imx-qbm-dbts';

export interface TreeNodeInfo {
  item?: IEntity;
  identifier?: string;
  name?: string;
  level?: number;
  expandable?: boolean;
  isLoading?: boolean;
  isLoadMoreNode?: boolean;
  display?: string;
}

/** Class representing a single node in the DataTree with expandable and level information */
export class TreeNode implements TreeNodeInfo {
  /** the display of the bounded item of the node */
  public get display(): string {
    return this.item != null ? this.item.GetDisplay() : this.name;
  }

  constructor(
    public item: IEntity,
    public readonly identifier: string,
    public readonly name?: string,
    public readonly level: number = 1,
    public expandable: boolean = false,
    public isLoading: boolean = false,
    public isLoadMoreNode: boolean = false
  ) {}

  public static createNodeFromInfo(info: TreeNodeInfo) {
    return new TreeNode(info.item, info.identifier,info.name,info.level,info.expandable,info.isLoading,info.isLoadMoreNode);
  }
}
