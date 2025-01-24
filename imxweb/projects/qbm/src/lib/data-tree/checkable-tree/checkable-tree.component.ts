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

import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import {
  AfterViewInit,
  Component,
  ContentChild,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  TemplateRef,
} from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { Subscription } from 'rxjs';

import { CollectionLoadParameters, IEntity } from 'imx-qbm-dbts';
import { ClassloggerService } from '../../classlogger/classlogger.service';
import { SnackBarService } from '../../snackbar/snack-bar.service';
import { TreeDatabase } from '../tree-database';
import { TreeDatasource } from '../tree-datasource';
import { TreeNode, TreeNodeInfo } from '../tree-node';

@Component({
  selector: 'imx-checkable-tree',
  templateUrl: './checkable-tree.component.html',
  styleUrls: ['./checkable-tree.component.scss'],
})
/**
 * A tree component with a {@link FlatTreeControl| FlatTreeControl} of @angular/cdk.
 */
export class CheckableTreeComponent implements OnChanges, AfterViewInit, OnDestroy {
  /** the dataSource of the tree which provide the nodes and handling the tree-operations. */
  public treeDataSource: TreeDatasource;

  /** the {@link FlatTreeControl| FlatTreeControl} of @angular/cdk */
  public treeControl: FlatTreeControl<TreeNode>;

  @ContentChild(TemplateRef, { static: true }) public templateRef: TemplateRef<any>;

  /** currently selected entities */
  @Input() public selectedEntities: IEntity[] = [];

  /** the service providing the data for the {@link TreeDatasource| TreeDatasource} */
  @Input() public database: TreeDatabase;

  /** the caption displaying when an empty node is added at the top of the tree  */
  @Input() public emptyNodeCaption: string;

  /** determines whether the control allows multiselect or not  */
  @Input() public withMultiSelect: boolean;

  @Input() public withSelectedNodeHighlight: boolean;

  /** determines whether the control allows multiselect or not  */
  @Input() public navigationState: CollectionLoadParameters;

  /** modify tree node style, set true if using nodeSelected event emitter  */
  @Input() public isNodeSelectable = false;

  /**
   * Event, that will fire when the a node was selected and emitting a list of
   * {@link IEntity| Entities} of the selected node and it's parents.
   */
  @Output() public nodeSelected = new EventEmitter<IEntity>();

  /** event, that fires, after the checked nodes list has been updated */
  @Output() public checkedNodesChanged = new EventEmitter();

  /** Event, that fires, after the tree is rendered */
  @Output() public treeRendered = new EventEmitter();

  /**
   * a single TreeNode, that is currenly selected
   */
  public selectedNode: TreeNode;
  /**
   * the checkListSelectionModel
   */
  public checklistSelection: SelectionModel<TreeNode>;

  /** indicates if a emptyNode recently created */
  private emptyNodeCreated = false;

  private subscriptions: Subscription[] = [];

  constructor(private readonly snackBar: SnackBarService, private readonly logger: ClassloggerService) {
    this.treeControl = new FlatTreeControl<TreeNode>(this.getLevel, this.isExpandable);
  }

  public async ngOnChanges(changes: SimpleChanges): Promise<void> {
    this.checklistSelection = new SelectionModel<TreeNode>(this.withMultiSelect);
    if (changes['database']) {
      this.logger.debug(this, `initialize the treeDatasource`);
      this.treeDataSource = new TreeDatasource(this.treeControl, this.database);
      this.treeDataSource.emptyNodeCaption = this.emptyNodeCaption;
      this.treeDataSource.init(await this.database?.initialize(this.navigationState, !changes['database'].firstChange));
      this.subscriptions.push(
        this.treeDataSource.dataChange.subscribe((elem) => {
          this.treeRendered.emit();
          this.updateCheckedTreeNodes(elem);
        })
      );

      this.logger.debug(this, `toggle Node of the selected entity to load its children`);
    }

    if (changes['selectedEntities'] && changes['selectedEntities'].currentValue && changes['selectedEntities'].currentValue.length === 1) {
      const key = this.getId(changes['selectedEntities'].currentValue[0]);

      if (key !== '') {
        if (this.treeControl.dataNodes != null) {
          const node = this.treeControl.dataNodes.filter((treeNode) => treeNode.name === key)?.[0];
          if (node) {
            this.selectedNode = node;
          }
          if (this.emptyNodeCreated) {
            this.emptyNodeCreated = false;
            if (this.treeDataSource.removeNodeFromTop()) {
              this.snackBar.open({ key: '#LDS#Your changes have been discarded.' });
            }
          }
        }
      } else {
        this.selectedNode = this.treeDataSource.addEmpyNodeToTop();
        this.emptyNodeCreated = true;
      }
    }

    this.updateCheckedTreeNodes(this.treeDataSource?.data);
  }

