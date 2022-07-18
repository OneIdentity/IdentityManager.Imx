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

import { ViewContainerRef, ComponentRef, ComponentFactoryResolver } from '@angular/core';

import { CdrEditorProvider } from './cdr-editor-provider.interface';
import { ColumnDependentReference } from './column-dependent-reference.interface';
import { CdrEditor } from './cdr-editor.interface';
import { EditFkComponent } from './edit-fk/edit-fk.component';
import { EditFkMultiComponent } from './edit-fk/edit-fk-multi.component';
import { ViewPropertyDefaultComponent } from './view-property-default/view-property-default.component';

export class FkCdrEditorProvider implements CdrEditorProvider {

  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

  public createEditor(parent: ViewContainerRef, cdref: ColumnDependentReference): ComponentRef<CdrEditor> {
    if (this.hasFkRelations(cdref)) {
      const isReadonly = cdref.isReadOnly() || !cdref.column.GetMetadata().CanEdit();
      if (isReadonly) {
        return this.createBound(ViewPropertyDefaultComponent, parent, cdref);
      } else {
        return cdref.column.GetMetadata().IsMultiValue() ?
          this.createBound(EditFkMultiComponent, parent, cdref) :
          this.createBound(EditFkComponent, parent, cdref);
      }
    }

    return null;
  }

  private createBound<T extends CdrEditor>(tCtor: new (...args: any[]) => T, parent: ViewContainerRef, cdref: ColumnDependentReference)
    : ComponentRef<CdrEditor> {
    const result = parent.createComponent(this.componentFactoryResolver.resolveComponentFactory(tCtor));
    result.instance.bind(cdref);
    return result;
  }

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
