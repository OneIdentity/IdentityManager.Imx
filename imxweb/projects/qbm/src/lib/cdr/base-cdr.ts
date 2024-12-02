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

import { IEntityColumn } from '@imx-modules/imx-qbm-dbts';

import { Subject } from 'rxjs';
import { ColumnDependentReference } from './column-dependent-reference.interface';

/**
 * Generic implementation of a {@link ColumnDependentReference | column dependent reference}.
 * @examples
 * const value = new BaseCdr(columnToUse, optionalDisplay, renderedReadonlyOrNot); // Build a CDR with an optional display and a give readOnly state
 * const value = new BaseCdr(columnToUse, optionalDisplay);  // Build a CDR with an optional display
 * const value = new BaseCdr(columnToUse, undefined, renderedReadonlyOrNot ); // Build a CDR with a give readOnly state
 */
export class BaseCdr implements ColumnDependentReference {
  /**
   * A small hint, that is displayed on a hint icon
   */
  public hint: string;

  /**
   * A minimal size of the content, that differs from the minLength of the column.
   */
  public minLength?: number;

  /**
   * A subject to listen for changes of the minLength
   */
  public minlengthSubject = new Subject<number>();

  constructor(
    public readonly column: IEntityColumn,
    public readonly display?: string,
  ) {}

  /**
   * Checks, whether a CDR should be rendered as read-only
   * @returns True, if the CDR needs to be show as 'read-only', otherwise false.
   */
  public isReadOnly(): boolean {
    return this.column == null || !this.column.GetMetadata().CanEdit();
  }

  /**
   * Can be used to update the minimal size, that controls the mandatory state of the CDR.
   * It calls the minLengthSubject, too.
   * */
  public updateMinLength(value: number): void {
    this.minLength = value;
    this.minlengthSubject.next(value);
  }
}
