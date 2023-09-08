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

import { CdrEditor } from './cdr-editor.interface';
import { CdrEditorProvider } from './cdr-editor-provider.interface';
import { ViewContainerRef, ComponentRef, ComponentFactoryResolver } from '@angular/core';
import { ColumnDependentReference } from './column-dependent-reference.interface';

export abstract class BaseCdrEditorProvider<T extends CdrEditor> implements CdrEditorProvider {

    protected abstract tCtor: new (...args: any[]) => T;
    constructor(private componentFactoryResolver: ComponentFactoryResolver) {}

    public createEditor(parent: ViewContainerRef, cdref: ColumnDependentReference): ComponentRef<CdrEditor> {
        if (!this.accept(cdref)) {
            return null;
        }

        const view = parent.createComponent(this.componentFactoryResolver.resolveComponentFactory(this.tCtor));
        this.configure(view.instance, cdref);

        return view;
    }

    protected abstract accept(cdref: ColumnDependentReference): boolean;

    protected configure(editor: T, cdref: ColumnDependentReference): void {
        editor.bind(cdref);
    }
}
