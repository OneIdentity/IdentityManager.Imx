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

import { NestedTreeControl } from '@angular/cdk/tree';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { ConfirmationService } from 'qbm';
import { Subscription } from 'rxjs';
import { GenericStatisticNode, StatisticsDataService } from '../statistics-data.service';

@Component({
  selector: 'imx-statistics-tree',
  templateUrl: './statistics-tree.component.html',
  styleUrls: ['./statistics-tree.component.scss']
})
export class StatisticsTreeComponent implements OnInit, OnDestroy {
  // Controls sidenav interaction
  public sideNavExpanded = true;
  public isSearch = false;

  public treeControl = new NestedTreeControl<GenericStatisticNode>((leaf) => {
    return leaf.children;
  });
  public dataSource = new MatTreeNestedDataSource<GenericStatisticNode>();

  private subscriptions$: Subscription[] = [];

  constructor(
    private dataService: StatisticsDataService,
    private confirmService: ConfirmationService
  ) { }

  public ngOnInit(): void {
    // Subscribe to get the tree
    this.subscriptions$.push(this.dataService.tree$.subscribe(tree => {
      this.dataSource.data = tree;
      // Start with grouped stats open
      const groupedStats = this.dataService.getNodeByLeafName(this.dataService.groupedName);
      this.treeControl.expand(groupedStats);
    }));

    // Subscribe to watch for if we are a search
    this.subscriptions$.push(this.dataService.isSearch$.subscribe(isSearch => {
      this.isSearch = isSearch;
    }));

    // Subscribe to watch for sidenav changes, refresh plots to prevent alignment bugs
    this.subscriptions$.push(this.dataService.sideNavExpanded$.subscribe(sideNavExpanded => {
      this.sideNavExpanded = sideNavExpanded;
      // The animation takes .4s so trigger the chart refresh after then
      setTimeout(() => this.dataService.flushCharts(), 400);
    }));

    // Subscribe to watch the selected node
    this.subscriptions$.push(this.dataService.selectedNodeAncestors$.subscribe(selectedNodeAncestors => {
      // Reset other nodes
      this.dataSource.data.forEach(topNode => {
        topNode.isSelected = false;
        this.treeControl.getDescendants(topNode).forEach(node => node.isSelected = false);
      });
      // Select current node
      selectedNodeAncestors[selectedNodeAncestors.length - 1].isSelected = true;
    }));
  }

  public async observeExpanded(expanded: boolean): Promise<void> {
    if (!this.isSearch || await this.confirmService.confirm({
      Title: 'Closing the search results',
      Message: 'Do you want to navigate away and close your search results?',
      })) {
      // If there is a search already we need to pop a modal before continuing, negate the state since we are managing this ourselves
      this.dataService.clearSearch$.next();
      this.dataService.observeSideNavExpanded(!expanded);
    }
  }

  public selectArea(node: GenericStatisticNode): void {
    const nodeAncestors = [node];
    let nodeParent = node.parent;
    while (nodeParent) {
        nodeAncestors.push(nodeParent);
        nodeParent = nodeParent.parent;
    }
    this.dataService.observeSelection(nodeAncestors.reverse());
  }

  public ngOnDestroy(): void {
    this.subscriptions$.forEach(sub => sub.unsubscribe());
  }

}
