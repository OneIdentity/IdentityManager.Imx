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

import { animate, animateChild, group, query, state, style, transition, trigger } from '@angular/animations';
import { FlatTreeControl, NestedTreeControl } from '@angular/cdk/tree';
import { Component, Input, Output, EventEmitter, TemplateRef, SimpleChanges, OnChanges } from '@angular/core';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { DynamicDataSource } from './sidenav-tree-dynamic-extension';

/**
 * Handles creating a responsive nested sidenav tree.
 *
 *
 * Requires:
 * @param {MatTreeNestedDataSource<any>} dataSource: Static datasource with all data available at once, use dynamicDatasource otherwise.
 * @param {DynamicDataSource<any>} dynamicDataSource: Dynamic datasource for loading more data incrementally.
 * @param {NestedTreeControl<any> | FlatTreeControl<any>} treeControl: Controls tree behavior.
 * @param {string} headerText: Text that will appear on side and at top of sidenav.
 * @param {TemplateRef<any>} nodeContent: A template ref of how the node of the tree will look.
 *
 * Optional:
 * @param {boolean} [sideNavExpanded=false] Sets whether the sidenav is open or closed initially, defaults to false.
 * @param {boolean} [manageExpandedExternally=false] This prevents the internal sideNavExpanded management and requires the sideNavExpanded to be managed externally. This allows additional logic to be stuck in between. Defaults to false.
 * @param {string} [expandWidth="600px"] Set the width of the expansion, according to material avoid percent based widths. Default is '600px'

 * @param {Function} [hasChild] Function to determine if a node has children or not. By default uses the children property.
 * @param {Function} [isSelected] Function to determine if a node is currently selected. By default uses the isSelected property.
 * @param {Function} [isLoading] Function to indicate if a node is currently getting children from the server.
 * @param {boolean} [showSidenavHeader=true] Indicates if we should have the header and mat card present or not. Defaults to true.
 * @param {string} [noResultText] The text shown in case of no search results


 */
@Component({
  selector: 'imx-sidenav-tree',
  templateUrl: './sidenav-tree.component.html',
  styleUrls: ['./sidenav-tree.component.scss'],
  animations: [
    trigger('expandDiv', [
      state(
        'closed',
        style({
          width: '48px',
        })
      ),
      state('opened', style({ width: '{{ expandWidth }}' }), { params: { expandWidth: '*' } }),
      transition('* <=> *', [
        group([
          query('@expandSearch', animateChild(), { optional: true }),
          animate('200ms ease'),
          query('@fadeIcon', animateChild(), { optional: true }),
          animate('200ms ease'),
          query('@rotateIcon', animateChild()),
          animate('400ms ease'),
        ]),
      ]),
    ]),
    trigger('rotateIcon', [
      state(
        'closed',
        style({
          rotate: '180deg',
        })
      ),
      state(
        'opened',
        style({
          rotate: '0deg',
        })
      ),
      transition('* <=> *', animate('400ms ease')),
    ]),
    trigger('expandSearch', [
      state(
        'closed',
        style({
          width: '0px',
          visibility: 'hidden',
        })
      ),
      state(
        'opened',
        style({
          width: '320px',
          visibility: 'visible',
        }),
        { params: { expandWidth: '*' } }
      ),
      state(
        'hidden',
        style({
          width: 0,
          visibility: 'hidden',
        })
      ),
      transition('* <=> *', [group([query('@fadeIcon', animateChild(), { optional: true }), animate('400ms ease')])]),
    ]),
    trigger('fadeIcon', [
      state(
        'opened',
        style({
          opacity: '0',
          width: '0px',
          visibility: 'hidden',
        })
      ),
      state(
        'closed',
        style({
          opacity: '1',
          width: '40px',
          visibility: 'visible',
        })
      ),
      state(
        'hidden',
        style({
          width: 0,
          visibility: 'hidden',
        })
      ),
      transition('* <=> *', animate('400ms ease')),
    ]),
  ],
})
export class SidenavTreeComponent implements OnChanges {
  public isLoadingMore: boolean;
  private searchEnabled = false;

