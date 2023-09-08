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

import { FlatTreeControl } from '@angular/cdk/tree';
import { CollectionViewer, SelectionChange } from '@angular/cdk/collections';

import { TreeDatabase } from './tree-database';
import { TreeNode } from './tree-node';
import { TreeDatasource } from './tree-datasource';
import { CollectionLoadParameters, IEntity } from 'imx-qbm-dbts';

describe('TreeDatabase', () => {
  const createEntity = (key, parent?) => ({
    GetColumn: __ => ({ GetDisplayValue: () => '' }),
    GetDisplay: () => '',
    GetKeys: () => [key],
    parent
  } as IEntity & { parent?: string; });

  let treeControl: FlatTreeControl<TreeNode>;
  let dummyEntity: IEntity;

  beforeEach(() => {
    treeControl = new FlatTreeControl<TreeNode>(
      node => node.level,
      node => node.item.GetColumn('HasChildren').GetValue()
    );

    dummyEntity = createEntity('dummy');
  });

  it('should disconnect all subscriptions', () => {
    const treeDatasource = new TreeDatasource(treeControl, new class extends TreeDatabase {}());

    treeDatasource.connect({ viewChange: {} } as CollectionViewer);

    expect(treeDatasource['subscriptions'].length > 0 && treeDatasource['subscriptions'].every(s => s.closed)).toBeFalsy();

    treeDatasource.disconnect();

    expect(treeDatasource['subscriptions'].length > 0 && treeDatasource['subscriptions'].every(s => s.closed)).toBeTruthy();
  });

  describe('toggle node', () => {
    const toNode = (entity, level = 0, expandable = false) => new TreeNode(entity, '', entity.GetKeys().join(), level, expandable);

    const entityUnderTest = createEntity('keyEntityUnderTest');
    const nodeUnderTest = toNode(entityUnderTest, 0, true);
    const child = createEntity('keyChildToNodeUnderTest', entityUnderTest.GetKeys().join());

    let treeDatabase: TreeDatabase;

    beforeEach(() => {
      treeDatabase = new class extends TreeDatabase {
        private readonly justSomeParentEntity = createEntity('keyParent1');
        private readonly justSomeEntity = createEntity('keyOfSomeEntity');
  
        constructor() {
          super();
  
          this['rootData'] = [
            this.justSomeParentEntity,
            entityUnderTest,
            this.justSomeEntity
          ];
          this['rootNodes'] = [
            toNode(this.justSomeParentEntity),
            nodeUnderTest,
            toNode(this.justSomeEntity)
          ];
        }
  
        readonly getChildren = jasmine.createSpy('getChildren').and.callFake((node, __) => ({
          nodes: this.children.filter(child => child.parent === node.name).map(child => toNode(child, 1))
        }));
  
        private readonly children = [
          child,
          createEntity('keyAnotherChild', this.justSomeParentEntity.GetKeys().join())
        ];
      }();
    });

    it('expands', async () => {
      // Arrange  
      const expectedNumOfNodesAfterExpand = 4;

      const treeDatasource = new TreeDatasource(treeControl, treeDatabase);
      treeDatasource.init(treeDatabase['rootNodes']);

      // Act
      await treeDatasource.handleTreeControl({ added: [nodeUnderTest] } as SelectionChange<TreeNode>);

      // Check
      expect(treeDatabase.getChildren).toHaveBeenCalled();

      const childNode = treeDatasource.data.find(d => d.name === child.GetKeys().join());

      expect(childNode.isLoading).toEqual(false);

      expect(treeDatasource.data.length).toEqual(expectedNumOfNodesAfterExpand);
    });

    it('collapses', async () => {
      // Arrange
      const expectedNumOfNodesAfterCollapse = 3;

      const treeDatasource = new TreeDatasource(treeControl, treeDatabase);
      treeDatasource.init(treeDatabase['rootNodes']);

      const childNode = toNode(child, 1);

      const index = treeDatasource.data.indexOf(nodeUnderTest);
      treeDatasource.data.splice(index + 1, 0, childNode); // fake expand
  
      // Act
      await treeDatasource.handleTreeControl({ removed: [nodeUnderTest] } as SelectionChange<TreeNode>);

      // Check
      expect(treeDatabase.getChildren).not.toHaveBeenCalled();

      expect(childNode.isLoading).toEqual(false);

      expect(treeDatasource.data.length).toEqual(expectedNumOfNodesAfterCollapse);
    });
  });

  for(const testcase of [
    {
      description: 'add node',
      change: {
        added: [
          new TreeNode(dummyEntity, 'uid-parent1', 'uid-parent1', 0, true),
          new TreeNode(dummyEntity, 'uid-parent2', 'uid-parent2', 0, true)
        ]
      },
      expectGetChildren: 2
    },
    {
      description: 'remove node',
      change: {
        removed: [new TreeNode(dummyEntity, 'uid-parent1', 'uid-parent1', 0, true)]
      },
      expectGetChildren: 0
    },
  ]) {
    it(`can handle the tree control (${testcase.description})`, async () => {
      // Arrange
      const treeDatabase = new class extends TreeDatabase {
        readonly getChildren = jasmine.createSpy('getChildren');
      }();

      const treeDatasource = new TreeDatasource(treeControl, treeDatabase);

      treeDatasource.init(testcase.change.added ?? []);
      treeDatasource.init(treeDatasource.data.concat(testcase.change.removed ?? []));

      // Act
      await treeDatasource.handleTreeControl(testcase.change as unknown as SelectionChange<TreeNode>);

      // Check
      expect(treeDatabase.getChildren).toHaveBeenCalledTimes(testcase.expectGetChildren);
    });
  }

  for (const testcase of [
    { desciption: 'for root', entities:[dummyEntity], node: new TreeNode(dummyEntity, 'uid-parent1', 'uid-parent1', 0), ParentKey: '', startIndex: 0, hasmore: true, expectedLenght: 2 },
    { desciption: 'for children', entities:[dummyEntity], node: new TreeNode(dummyEntity, 'uid-parent1', 'uid-parent1', 0), ParentKey: 'uid-parent1', startIndex: 0, hasmore: true, expectedLenght: 2 },
    { desciption: 'for root', entities:[dummyEntity], node: new TreeNode(dummyEntity, 'uid-parent1', 'uid-parent1', 0), ParentKey: '', startIndex: 0, hasmore: false, expectedLenght: 1 },
    { desciption: 'for children', entities:[dummyEntity], node: new TreeNode(dummyEntity, 'uid-parent1', 'uid-parent1', 0), ParentKey: 'uid-parent1', startIndex: 0, hasmore: false, expectedLenght: 1 },
    { desciption: 'without nodes', entities:[], node: new TreeNode(dummyEntity, 'uid-parent1', 'uid-parent1', 0), ParentKey: 'uid-parent1', startIndex: 0, hasmore: false, expectedLenght: 0 }
  ]) {
    it(`can load more (${testcase.desciption})`, async () => {
      //Arrange
      const treeDatabase = new class extends TreeDatabase {
        getData(showLoading: boolean, parameters: CollectionLoadParameters = {}): Promise<any> {
          return Promise.resolve({
            entities: testcase.entities,
            canLoadMore: testcase.hasmore,
            totalCount: 999
          });
        }

        readonly createSortedNodes = (entities, __) => entities.map(ent => new TreeNode(ent, '', ''));
      }();

      const source = new TreeDatasource(treeControl, treeDatabase);

      // Act
      await source.loadMore(testcase.node as TreeNode, testcase.ParentKey, testcase.startIndex);

      // check

      expect(source.data.length).toEqual(testcase.expectedLenght);
    })
  }
});