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

import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { IEntity } from '@imx-modules/imx-qbm-dbts';
import { ResourceAccessMembersData } from '../../../../TypedClient';

interface ExampleFlatNode {
  expandable: boolean;
  name: string;
  item: ResourceAccessMembersData;
  level: number;
}

@Component({
  selector: 'imx-permission-member',
  templateUrl: './permission-member.component.html',
  styleUrls: ['./permission-member.component.scss'],
})
export class PermissionMemberComponent implements OnChanges {
  /** Methods and functions for the tree*/

  public treeControl = new FlatTreeControl<ExampleFlatNode>(
    (node) => node.level,
    (node) => node.expandable,
  );

  private _transformer = (node: ResourceAccessMembersData, level: number) => {
    return {
      expandable: !!node.Members && node.Members.length > 0,
      name: node.Display ?? '',
      item: node,
      level: level,
    };
  };

  private treeFlattener = new MatTreeFlattener(
    this._transformer,
    (node) => node.level,
    (node) => node.expandable,
    (node) => node.Members,
  );
  public dataSource: MatTreeFlatDataSource<ResourceAccessMembersData, ExampleFlatNode, ExampleFlatNode> | undefined =
    new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  public hasChild = (_: number, node: ExampleFlatNode) => node.expandable;

  /** Inputs */
  @Input() public members: ResourceAccessMembersData[];
  @Input() public displayedEntity: IEntity;

  /**LDS texts */
  public circularWarningText = '#LDS#There is a circular membership dependency. Please check the members inheritance.';

  public ngOnChanges(changes: SimpleChanges): void {
    if (!changes.members) {
      return;
    }
    if (this.members == null || this.members.length <= 0) {
      this.dataSource = undefined;
    } else {
      this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
      this.dataSource.data = this.members;
    }
  }
}
