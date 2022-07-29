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
 * Copyright 2022 One Identity LLC.
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

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatTreeModule } from "@angular/material/tree";
import { configureTestSuite } from 'ng-bullet';
import { LoggerTestingModule } from "ngx-logger/testing";
import { BehaviorSubject, of } from "rxjs";
import { SimpleChange } from "@angular/core";
import { SelectionModel } from "@angular/cdk/collections";
import { FlatTreeControl } from "@angular/cdk/tree";

import { clearStylesFromDOM } from 'qbm';
import { CollectionLoadParameters, IEntity } from "imx-qbm-dbts";
import { SnackBarService } from "../../snackbar/snack-bar.service";
import { TreeDatabase } from "../tree-database";
import { TreeNodeResultParameter } from "../tree-node-result-parameter.interface";
import { CheckableTreeComponent } from "./checkable-tree.component";
import { TreeNode } from "../tree-node";
import { CreateIEntity, CreateIEntityColumn } from "../../testing/base-imx-api-mock.spec";
import { TreeDatasource } from "../tree-datasource";


const intializeDatabaseSpy = jasmine.createSpy('initialize').and.callFake(() => Promise.resolve([]));

class MockDataTreeService extends TreeDatabase {
  dataReloaded$ = new BehaviorSubject(undefined);
  constructor(private readonly entities: IEntity[]) {
    super();
  }

  async getData(showLoading: boolean, parameters: CollectionLoadParameters = {})
    : Promise<TreeNodeResultParameter> {
    return Promise.resolve({ entities: [], canLoadMore: false, totalCount: 0 });
  }

  initialize = intializeDatabaseSpy;
}

class MockTreeDataSource extends TreeDatasource {
  public connectspy = jasmine.createSpy('connect').and.callFake(() => of([]));
  public handleTreeControlspy = jasmine.createSpy('handleTreeControl');
  public loadMoreSpy = jasmine.createSpy('loadMore').and.callFake(() => Promise.resolve());

  private dataInternal: TreeNode[] = [];
  public get data(): TreeNode[] {
    return this.dataInternal;
  }

  constructor() {
    super(undefined, new MockDataTreeService([]))
  }

  init(value: TreeNode[]) {
    this.dataInternal = value;
  }

  connect = this.connectspy;
  handleTreeControl = this.handleTreeControlspy;
  loadMore = this.loadMoreSpy;

  public disconnect(): void { }
}

function buildFake(nodes: TreeNode[]): FlatTreeControl<TreeNode> {
  return {
    dataNodes: nodes,
    getDescendants: (parent: TreeNode) => nodes.filter(elem => elem.level > parent.level),
    expand:()=>{}
  } as unknown as FlatTreeControl<TreeNode>
}

