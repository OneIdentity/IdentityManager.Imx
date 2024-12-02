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

import { CdrEditorProvider } from './cdr-editor-provider.interface';
import { CdrEditor } from './cdr-editor.interface';
import { ColumnDependentReference } from './column-dependent-reference.interface';
import { EditFkMultiComponent } from './edit-fk/edit-fk-multi.component';
import { EditFkComponent } from './edit-fk/edit-fk.component';

/**
 * A special provider for foreign key columns.
 * The provider determines, if the column has foreign key information attached.
 * If that's the case, it creates an CdrEditor for a single or a multi foreign key.
 * If no such information is given, it returns null
 *  */
export class FkCdrEditorProvider implements CdrEditorProvider {
  constructor() {}

  /**
   * Creates a CDR editor for single and multi foreign key columns and binds it to the column
   * @param parent The view container used for rendering the editor into.
   * @param cdref  A column dependent reference that contains the data for the editor.
   * @returns An instance of {@link CdrEditor}, that can be used or editing data, or null, if no foreign key information is given.
   */
  public createEditor(parent: ViewContainerRef, cdref: ColumnDependentReference): ComponentRef<CdrEditor> | null {
    if (this.hasFkRelations(cdref)) {
      return cdref.column.GetMetadata().IsMultiValue()
        ? this.createBound(EditFkMultiComponent, parent, cdref)
        : this.createBound(EditFkComponent, parent, cdref);
    }

    return null;
  }

  /**
   * @ignore only used internally.
   * Creates the component and binds its value.
   */
  private createBound<T extends CdrEditor>(
    type: Type<T>,
    parent: ViewContainerRef,
    cdref: ColumnDependentReference,
  ): ComponentRef<CdrEditor> {
    const result = parent.createComponent(type);
    result.instance.bind(cdref);
    return result;
  }

  /**
   * Determines, if there are fk relations present or not.
   * @param cdref The column dependent reference, that needs to be checked
   * @returns
   */
  private hasFkRelations(cdref: ColumnDependentReference): boolean {
    const fkRelations = cdref.column.GetMetadata().GetFkRelations();
    if (fkRelations == null) {
      return false;
    }

    for (const fkRel of fkRelations) {
      if (fkRel.TableName?.length > 0 && fkRel.ColumnName?.length > 0) {
        return true;
      }
    }

    return false;
  }
}
