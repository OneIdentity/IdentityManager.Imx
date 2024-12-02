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

import { Injectable } from '@angular/core';
import { IEntity, IEntityColumn } from '@imx-modules/imx-qbm-dbts';
import { BaseCdr } from './base-cdr';
import { BaseReadonlyCdr } from './base-readonly-cdr';
import { ColumnDependentReference } from './column-dependent-reference.interface';

@Injectable({
  providedIn: 'root',
})
export class CdrFactoryService {
  /**
   * Builds an array of column dependent references, depending on the columns provided.
   * If the column does not exists, it is filtered out via the Boolean constructor.
   * @param entity The complete entity that provides the columns.
   * @param columnNames The list of columns, a CDR is needed for.
   * @param readOnly If true, readonly CDR will be build otherwise normal base CDR.
   * @returns A list of column dependent references.
   */
  public buildCdrFromColumnList(entity: IEntity | undefined, columnNames: string[], readOnly: boolean = false): ColumnDependentReference[] {
    return columnNames.map((column) => this.buildCdr(entity, column, readOnly)).filter(Boolean) as ColumnDependentReference[];
  }

  /**
   * Builds an array of column dependent references, depending on the columns provided.
   * If the column does not exists, it is filtered out via the Boolean constructor.
   * You are able to add a list of column names, that should be readonly
   * @param entity The complete entity that provides the columns.
   * @param columnNames The list of columns, a CDR is needed for.
   * @param readOnlyColumns A list of column names, that needed readonly CDR.
   * @returns A list of column dependent references.
   */
  public buildCdrFromColumnListAdvanced(
    entity: IEntity,
    columnNames: string[],
    readOnlyColumns: string[] = [],
  ): ColumnDependentReference[] {
    return columnNames
      .map((column) => this.buildCdr(entity, column, readOnlyColumns.includes(column)))
      .filter(Boolean) as ColumnDependentReference[];
  }

  /**
   * Builds a single CDR for a specific column of the entity provided
   * @param entity The complete entity that provides the columns.
   * @param columnName The name of the column, that should be used by the CDR.
   * @param readOnly If true, a read-only CDR will be build otherwise a normal base CDR.
   * @returns The column dependent reference or null, if the column is not defined in the entity.
   */
  public buildCdr(
    entity: IEntity | undefined,
    columnName: string,
    readOnly: boolean = false,
    columnDisplay?: string,
  ): ColumnDependentReference | undefined {
    const column = CdrFactoryService.tryGetColumn(entity, columnName);

    return column == null ? undefined : readOnly ? new BaseReadonlyCdr(column, columnDisplay) : new BaseCdr(column, columnDisplay);
  }

  /**
   * Trys to get a specific entity column by a given column name.
   * @param entity The complete entity, the column is part of.
   * @param columnName The name of the column, that should be provided.
   * @returns Null, if the entity doesn't have a column with the given name otherwise the column is returned.
   */
  public static tryGetColumn(entity: IEntity | undefined, columnName: string): IEntityColumn | undefined {
    try {
      return entity?.GetColumn(columnName);
    } catch {
      return undefined;
    }
  }
}
