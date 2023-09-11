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


import { IEntityColumn, ValueConstraint } from 'imx-qbm-dbts';
import { Subject } from 'rxjs';

/**
 * Defines a column dependent reference.
 */
export interface ColumnDependentReference {
    /**
     * The column of the entity.
     */
    column: IEntityColumn;

    /**
     * Custom display - if it is set it will be used instead of column.GetMetadata().GetDisplay()
     */
    display?: string;

    /**
     * Custom MinLength - is evaluated in addition to column.GetMetadata().GetMinLength()
     */
    minLength?: number;

    minlengthSubject?: Subject<number>

    /**
     * Custom valueConstraint - if it is set it will be used instead of column.GetMetadata().valueConstraint
     */
    valueConstraint?: ValueConstraint;

    /**
     * Optional hint
     */
    hint?: string;

    /**
     * Returns whether the column should be only displayed (true)
     * or also allow editing (false).
     */
    isReadOnly(): boolean;
}
