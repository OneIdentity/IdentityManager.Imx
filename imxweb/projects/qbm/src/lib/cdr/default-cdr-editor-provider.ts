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

import { ComponentRef, Type, ViewContainerRef } from '@angular/core';
import { IValueMetadata, ValType } from '@imx-modules/imx-qbm-dbts';
import { CdrEditorProvider } from './cdr-editor-provider.interface';
import { CdrEditor } from './cdr-editor.interface';
import { ColumnDependentReference } from './column-dependent-reference.interface';
import { DateRangeComponent } from './date-range/date-range.component';
import { EditBooleanComponent } from './edit-boolean/edit-boolean.component';
import { EditDateComponent } from './edit-date/edit-date.component';
import { EditImageComponent } from './edit-image/edit-image.component';
import { EditLimitedValueComponent } from './edit-limited-value/edit-limited-value.component';
import { EditMultiLimitedValueComponent } from './edit-multi-limited-value/edit-multi-limited-value.component';
import { EditMultiValueComponent } from './edit-multi-value/edit-multi-value.component';
import { EditMultilineComponent } from './edit-multiline/edit-multiline.component';
import { EditNumberComponent } from './edit-number/edit-number.component';
import { EditBitmaskComponent } from './edit-bitmask/edit-bitmask.component';
import { EditRiskIndexComponent } from './edit-risk-index/edit-risk-index.component';
import { EditUrlComponent } from './edit-url/edit-url.component';

/**
 * A default provider for creating {@link CdrEditor | CDR editors}.
 * It creates an editor for basic types such as string, decimal, double etc.
 * as well as some more complex types like date, multi value or a risk index.
 *
 * Depending on the type, a different {@link CdrEditor | CDR editor} is used.
 * (e.g. bool typed column => {@link EditBooleanComponent})
 */
export class DefaultCdrEditorProvider implements CdrEditorProvider {
  constructor() {}

  /**
   * Creates an editor, depending on the given CDR and binds the column to the newly created component.
   * The actual instance of the editor is determined by the data type of the column and some additional information.
   * (e.g. bool typed column => {@link EditBooleanComponent})
   * (e.g. string typed column with IsMultiLIne => {@link EditMultilineComponent})
   * @param parent The view container used for rendering the editor into.
   * @param cdref A column dependent reference that contains the data for the editor.
   * @returns An instance of {@link CdrEditor}, that can be used or editing data.
   */
  public createEditor(parent: ViewContainerRef, cdref: ColumnDependentReference): ComponentRef<CdrEditor> | null {
    const meta = cdref.column.GetMetadata();
    const multiLine = meta.IsMultiLine();
    const multiValue = meta.IsMultiValue();
    const range = meta.IsRange();
    const limitedValues = this.isLimitedValues(meta);
    const schemaKey = meta.GetSchemaKey();
    const isRiskIndexColumn =
      ['RiskIndex', 'RiskLevel'].includes(schemaKey.substring(schemaKey.lastIndexOf('.') + 1)) || schemaKey == 'QERRiskIndex.Weight';
    const type = meta.GetType();

    if (type === ValType.Binary) {
      return this.createBound(EditImageComponent, parent, cdref);
    }

    if (type === ValType.Int && meta.GetBitMaskCaptions()?.length > 0) {
      return this.createBound(EditBitmaskComponent, parent, cdref);
    }

    if (!multiLine && !multiValue && !range && !limitedValues && !isRiskIndexColumn) {
      switch (type) {
        case ValType.Bool:
          return this.createBound(EditBooleanComponent, parent, cdref);

        case ValType.Byte:
        case ValType.Decimal:
        case ValType.Double:
        case ValType.Int:
        case ValType.Long:
        case ValType.Short:
          return this.createBound(EditNumberComponent, parent, cdref);

        case ValType.Date:
          return this.createBound(EditDateComponent, parent, cdref);
      }
    } else if (limitedValues) {
      return multiValue
        ? this.createBound(EditMultiLimitedValueComponent, parent, cdref)
        : this.createBound(EditLimitedValueComponent, parent, cdref);
    } else if (multiValue) {
      return this.createBound(EditMultiValueComponent, parent, cdref);
    } else if (multiLine) {
      return this.createBound(EditMultilineComponent, parent, cdref);
    } else if (isRiskIndexColumn) {
      return this.createBound(EditRiskIndexComponent, parent, cdref);
    }

    if (range && type === ValType.Date) {
      return this.createBound(DateRangeComponent, parent, cdref);
    }

    if (meta.isUrl) {
      return this.createBound(EditUrlComponent, parent, cdref);
    }

    return null;
  }

  /**
   * @ignore only used internally.
   * Creates the component and binds its value.
   */
  private createBound<T extends CdrEditor>(
    editor: Type<T>,
    parent: ViewContainerRef,
    cdref: ColumnDependentReference,
  ): ComponentRef<CdrEditor> {
    const result = parent.createComponent(editor);
    result.instance.bind(cdref);
    return result;
  }

  /**
   * @ignore only used internally
   * Checks, if there are limited values defined for the column.
   * @returns True, if there are limited values available, otherwise false.
   */
  private isLimitedValues(meta: IValueMetadata): boolean {
    const limitedValues = meta.GetLimitedValues();

    return limitedValues != null && limitedValues.length > 0;
  }
}