  public ngAfterViewInit(): void {
    if (this.database) {
      this.subscriptions.push(
        this.database.dataReloaded$.subscribe((data) => {
          if (data) {
            this.initializeTreeData();
          }
        })
      );
    }
  }

  public ngOnDestroy(): void {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }
  /** forces the tree to reload everything */
  public async reload(): Promise<void> {
    this.treeDataSource?.init(await this.database?.initialize(this.navigationState));
  }

  /**
   * Adds a child entity to a parent, identified by the parents uid
   * @param childEntity new entity to be added to the tree
   * @param uidParent uid for the parent
   */
  public add(childEntity: IEntity, uidParent: string) {
    const node = this.treeDataSource.data.find((elem) => this.getId(elem.item) === uidParent);
    this.treeDataSource.addChildNode(node, childEntity);
  }

  /**
   *
   * @param entity entity, for identifying the node
   * @param newNodeInfo new information for the node
   */
  public updateNode(entity: IEntity, newNodeInfo: TreeNodeInfo) {
    const node = this.getNode(entity);
    this.treeDataSource.updateNode(node, newNodeInfo);
  }

  /**
   * Deletes a node identified by its identity
   * @param entity entity, for identifying the node
   */
  public deleteNode(entity: IEntity, withChildren: boolean) {
    const node = this.getNode(entity);
    const parent = this.getParentNode(node);
    this.treeDataSource.removeNode(node,withChildren);

    const des = this.treeControl.getDescendants(parent).filter((elem) => !elem.isLoadMoreNode);
    if (des.length === 0 || withChildren) {
      this.treeDataSource.updateNode(parent, { expandable: false });
    }
  }

  /** @ignore gets the level of a tree node */
  public getLevel = (node: TreeNode): number => node.level;

  /** returns true, if the node has childnodes */
  public isExpandable(node: TreeNode): boolean {
    return node.expandable;
  }

  public isExpanded(entity: IEntity): boolean {
    const node = this.getNode(entity);
    return this.treeControl.isExpanded(node);
  }

  public getEntityById(id: string): IEntity {
    const node = this.treeDataSource.data.find((elem) => this.getId(elem.item) === id);
    return node?.item;
  }

  public hasChildren(entity: IEntity): boolean {
    return this.isExpandable(this.getNode(entity));
  }

  /** returns true, if the node has childnodes */
  public hasChild(index: number, node: TreeNode): boolean {
    return node.expandable;
  }

  /** Emits the selected treenode. */
  public selectNode(node: TreeNode): void {
    if (this.withMultiSelect) {
      this.checklistSelection.toggle(node);
      this.emitNodeCheckedEvent(node, this.checklistSelection.isSelected(node));
    } else {
      this.selectedNode = node;
      this.nodeSelected.emit(this.selectedNode.item);
    }
  }

  /**
   * Expands a node identified by its entity
   * @param entity entity, for identifying the node
   */
  public expandNode(entity: IEntity) {
    const node = this.getNode(entity);
    if (node == null) {
      return;
    }
    this.treeControl.expand(node);
  }

  /** @ignore loads more elements */
  public async loadMore(node: TreeNode): Promise<void> {
    const parent = this.getParentNode(node);
    let startindex = this.treeControl.dataNodes.filter((elem) => elem.level === 0 && !elem.isLoadMoreNode).length;
    if (parent != null) {
      const des = this.treeControl.getDescendants(parent);
      startindex = des.filter((elem) => elem.level === parent.level + 1 && !elem.isLoadMoreNode).length;
    }
    this.treeDataSource.loadMore(node, parent?.name || '' /* first level */, startindex);
  }