  // Required input
  // Either dataSource as a MatTreeNestedDataSource
  @Input() public dataSource: MatTreeNestedDataSource<any>;

  // Or dynamicDataSource as a DynamicDataSource
  @Input() public dynamicDataSource: DynamicDataSource<any>;

  // treeControl as a NestedTreeControl
  @Input() public treeControl: NestedTreeControl<any> | FlatTreeControl<any>;

  // headerText is  Make sure it is already translated before input.
  @Input() public headerText: string;

  // nodeContent will a template rendered inside each node and it uses a node variable.
  @Input() public nodeContent: TemplateRef<any>;

  // Optional input
  // Start with the sideNav expanded - default is false
  @Input() public sideNavExpanded = false;

  // This prevents the internal sideNavExpanded management and requires the sideNavExpanded to be managed externally. This allows additional logic to be stuck in between.
  @Input() public manageExpandedExternally = false;

  // Set the width of the expansion, according to material avoid percent based widths. default is '600px'
  @Input() public expandWidth = '600px';

  // Function used to determine if there are children under the node, defaults to look for a children property of length > 0.
  @Input() public hasChild = (_: number, node: any) => node?.children && node.children.length > 0;

  // Function used to determine if the node is currently selected, this value is maintained outside this component
  @Input() public isSelected = (node: any) => node.isSelected;

  // Function used to determine if the node is loading children, this value is maintained outside this component
  @Input() public isLoading = (node: any) => false;

  // Remove the header and hide the mat-card style in false state
  @Input() public showSidenavHeader = true;

  // Text to show when search is empty
  @Input() public noResultText = '#LDS#There are no items matching your search.';

  // Output
  // Emits when the sidenav state changed
  @Output() public sideNavExpandedChange = new EventEmitter<boolean>();

  // selectedNode outputs the node that was chosen
  @Output() public selectedNode = new EventEmitter<any>();

  public async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes['database']) {
      console.log('Need to refresh tree');
    }
  }

  get initializingData(): boolean {
    return this.dynamicDataSource?.initializingData;
  }

  get hasData(): boolean {
    return this.dynamicDataSource?.hasData;
  }

  get canLoadMore(): boolean {
    return this.dynamicDataSource?.canLoadMore;
  }

  get expandState(): string {
    return this.sideNavExpanded ? 'opened' : 'closed';
  }

  get searchState(): string {
    return this.sideNavExpanded ? (this.searchEnabled ? 'opened' : 'closed') : 'hidden';
  }

  public get anyNodeOpen(): boolean {
    return this.dynamicDataSource
      ? this.dynamicDataSource.isRootNodeOpen || this.dynamicDataSource.isSearch
      : this.treeControl.expansionModel.selected.length > 0;
  }

  public closeAllNodes(): void {
    this.treeControl.collapseAll();
  }

  public toggleExpand(): void {
    if (!this.manageExpandedExternally) {
      this.sideNavExpanded = !this.sideNavExpanded;
    }
    this.sideNavExpandedChange.emit(this.sideNavExpanded);
  }

  public selectNode(node: any): void {
    if (this.dynamicDataSource) {
      this.dynamicDataSource.setSelection(node);
    }
    this.selectedNode.emit(node);
  }

  public async onLoadMore(): Promise<void> {
    this.isLoadingMore = true;
    try {
      await this.dynamicDataSource.loadMore();
    } finally {
      this.isLoadingMore = false;
    }
  }

  public enableSearch(): void {
    this.searchEnabled = true;
  }

  public async onSearch(search: string): Promise<void> {
    if (search === '') {
      this.searchEnabled = false;
    }
    await this.dynamicDataSource.onSearch();
  }
}
