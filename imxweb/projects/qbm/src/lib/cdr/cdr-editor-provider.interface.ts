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

import { ColumnDependentReference } from './column-dependent-reference.interface';
import { CdrEditor } from './cdr-editor.interface';
import { ViewContainerRef, ComponentRef } from '@angular/core';

/**
 * Defines a class that can provide an UI component to display and/or edit a column dependent reference,
 * namely a cdr "editor".
 */
export interface CdrEditorProvider {

    /**
     * Creates an editor for a given column dependent reference.
     *
     * If the column dependent reference does not suite any of the editors
     * the provider can provide, it should return null.
     *
     * @param cdref The column dependent reference.
     */
    createEditor(parent: ViewContainerRef, cdref: ColumnDependentReference): ComponentRef<CdrEditor>;
}
