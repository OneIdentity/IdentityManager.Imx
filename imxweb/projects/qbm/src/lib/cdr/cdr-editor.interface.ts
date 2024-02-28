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
import { EventEmitter } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { Subject } from 'rxjs';

import { ColumnDependentReference } from './column-dependent-reference.interface';

/**
 * Interface for the argument, that it emitted in the CDR editor
 */
export interface ValueHasChangedEventArg {
    /**
     * The new value of the editor
     */
    value: any;

    /**
     * A flag to show whether the emitting of a follow up event should be forced
     * (evaluated by  {@link CdrEditorComponent|CdrEditorComponent})
     */
    forceEmit?: boolean;
}

/**
 * Interface for an editor of a column dependent reference.
 */
export interface CdrEditor {
    /**
     * The abstract control associated with the editor.
     */
    control: AbstractControl;

    /**
     * An event, that is emmited, if the value of the cdr has changed.
     */
    valueHasChanged?: EventEmitter<ValueHasChangedEventArg>;

    /**
     * An event, that is emmited, if the value of the cdr is pending.
     */
    pendingChanged?: EventEmitter<boolean>;

    /**
     * Binds a column dependent reference to the editor.
     *
     * @param cdref The column dependent reference.
     */
    bind(cdref: ColumnDependentReference): void;

    /**
     * A subject, that can be called, if the control needs to be updated.
     */
    updateRequested?: Subject<void>;

}
