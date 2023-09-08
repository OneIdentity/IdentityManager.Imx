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

import { IEntityColumn } from 'imx-qbm-dbts';

import { ColumnDependentReference } from './column-dependent-reference.interface';
import { Subject } from 'rxjs';

/**
 * Generic implementation of a ColumnDependentReference.
 */
export class BaseCdr implements ColumnDependentReference {
  public hint: string;
  public minLength?: number;
  public minlengthSubject = new Subject<number>();

  constructor(public readonly column: IEntityColumn, public readonly display?: string, public readonly isReadOnlyColumn?: boolean) {}

  public isReadOnly(): boolean {
    if (this.isReadOnlyColumn !== undefined) {
      return this.column == null || this.isReadOnlyColumn || !this.column.GetMetadata().CanEdit();
    } else {
      return this.column == null || !this.column.GetMetadata().CanEdit();
    }
  }

  public updateMinLength(value: number): void {
    this.minLength = value;
    this.minlengthSubject.next(value);
  }
}
