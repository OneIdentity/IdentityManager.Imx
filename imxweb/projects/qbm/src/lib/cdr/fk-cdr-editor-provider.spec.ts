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

import { ComponentRef, ViewContainerRef } from '@angular/core';

import { IForeignKeyInfo } from '@imx-modules/imx-qbm-dbts';
import { clearStylesFromDOM } from '../testing/clear-styles.spec';
import { CdrEditor } from './cdr-editor.interface';
import { ColumnDependentReference } from './column-dependent-reference.interface';
import { createComponentMock } from './default-cdr-editor-provider.spec';
import { EditFkComponent } from './edit-fk/edit-fk.component';
import { FkCdrEditorProvider } from './fk-cdr-editor-provider';
import { ViewPropertyDefaultComponent } from './view-property-default/view-property-default.component';

describe('FkCdrEditorProvider', () => {
  beforeEach(() => {});

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create an instance', () => {
    expect(new FkCdrEditorProvider()).toBeDefined();
  });

  it('should return null, if non fk column', () => {
    const editor = testCreateEditor(null, null, true);
    expect(editor).toBeNull();
  });

  it('should create ViewPropertyDefaultComponent for a Fk property that is set as readonly', () => {
    testCreateEditor(ViewPropertyDefaultComponent, [createMockForeignKey('testtable', 'testcolumn')], false, true);
  });

  it('should create EditDefaultComponent for Fk Element', () => {
    testCreateEditor(EditFkComponent, [createMockForeignKey('testtable', 'testcolumn')]);
  });

  it('should work with empty fk', () => {
    expect(() => {
      testCreateEditor(EditFkComponent, [createMockForeignKey('', '')], true);
    }).not.toThrowError();
  });
});

function testCreateEditor<T extends CdrEditor>(
  TCtor: new (...args: any[]) => T,
  fkRelation?: IForeignKeyInfo[],
  editorShouldBeNull: boolean = false,
  isReadOnly: boolean = false,
): ComponentRef<CdrEditor> {
  const cdrMock = createCdr(fkRelation, isReadOnly);
  const childMock = createComponentMock<T>({} as T);
  const parentMock = { createComponent: () => childMock } as unknown as ViewContainerRef;
  // Act
  const provider = new FkCdrEditorProvider();
  const editor = provider.createEditor(parentMock, cdrMock);

  // Assert
  if (editorShouldBeNull) {
    expect(editor).toBeNull();
  } else {
    expect(editor === childMock).toBeTruthy();
  }

  return editor;
}

function createMockForeignKey(tablename: string, column: string): IForeignKeyInfo {
  const mockKey: IForeignKeyInfo = { TableName: tablename, ColumnName: column } as unknown as IForeignKeyInfo;
  return mockKey;
}

function createCdr(fkRelation?: IForeignKeyInfo[], isReadOnly?: boolean): ColumnDependentReference {
  const metaData = {
    GetFkRelations: () => fkRelation,
    CanEdit: () => !isReadOnly,
    IsMultiValue: () => false,
  };
  return { column: { GetMetadata: () => metaData }, isReadOnly: () => isReadOnly } as unknown as ColumnDependentReference;
}
