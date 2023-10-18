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

import { ViewContainerRef, ComponentRef } from '@angular/core';
import * as TypeMoq from 'typemoq';

import { DefaultCdrEditorProvider } from './default-cdr-editor-provider';
import { ColumnDependentReference } from './column-dependent-reference.interface';
import { IValueMetadata, ValType, LimitedValueData, IEntityColumn } from 'imx-qbm-dbts';
import { EditBooleanComponent } from './edit-boolean/edit-boolean.component';
import { CdrEditor } from './cdr-editor.interface';
import { EditNumberComponent } from './edit-number/edit-number.component';
import { EditLimitedValueComponent } from './edit-limited-value/edit-limited-value.component';
import { EditMultiLimitedValueComponent } from './edit-multi-limited-value/edit-multi-limited-value.component';
import { EditMultiValueComponent } from './edit-multi-value/edit-multi-value.component';
import { EditMultilineComponent } from './edit-multiline/edit-multiline.component';
import { EditRiskIndexComponent } from './edit-risk-index/edit-risk-index.component';
import { ViewPropertyDefaultComponent } from './view-property-default/view-property-default.component';
import { clearStylesFromDOM } from '../testing/clear-styles.spec';

describe('DefaultCdrEditorProvider', () => {
  beforeEach(() => {
    
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create an instance', () => {
    expect(new DefaultCdrEditorProvider()).toBeDefined();
  });

  it('should create EditBooleanComponent for simple bool cdr', () => {
    testCreateEditor(EditBooleanComponent, ValType.Bool);
  });

  it('should create EditNumberComponent for simple byte cdr', () => {
    testCreateEditor(EditNumberComponent, ValType.Byte);
  });

  it('should create EditNumberComponent for simple decimal cdr', () => {
    testCreateEditor(EditNumberComponent, ValType.Decimal);
  });

  it('should create EditNumberComponent for simple double cdr', () => {
    testCreateEditor(EditNumberComponent, ValType.Double);
  });

  it('should create EditNumberComponent for simple int cdr', () => {
    testCreateEditor(EditNumberComponent, ValType.Int);
  });

  it('should create EditNumberComponent for simple long cdr', () => {
    testCreateEditor(EditNumberComponent, ValType.Long);
  });

  it('should create EditNumberComponent for simple short cdr', () => {
    testCreateEditor(EditNumberComponent, ValType.Short);
  });

  it('should create EditMultilineComponent for multiline cdr', () => {
    testCreateEditor(EditMultilineComponent, ValType.Text, true);
  });

  it('should create EditMultiValueComponent for multivalue cdr', () => {
    testCreateEditor(EditMultiValueComponent, ValType.Text, false, true);
  });

  it('should create EditMultiLimitedValueComponent for multivalue text limitedvalues cdr', () => {
    testCreateEditor(EditMultiLimitedValueComponent, ValType.Text, false, true, false, ['foo', 'bar']);
  });

  it('should create EditLimitedValueComponent for simple text limitedvalues cdr', () => {
    testCreateEditor(EditLimitedValueComponent, ValType.Text, false, false, false, ['foo', 'bar']);
  });

  it('should create EditRiskIndexComponent for RiskIndex cdr', () => {
    testCreateEditor(EditRiskIndexComponent, ValType.Double, false, false, false, [], 'AdsGroup.RiskIndex');
  });

  // Readonly property tests...

  it('should create ViewPropertyDefaultComponent for readonly simple bool cdr', () => {
    testCreateEditor(ViewPropertyDefaultComponent, ValType.Bool, false, false, false, [], '', true);
  });

  it('should create ViewPropertyDefaultComponent for readonly simple decimal cdr', () => {
    testCreateEditor(ViewPropertyDefaultComponent, ValType.Decimal, false, false, false, [], '', true);
  });

  it('should create ViewPropertyDefaultComponent for readonly simple double cdr', () => {
    testCreateEditor(ViewPropertyDefaultComponent, ValType.Double, false, false, false, [], '', true);
  });

  it('should create ViewPropertyDefaultComponent for readonly simple int cdr', () => {
    testCreateEditor(ViewPropertyDefaultComponent, ValType.Int, false, false, false, [], '', true);
  });

  it('should create ViewPropertyDefaultComponent for readonly simple long cdr', () => {
    testCreateEditor(ViewPropertyDefaultComponent, ValType.Long, false, false, false, [], '', true);
  });

  it('should create ViewPropertyDefaultComponent for readonly simple short cdr', () => {
    testCreateEditor(ViewPropertyDefaultComponent, ValType.Short, false, false, false, [], '', true);
  });

  it('should create ViewPropertyDefaultComponent for readonly multiline cdr', () => {
    testCreateEditor(ViewPropertyDefaultComponent, ValType.Text, true, false, false, [], '', true);
  });

  it('should create ViewPropertyDefaultComponent for readonly multivalue cdr', () => {
    testCreateEditor(ViewPropertyDefaultComponent, ValType.Text, false, true, false, [], '', true);
  });

  it('should create ViewPropertyDefaultComponent for readonly multivalue text limitedvalues cdr', () => {
    testCreateEditor(ViewPropertyDefaultComponent, ValType.Text, false, true, false, ['foo', 'bar'], '', true);
  });

  it('should create ViewPropertyDefaultComponent for readonly simple text limitedvalues cdr', () => {
    testCreateEditor(ViewPropertyDefaultComponent, ValType.Text, false, false, false, ['foo', 'bar'], '', true);
  });

  it('should create ViewPropertyDefaultComponent for readonly RiskIndex cdr', () => {
    testCreateEditor(ViewPropertyDefaultComponent, ValType.Double, false, false, false, [], '', true);
  });

});

