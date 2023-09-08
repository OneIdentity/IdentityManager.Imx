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

import { CollectionViewer, SelectionChange, SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Subject } from 'rxjs';
import * as TypeMoq from 'typemoq';

import { OpsupportSystemoverview } from 'imx-api-qbm';
import { CreateIReadValue } from 'qbm';
import { SystemTreeDatabase } from './system-tree-database';
import { SystemTreeDataSource } from './system-tree-datasource';
import { SystemTreeNode } from './system-tree-node';

describe('SystemTreeDataSource', () => {
  let dataSource: SystemTreeDataSource;
  let flatTreeMock: TypeMoq.IMock<FlatTreeControl<SystemTreeNode>>;
  let database: TypeMoq.IMock<SystemTreeDatabase>;

  beforeEach(() => {
    flatTreeMock = TypeMoq.Mock.ofType<FlatTreeControl<SystemTreeNode>>();
    database = TypeMoq.Mock.ofType<SystemTreeDatabase>();
    dataSource = new SystemTreeDataSource(flatTreeMock.object, database.object);
  });

  it('should be create with defaults', () => {
    expect(dataSource).toBeTruthy();
  });

  // TODO #227277 fix unittests after update on Angular V9
  xit('should set data correctly', () => {
    const data = dataSource.data;
    expect(data).toBeDefined();

    spyOn(dataSource, 'dataChange' as any);

    const node = TypeMoq.Mock.ofType<SystemTreeNode>();
    const nodes = new Array<SystemTreeNode>();
    nodes.push(node.object);
    dataSource.data = nodes;
  });

  it('should handle the connect', () => {
    const selModelMock = TypeMoq.Mock.ofType<SelectionModel<SystemTreeNode>>();
    flatTreeMock.setup(f => f.expansionModel).returns(() => selModelMock.object);

    const selChgMock = TypeMoq.Mock.ofType<Subject<SelectionChange<SystemTreeNode>>>();
    selModelMock.setup(s => s.changed).returns(() => selChgMock.object);

    const colViewerMock = TypeMoq.Mock.ofType<CollectionViewer>();
    dataSource.connect(colViewerMock.object);
  });

  it('should handle the treecontrol', () => {
    const node = TypeMoq.Mock.ofType<SystemTreeNode>();
    const nodes = new Array<SystemTreeNode>();
    nodes.push(node.object);

    const toggleNodeSpy = spyOn(dataSource, 'toggleNode');

    const emptyArray = new Array<SystemTreeNode>();

    const selChangeMock = TypeMoq.Mock.ofType<SelectionChange<SystemTreeNode>>();

    selChangeMock.setup(m => m.added).returns(() => nodes);
    selChangeMock.setup(m => m.removed).returns(() => nodes);
    dataSource.handleTreeControl(selChangeMock.object);

    expect(toggleNodeSpy).toHaveBeenCalled();

    toggleNodeSpy.calls.reset();

    selChangeMock.setup(m => m.added).returns(() => emptyArray);
    selChangeMock.setup(m => m.removed).returns(() => emptyArray);
    dataSource.handleTreeControl(selChangeMock.object);

    expect(toggleNodeSpy).not.toHaveBeenCalled();
  });

  // TODO #227277 fix unittests after update on Angular V9
  xit('should handle toggleNode', () => {
    const sysOverviewObjMock = TypeMoq.Mock.ofType<OpsupportSystemoverview>();
    sysOverviewObjMock.setup(d => d.Category).returns(() => CreateIReadValue('Cat'));
    sysOverviewObjMock.setup(d => d.Element).returns(() => CreateIReadValue('Elem'));
    sysOverviewObjMock.setup(d => d.Value).returns(() => CreateIReadValue('Val'));
    sysOverviewObjMock.setup(d => d.QualityOfValue).returns(() => CreateIReadValue(0.1));
    sysOverviewObjMock.setup(d => d.RecommendedValue).returns(() => CreateIReadValue('Recommmended'));
    sysOverviewObjMock.setup(d => d.UID_QBMVSystemOverview).returns(() => CreateIReadValue('14AA3338-8EEF-2ECE-9C85-D12E0E4CE3ED'));

    const children = new Array<OpsupportSystemoverview>();
    children.push(sysOverviewObjMock.object);

    database.setup(d => d.getChildren(TypeMoq.It.isAnyString())).returns(() => children);

    dataSource = new SystemTreeDataSource(flatTreeMock.object, database.object);

    const nodeMock = TypeMoq.Mock.ofType<SystemTreeNode>();
    const nodes = new Array<SystemTreeNode>();
    nodes.push(nodeMock.object);
    dataSource.data = nodes;

    const dataChangeSpy = spyOn(dataSource, 'dataChange' as any);

    spyOn(dataSource.data, 'indexOf').and.returnValue(1);

    dataSource.toggleNode(nodeMock.object, true);

    expect(dataChangeSpy).not.toHaveBeenCalled();
  });
});

describe('SystemTreeDataSource', () => {
  it('unsubscribes on disconnect', () => {
    const flatTreeControlStub = {
      expansionModel: {
        changed: new Subject<any>()
      }
    } as FlatTreeControl<SystemTreeNode>;
    const dataSource = new SystemTreeDataSource(flatTreeControlStub, TypeMoq.Mock.ofType<SystemTreeDatabase>().object);

    dataSource.connect({} as CollectionViewer);
    expect(flatTreeControlStub.expansionModel.changed.observers.length).toEqual(1);

    dataSource.disconnect();
    expect(flatTreeControlStub.expansionModel.changed.observers.length).toEqual(0);
  });
});
