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

import { CollectionViewer, SelectionChange, SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Subject } from 'rxjs';

import { SystemTreeDatabase } from './system-tree-database';
import { SystemTreeDataSource } from './system-tree-datasource';
import { SystemTreeNode } from './system-tree-node';
describe('SystemTreeDataSource', () => {
  let dataSource: SystemTreeDataSource;
  let flatTreeMock: FlatTreeControl<SystemTreeNode>;
  let database: SystemTreeDatabase;

  beforeEach(() => {
    flatTreeMock = {} as FlatTreeControl<SystemTreeNode>;
    database = {} as SystemTreeDatabase;
    dataSource = new SystemTreeDataSource(flatTreeMock, database);
  });

  it('should be create with defaults', () => {
    expect(dataSource).toBeTruthy();
  });

  it('should handle the connect', () => {
    const selChgMock = new Subject<SelectionChange<SystemTreeNode>>();
    const selModelMock = { changed: selChgMock } as unknown as SelectionModel<SystemTreeNode>;
    flatTreeMock.expansionModel = selModelMock;

    const colViewerMock = {} as CollectionViewer;
    dataSource.connect(colViewerMock);
  });

  it('should handle the treecontrol', () => {
    const node = {} as SystemTreeNode;
    const nodes = new Array<SystemTreeNode>();
    nodes.push(node);

    const toggleNodeSpy = spyOn(dataSource, 'toggleNode');

    const emptyArray = new Array<SystemTreeNode>();

    let selChangeMock = { added: nodes, removed: nodes } as SelectionChange<SystemTreeNode>;

    dataSource.handleTreeControl(selChangeMock);

    expect(toggleNodeSpy).toHaveBeenCalled();

    toggleNodeSpy.calls.reset();

    selChangeMock = { added: emptyArray, removed: emptyArray } as SelectionChange<SystemTreeNode>;
    dataSource.handleTreeControl(selChangeMock);

    expect(toggleNodeSpy).not.toHaveBeenCalled();
  });
});

describe('SystemTreeDataSource', () => {
  it('unsubscribes on disconnect', () => {
    const flatTreeControlStub = {
      expansionModel: {
        changed: new Subject<any>(),
      },
    } as FlatTreeControl<SystemTreeNode>;
    const dataSource = new SystemTreeDataSource(flatTreeControlStub, {} as SystemTreeDatabase);

    dataSource.connect({} as CollectionViewer);
    expect(flatTreeControlStub.expansionModel.changed.observers.length).toEqual(1);

    dataSource.disconnect();
    expect(flatTreeControlStub.expansionModel.changed.observers.length).toEqual(0);
  });
});