  /** Toggle the item selection. */
  public async itemSelectionToggle(node: TreeNode, evt: MatCheckboxChange): Promise<void> {
    this.checklistSelection.toggle(node);
    await this.emitNodeCheckedEvent(node, evt.checked);
  }

  /** clears all selected nodes for the tree */
  public clearSelection(): void {
    this.checklistSelection.clear();
    this.selectedEntities = [];
  }

  /** mark nodes as selected, if its entity is in the selected entities list */
  public updateCheckedTreeNodes(nodes?: TreeNode[]): void {
    const data = nodes || this.treeDataSource?.data;
    if (this.withMultiSelect) {
      const selected = this.getSelectedItems();
      if (selected) {
        this.updatePreselectedEntities(data, selected);
      }
    } else if (!this.withMultiSelect) {
      const selected = this.getSelectedItem();
      if (selected) {
        this.selectTreeNode(selected);
      }
    }
  }

  public isSameNode(node1: TreeNode, node2: TreeNode): boolean {
    if (node1 == null || node2 == null) {
      return false;
    }
    return this.getId(node1.item) === this.getId(node2.item);
  }

  private async initializeTreeData(): Promise<void> {
    this.treeDataSource?.init(await this.database.initialize(this.navigationState));
  }

  private getSelectedItem(): string {
    return this.selectedEntities.length > 0 && this.selectedEntities[0] != null ? this.getId(this.selectedEntities[0]) : null;
  }

  private getNode(entity: IEntity): TreeNode {
    return this.treeDataSource?.data.find((elem) => this.getId(elem.item) === this.getId(entity));
  }

  /* Get the parent node of a node */
  private getParentNode(node: TreeNode): TreeNode | null {
    const currentLevel = this.getLevel(node);

    if (currentLevel < 1) {
      return null;
    }

    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;

    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];

      if (this.getLevel(currentNode) < currentLevel) {
        return currentNode;
      }
    }
    return null;
  }

  /** Gets the identifier for all selected entities */
  private getSelectedItems(): string[] {
    this.logger.log(this, 'selected', this.selectedEntities);
    return this.selectedEntities.length > 0 ? this.selectedEntities.map((elem) => this.getId(elem)).filter((elem) => elem != null) : [];
  }

  /** emitts the nodeChecked event, if mode is 'singleSelect' */
  private emitNodeCheckedEvent(node: TreeNode, checked: boolean): void {
    this.updateSelectedEntities(node.item, checked);
    this.checkedNodesChanged.emit();
  }

  /** selects a single tree node */
  private selectTreeNode(ident: string): void {
    if (!this.treeControl.dataNodes) {
      return;
    }

    const selectedTreeNodes = this.treeControl.dataNodes.filter((treeNode) => this.getId(treeNode.item) === ident);
    if (selectedTreeNodes.length > 0) {
      this.treeControl.expand(selectedTreeNodes[0]);
      this.selectedNode = selectedTreeNodes[0];
    }
  }

  /** selects all nodes, that are currently in the selected List */
  private updatePreselectedEntities(nodes: TreeNode[], ident: string[]): void {
    if (nodes == null) {
      return;
    }
    const nodesToCheck = nodes.filter((node) => !this.checklistSelection.isSelected(node) && ident.some((name) => name === node.name));

    for (const node of nodesToCheck) {
      this.checklistSelection.select(node);
    }
  }

  private updateSelectedEntities(current: IEntity, checked: boolean): void {
    if (checked) {
      this.selectedEntities.push(current);
    } else {
      const index = this.selectedEntities.findIndex((elem) => this.getId(elem) === this.getId(current));
      this.selectedEntities.splice(index, 1);
    }
  }

  private getId(entity: IEntity): string {
    return this.database ? this.database.getId(entity) : entity.GetKeys()[0];
  }
}