function testCreateEditor<T extends CdrEditor>(TCtor: new (...args: any[]) => T, type: ValType,
                                               multiLine: boolean = false, multiValue: boolean = false, range: boolean = false,
                                               limitedValues: string[] = [], schemaKey: string = '', isReadOnly: boolean = false) {
      // Arrange
      const cdrMock = createCdr(multiLine, multiValue, range, type, limitedValues, schemaKey, isReadOnly);
      const editorMock = TypeMoq.Mock.ofType<T>();
      const parentMock = TypeMoq.Mock.ofType<ViewContainerRef>();
      const childMock = createComponentMock<T>(editorMock.object);

      parentMock.setup( p => p.createComponent(TypeMoq.It.isAny(), TypeMoq.It.isAny())).returns(() => childMock.object);

      // Act
      const provider = new DefaultCdrEditorProvider();
      const editor = provider.createEditor(parentMock.object, cdrMock.object);

      // Assert
      expect(editor === childMock.object).toBeTruthy();
      editorMock.verify(e => e.bind(cdrMock.object), TypeMoq.Times.once());
      editorMock.verify(e => e.bind(TypeMoq.It.isAny()), TypeMoq.Times.once());
}

export function createComponentMock<T extends CdrEditor>(instance: T): TypeMoq.IMock<ComponentRef<T>> {
  const mock = TypeMoq.Mock.ofType<ComponentRef<T>>();
  mock.setup(m => m.instance).returns(() => instance);
  return mock;
}

function createCdr(multiLine: boolean, multiValue: boolean, range: boolean,
  type: ValType, limitedValues?: string[], schemaKey?: string, isReadOnly?: boolean)
: TypeMoq.IMock<ColumnDependentReference> {

  const metaMock = TypeMoq.Mock.ofType<IValueMetadata>();
  metaMock.setup(m => m.IsMultiLine()).returns(() => multiLine);
  metaMock.setup(m => m.IsMultiValue()).returns(() => multiValue);
  metaMock.setup(m => m.IsRange()).returns(() => range);
  metaMock.setup(m => m.GetType()).returns(() => type);

  const lvArray: LimitedValueData[] = [];
  if (limitedValues != null) {
    for (const lv of limitedValues) {
      const lvMock = TypeMoq.Mock.ofType<LimitedValueData>();
      lvMock.setup(m => m.Value).returns(() => lv);
      lvArray.push(lvMock.object);
    }
  }

  metaMock.setup(m => m.GetLimitedValues()).returns(() => lvArray);
  metaMock.setup(m => m.GetSchemaKey()).returns(() => schemaKey)
  metaMock.setup(m => m.CanEdit()).returns(() => !isReadOnly)

  const cdrMock = TypeMoq.Mock.ofType<ColumnDependentReference>();
  cdrMock.setup(m => m.column).returns(() => ({ GetMetadata: () => metaMock.object } as IEntityColumn));
  cdrMock.setup(m => m.isReadOnly()).returns(() => isReadOnly);

  return cdrMock;
}