describe('CheckableTreeComponent', () => {
  let component: CheckableTreeComponent;
  let fixture: ComponentFixture<CheckableTreeComponent>;
  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerTestingModule,
        MatTreeModule,
        MatCheckboxModule
      ],
      declarations: [CheckableTreeComponent],
      providers: [
        {
          provide: SnackBarService,
          useValue: {
            open: jasmine.createSpy('open')
          }
        }
      ]
    });
  });
  beforeEach(() => {
    fixture = TestBed.createComponent(CheckableTreeComponent);
    component = fixture.componentInstance;
    intializeDatabaseSpy.calls.reset();
  });


  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('initialize the datasource on change', async () => {

    await component.ngOnChanges({});

    expect(component.treeDataSource).toBeUndefined();
    expect(intializeDatabaseSpy).not.toHaveBeenCalled();

    component.database = new MockDataTreeService([]);
    await component.ngOnChanges({
      database: {
        currentValue: new MockDataTreeService([])
      } as SimpleChange
    });

    expect(intializeDatabaseSpy).toHaveBeenCalledTimes(1);
  });

  it('should emit the selected node', async () => {

    // Arrange
    const dummyColumn = CreateIEntityColumn('dummyColumn');
    const entity = CreateIEntity(() => { return dummyColumn });
    const dummyNode = new TreeNode(entity, 'uid-1');

    component.database = new MockDataTreeService([]);
    await component.ngOnChanges({
      database: {
        currentValue: new MockDataTreeService([])
      } as SimpleChange
    });

    spyOn(component.nodeSelected, 'emit');

    // Act
    component.selectNode(dummyNode);

    // Assert
    expect(component.nodeSelected.emit).toHaveBeenCalled();
  });

  it('should make a call to `initializeTreeData()` when the databaseReleaded$ subscription is updated', async () => {
    const initializeTreeDataSpy = spyOn<any>(component, 'initializeTreeData');
    component.database = new MockDataTreeService([]);
    // Setup subscription
    component.ngAfterViewInit();
    // Simulate the update
    component.database.dataReloaded$.next(true);
    // Assert
    expect(initializeTreeDataSpy).toHaveBeenCalled();
    // Cleanup subscription
    component.ngOnDestroy();
  });

  it('should reload', async () => {
    component.database = new MockDataTreeService([{ GetKeys: () => [''] } as IEntity]);
    component.treeDataSource = new MockTreeDataSource();
    await component.reload();
    expect(intializeDatabaseSpy).toHaveBeenCalled();
  });

  for (const testcase of [
    { selected: [], isMulti: false, element: { GetKeys: () => ['element1'], GetDisplay: () => '' } },
    { selected: [], isMulti: true, element: { GetKeys: () => ['element2'], GetDisplay: () => '' } },
  ]) {
    it(`handles selection for element ${testcase.element.GetKeys()[0]}`, async () => {
      component.selectedEntities = testcase.selected as IEntity[];
      component.withMultiSelect = testcase.isMulti;
      const eventArg = new TreeNode(testcase.element as IEntity, 'id1');
      const methodSpy = testcase.isMulti ? spyOn(component.checkedNodesChanged, 'emit') : spyOn(component.nodeSelected, 'emit');
      await (component.ngOnChanges({}));

      component.selectNode(eventArg);

      if (testcase.isMulti) {
        expect(methodSpy).toHaveBeenCalled();

        expect(component.selectedEntities.length).toEqual(1);

        component.selectNode(eventArg);

        expect(component.selectedEntities.length).toEqual(0);
      } else {
        expect(component.selectedNode).toEqual(eventArg);
        expect(methodSpy).toHaveBeenCalled();
      }
    });
  }

  for (const testcase of [
    { description: 'root nodes', node: 'loadMoreRootNode', expectedName: '', expectedStart: 1 },
    { description: 'childnodes of the first child', node: 'loadMoreRootChildNode', expectedName: 'childName1', expectedStart: 2 }
  ]) {
    it(`loads more ${testcase.description}`, async () => {
      const root = new TreeNode({ GetKeys: () => ['root'], GetDisplay: () => '' } as IEntity, 'rootId', 'rootName', 0, true);
      const child1 = new TreeNode({ GetKeys: () => ['child1'], GetDisplay: () => '' } as IEntity, 'childId1', 'childName1', 1, true);
      const child2 = new TreeNode({ GetKeys: () => ['child2'], GetDisplay: () => '' } as IEntity, 'childId2', 'childName2', 1, false);
      const childChild = new TreeNode({ GetKeys: () => ['childChild'], GetDisplay: () => '' } as IEntity, 'childChildId', 'childChildName', 2, false);
      const childChild2 = new TreeNode({ GetKeys: () => ['childChild2'], GetDisplay: () => '' } as IEntity, 'childChildId2', 'childChildName2', 2, false);
      const loadMoreRootNode = new TreeNode(undefined, 'loadMoreRootNode', 'loadMoreRootNode', 0, false, false, true);
      const loadMoreRootChildNode = new TreeNode(undefined, 'loadMoreRootChildNode', 'loadMoreRootChildNode', 2, false, false, true);

      const dataSource = new MockTreeDataSource();
      component.treeControl = buildFake([root, child1, childChild, loadMoreRootChildNode, child2, childChild2, loadMoreRootNode]);
      component.treeDataSource = dataSource;
      component.database = new MockDataTreeService([{ GetKeys: () => ['something'], GetDisplay: () => '' } as IEntity])

      const node = component.treeControl.dataNodes.find(elem => elem.identifier === testcase.node)

      await component.loadMore(node);
      expect(dataSource.loadMoreSpy).toHaveBeenCalledWith(node, testcase.expectedName, testcase.expectedStart);
    })
  }

  const specificTree = [
    new TreeNode({ GetKeys: () => ['child1'], GetDisplay: () => '' } as IEntity, 'childId1', 'child1', 1, true),
    new TreeNode({ GetKeys: () => ['childChild1'], GetDisplay: () => '' } as IEntity, 'childChildId1', 'childChild1', 2, false),
    new TreeNode({ GetKeys: () => ['childChild2'], GetDisplay: () => '' } as IEntity, 'childChildId2', 'childChild2', 2, false)
  ];

  for (const testcase of [
    { desciption: 'check whole tree, but nothing is selected', nodesForCheck: undefined, isMulti: false, selected: [] },
    { desciption: 'check whole tree, but nothing is checked', nodesForCheck: undefined, isMulti: true, selected: [] },
    { desciption: 'check whole tree, but a single entity is selected', nodesForCheck: undefined, isMulti: false, selected: [{ GetKeys: () => ['root'], GetDisplay: () => '' } as IEntity] },
    { desciption: 'check whole tree, but an entity is checked', nodesForCheck: undefined, isMulti: true, selected: [{ GetKeys: () => ['root'], GetDisplay: () => '' } as IEntity] },
    { desciption: 'check specific nodes, but nothing is selected', nodesForCheck: specificTree, isMulti: false, selected: [] },
    { desciption: 'check specific nodes, but nothing is checked', nodesForCheck: specificTree, isMulti: true, selected: [] },
    { desciption: 'check specific nodes, but a single entity is selected', nodesForCheck: specificTree, isMulti: false, selected: [{ GetKeys: () => ['child1'], GetDisplay: () => '' } as IEntity] },
    { desciption: 'check specific nodes, but an entity is checked', nodesForCheck: specificTree, isMulti: true, selected: [{ GetKeys: () => ['child1'], GetDisplay: () => '' } as IEntity] },
  ]) {
    it(`can update checked tree nodes (${testcase.desciption})`, () => {
      const root = new TreeNode({ GetKeys: () => ['root'], GetDisplay: () => '' } as IEntity, 'rootId', 'root', 0, true);
      const child1 = new TreeNode({ GetKeys: () => ['child1'], GetDisplay: () => '' } as IEntity, 'childId1', 'child1', 1, true);
      const child2 = new TreeNode({ GetKeys: () => ['child2'], GetDisplay: () => '' } as IEntity, 'childId2', 'child2', 1, false);
      const childChild = new TreeNode({ GetKeys: () => ['childChild1'], GetDisplay: () => '' } as IEntity, 'childChildId1', 'childChild1', 2, false);
      const childChild2 = new TreeNode({ GetKeys: () => ['childChild2'], GetDisplay: () => '' } as IEntity, 'childChildId2', 'childChild2', 2, false);
      const treeData = [root, child1, child2, childChild, childChild2];

      component.treeDataSource = new MockTreeDataSource();
      component.treeDataSource.init(treeData);
      component.treeControl = buildFake(treeData);
      component.withMultiSelect = testcase.isMulti;
      component.checklistSelection = new SelectionModel<TreeNode>(testcase.isMulti);
      component.selectedEntities = testcase.selected;

      component.updateCheckedTreeNodes(testcase.nodesForCheck);

      if (testcase.isMulti) {

      } else {
        if (testcase.selected.length === 0) {
          expect(component.selectedNode).toEqual(undefined);
        } else {
          expect(component.selectedNode.name).toEqual(testcase.selected[0].GetKeys()[0]);
        }

      }

    })
  }
});
