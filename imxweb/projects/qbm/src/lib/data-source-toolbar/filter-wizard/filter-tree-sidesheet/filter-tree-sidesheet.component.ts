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

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { FlatTreeControl } from '@angular/cdk/tree';
import _ from 'lodash';
import { DynamicDataApiControls, DynamicDataSource } from '../../../sidenav-tree/sidenav-tree-dynamic-extension';
import { FilterTreeNode, FilterTreeParameterData, FilterTreeSelectionParameter } from './filter-tree-sidesheet.model';
@Component({
  selector: 'imx-filter-tree-sidesheet',
  templateUrl: './filter-tree-sidesheet.component.html',
  styleUrls: ['./filter-tree-sidesheet.component.scss'],
})
export class FilterTreeSidesheetComponent implements OnInit {
  public currentlySelectedFilter: FilterTreeSelectionParameter;
  @Input() public data: FilterTreeParameterData;
  @Output() public filterTreeSelectionChanged = new EventEmitter<FilterTreeSelectionParameter>();

  public hasChild = (_: number, node: FilterTreeNode) => node.hasChildren;
  private isInitial = true;

  public apiControls: DynamicDataApiControls<FilterTreeNode>;
  public dynamicDataSource: DynamicDataSource<FilterTreeNode>;
  public treeControl: FlatTreeControl<FilterTreeNode>;
  public selectFn = (node: FilterTreeNode) =>
    node.isSelected ||
    (this.data?.preSelection?.display === node.nodeDisplay &&
      _.isEqual(this.data?.preSelection?.filter, node?.filterData) &&
      this.isInitial);

  public isLoading = (node: FilterTreeNode) => node.isLoading || false;

  constructor() {
    this.treeControl = new FlatTreeControl<FilterTreeNode>(
      (leaf) => leaf.level,
      (leaf) => leaf.hasChildren,
    );

    this.apiControls = {
      setup: async () => {
        const items = await this.data.filterTreeParameter.filterMethode('');
        const rootNode: FilterTreeNode = {
          level: 0,
          nodeDisplay: items.Description ?? '',
          hasChildren: true,
          objectKey: '',
          children:
            items.Elements?.map((elem) => ({
              filterData: elem.Filter,
              nodeDisplay: elem.Display ?? '',
              hasChildren: elem.HasHierarchy ?? false,
              objectKey: elem.ObjectKey,
              level: 1,
            })) ?? [],
        };
        return { rootNode };
      },
      getChildren: async (node) => {
        node.isLoading = true;
        const items = await this.data.filterTreeParameter.filterMethode(node.objectKey ?? '');
        node.isLoading = false;
        return (
          items.Elements?.map((elem) => ({
            filterData: elem.Filter,
            nodeDisplay: elem.Display ?? '',
            hasChildren: elem.HasHierarchy ?? false,
            objectKey: elem.ObjectKey,
            level: node.level + 1,
          })) ?? []
        );
      },
      changeSelection: (data, selectedNode) => {
        data.forEach((elem) => (elem.isSelected = false));
        selectedNode.isSelected = true;
        this.isInitial = false;
        return data;
      },
    };

    this.dynamicDataSource = new DynamicDataSource<FilterTreeNode>(this.treeControl, this.apiControls);
  }

  public async ngOnInit(): Promise<void> {
    this.currentlySelectedFilter = this.data.preSelection;
    await this.dynamicDataSource.setup(true);
    const current = this.dynamicDataSource.data.find((node) => node.nodeDisplay === this.data.preSelection?.display);
    if (current) {
      this.dynamicDataSource.setSelection(current);
    }
  }

  public onSelectedNodeChanged(node: FilterTreeNode) {
    this.currentlySelectedFilter = { display: node.nodeDisplay, filter: node.filterData };
    this.filterTreeSelectionChanged.emit({ display: node.nodeDisplay, filter: node.filterData });
  }

  public closeAllNodes(): void {
    this.treeControl.collapseAll();
  }
}
