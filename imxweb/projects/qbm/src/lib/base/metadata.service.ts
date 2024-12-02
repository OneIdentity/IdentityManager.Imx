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

import { Injectable, OnDestroy } from '@angular/core';
import { MetaTableData } from '@imx-modules/imx-qbm-dbts';

/**
 * Abstract implementation for getting portal specific metadata.
 */
@Injectable({
  providedIn: 'root',
})
export abstract class MetadataService implements OnDestroy {
  public readonly tables: { [id: string]: MetaTableData | undefined } = {};
  protected abortController: AbortController;

  /**
   * @deprecated use tables instead
   */
  private tableMetadata: { [id: string]: MetaTableData | undefined } = {};

  constructor() {
    this.abortController = new AbortController();
  }

  ngOnDestroy(): void {
    this.abortCall();
  }

  /**
   * Fetches table metadata. Applications will provide authentication / methods to use.
   * @param tableName The name of the table to fetch data for
   * @param options Additional api options
   */
  protected abstract getTable(tableName: string, options?: unknown): Promise<MetaTableData | undefined>;

  /**
   * Handles aborting any current requests managed by this service.
   */
  public abortCall() {
    this.abortController.abort();
    this.abortController = new AbortController();
  }

  /**
   * Fetches and updates metadata for the tables of the provided table names that are not already present in the tables map
   * @param tableNames The names of the tables to update
   * @param options Additional api options
   */
  public async updateNonExisting(tableNames: string[], options?: unknown): Promise<void> {
    // Use a Set to obtain unique values
    const uniqueSet = Array.from(new Set(tableNames.filter((tableName) => this.tables[tableName] == null)));
    return this.update(uniqueSet, options);
  }

  /**
   * Fetches and updates metadata for the tables of the provided table names
   * @param tableNames The names of the tables to update
   * @param options Additional api options
   */
  public async update(tableNames: string[], options?: unknown): Promise<void> {
    for (const tableName of tableNames) {
      const metaTableData = await this.getTable(tableName, options);
      if (metaTableData) {
        this.tables[tableName] = metaTableData;
      }
    }
  }

  /**
   * @deprecated Use use the method update and the property tables instead. Will be removed.
   * @param tableName The name of the table to update and get metadata for
   * @param options Additional api options
   */
  public async GetTableMetadata(tableName: string, options?: unknown): Promise<any> {
    if (this.tableMetadata[tableName] == null) {
      const metaTableData = await this.getTable(tableName, options);
      if (metaTableData) {
        this.tableMetadata[tableName] = metaTableData;
      }
    }

    return this.tableMetadata[tableName];
  }
}
