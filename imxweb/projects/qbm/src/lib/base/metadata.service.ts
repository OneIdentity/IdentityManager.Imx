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

import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { MetaTableData } from 'imx-api-qbm';
import { imx_SessionService } from '../session/imx-session.service';

@Injectable()
export class MetadataService {
  public readonly tables: { [id: string]: MetaTableData } = {};

  /**
   * @deprecated Use tables instead.
   */
  private tableMetadata: { [id: string]: MetaTableData } = {};

  constructor(
    private sessionService: imx_SessionService,
    private readonly translateService: TranslateService
  ) { }

  /**
   * Updates meta data for the tables of the provided table names that are not already present in the tables map
   * @param tableName The names of the tables to update
   */
  public async updateNonExisting(tableNames: string[]): Promise<void> {
    // Use a Set to obtain unique values
    const uniqueSet = Array.from(new Set(tableNames.filter(tableName => this.tables[tableName] == null)));
    return this.update(uniqueSet);
  }

  /**
   * Updates meta data for the tables of the provided table names
   * @param tableName The names of the tables to update
   */
  public async update(tableNames: string[]): Promise<void> {
    for (const tableName of tableNames) {
      this.tables[tableName] = await this.sessionService.Client.imx_metadata_table_get(tableName, { cultureName: this.translateService.currentLang });
    }
  }

  /**
   * @deprecated Use use the method update and the property tables instead. Will be removed.
   * @param table The name of the table to update and get metadata for
   */
  public async GetTableMetadata(table: string): Promise<MetaTableData> {
    if (this.tableMetadata[table] == null) {
      this.tableMetadata[
        table
      ] = await this.sessionService.Client.imx_metadata_table_get(table, { cultureName: this.translateService.currentLang });
    }

    return this.tableMetadata[table];
  }
}
