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
import { IValueMetadata, LimitedValueData, ValType } from '@imx-modules/imx-qbm-dbts';
import { clearStylesFromDOM } from '../testing/clear-styles.spec';
import { CdrEditor } from './cdr-editor.interface';
import { ColumnDependentReference } from './column-dependent-reference.interface';
import { DefaultCdrEditorProvider } from './default-cdr-editor-provider';
import { EditBooleanComponent } from './edit-boolean/edit-boolean.component';
import { EditLimitedValueComponent } from './edit-limited-value/edit-limited-value.component';
import { EditMultiLimitedValueComponent } from './edit-multi-limited-value/edit-multi-limited-value.component';
import { EditMultiValueComponent } from './edit-multi-value/edit-multi-value.component';
import { EditMultilineComponent } from './edit-multiline/edit-multiline.component';
import { EditNumberComponent } from './edit-number/edit-number.component';
import { EditRiskIndexComponent } from './edit-risk-index/edit-risk-index.component';
import { ViewPropertyDefaultComponent } from './view-property-default/view-property-default.component';

describe('DefaultCdrEditorProvider', () => {
  beforeEach(() => {});

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

function testCreateEditor<T extends CdrEditor>(
  TCtor: new (...args: any[]) => T,
  type: ValType,
  multiLine: boolean = false,
  multiValue: boolean = false,
  range: boolean = false,
  limitedValues: string[] = [],
  schemaKey: string = '',
  isReadOnly: boolean = false,
) {
  const cdrMock = createCdr(multiLine, multiValue, range, type, limitedValues, schemaKey, isReadOnly);
  const childMock = createComponentMock<T>({} as T);
  const parentMock = { createComponent: () => childMock } as unknown as ViewContainerRef;
  const provider = new DefaultCdrEditorProvider();

  const editor = provider.createEditor(parentMock, cdrMock);
  expect(editor === childMock).toBeTruthy();
}

function createCdr(
  multiLine: boolean,
  multiValue: boolean,
  range: boolean,
  type: ValType,
  limitedValues?: string[],
  schemaKey?: string,
  isReadOnly?: boolean,
): ColumnDependentReference {
  const limited: LimitedValueData[] = limitedValues.map((elem) => ({ Value: elem }));

  const metaData: IValueMetadata = {
    IsMultiLine: () => multiLine,
    IsMultiValue: () => multiValue,
    IsRange: () => range,
    GetType: () => type,
    GetLimitedValues: () => limited as ReadonlyArray<LimitedValueData>,
    GetSchemaKey: () => schemaKey,
    CanEdit: () => !isReadOnly,
    GetBitMaskCaptions: () => [] as ReadonlyArray<string>,
  } as IValueMetadata;

  return { column: { GetMetadata: () => metaData }, isReadOnly: () => isReadOnly } as unknown as ColumnDependentReference;
}

export function createComponentMock<T extends CdrEditor>(instance: T): ComponentRef<T> {
  instance.bind = () => {};
  return { instance } as ComponentRef<T>;
}
