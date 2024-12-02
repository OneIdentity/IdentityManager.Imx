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

import { ComponentFactoryResolver, ComponentRef, ViewContainerRef } from '@angular/core';
import { CdrEditorProvider } from './cdr-editor-provider.interface';
import { CdrEditor } from './cdr-editor.interface';
import { ColumnDependentReference } from './column-dependent-reference.interface';

/**
 * A base implementation of the interface {@link CdrEditorProvider}.
 * It can create an editor, according to a given {@link ColumnDependentReference | column dependent reference}.
 * To extend this class you only need to implement the 'accept' method
 */
export abstract class BaseCdrEditorProvider<T extends CdrEditor> implements CdrEditorProvider {
  protected abstract tCtor: new (...args: any[]) => T;
  constructor(private componentFactoryResolver: ComponentFactoryResolver) {}

  /**
   * Creates an editor, depending on the given CDR and renders it to the UI
   * @param parent The view container used for rendering the editor into.
   * @param cdref  A column dependent reference that contains the data for the editor.
   * @returns An instance of {@link CdrEditor}, that can be used for editing data.
   */
  public createEditor(parent: ViewContainerRef, cdref: ColumnDependentReference): ComponentRef<CdrEditor> | null {
    if (!this.accept(cdref)) {
      return null;
    }

    const view = parent.createComponent(this.componentFactoryResolver.resolveComponentFactory(this.tCtor));
    this.configure(view.instance, cdref);

    return view;
  }

  /**
   * A method, that is used to check, whether a CDR is suitable for this provider or not.
   * @param cdref A column dependent reference that contains the data for the editor.
   * @returns True, if the CDR fits the criteria of the provider, otherwise false.
   */
  protected abstract accept(cdref: ColumnDependentReference): boolean;

  /**
   * Binds an editor to a CDR.
   * @param editor The editor, that is needed for the process.
   * @param cdref The CDR, that handles the data.
   */
  protected configure(editor: T, cdref: ColumnDependentReference): void {
    editor.bind(cdref);
  }
}
