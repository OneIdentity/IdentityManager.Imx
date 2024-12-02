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

import { ErrorHandler, Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { OpsupportSearchIndexedtables, SearchResultObject } from '@imx-modules/imx-api-qbm';
import { DbObjectKey, TypedEntityCollectionData } from '@imx-modules/imx-qbm-dbts';
import { imx_ISearchService } from '../searchbar/iSearchService';
import { imx_SessionService } from '../session/imx-session.service';
import { DbObjectInfo } from './db-object-info';

@Injectable()
export class imx_QBM_SearchService implements imx_ISearchService {
  public readonly searchTermStream = new Subject<string>();

  private readonly defaultOptions = { PageSize: 200 };

  constructor(
    private session: imx_SessionService,
    private errorHandler: ErrorHandler,
  ) {}

  public async search(term: string, tables: string): Promise<DbObjectInfo[]> {
    if (term === '') {
      return [];
    }
    try {
      const result = await this.session.Client.opsupport_search_get({ term: term, tables: tables });
      if (result) {
        return result
          .filter((sro: SearchResultObject) => sro.Key != null)
          .map((sro: SearchResultObject) => ({
            Key: sro.Key ? DbObjectKey.FromXml(sro.Key) : undefined,
            Display: sro.Display ?? '',
          }));
      }
    } catch (error) {
      this.errorHandler.handleError(error);
    }

    return [];
  }

  public async getIndexedTables(): Promise<OpsupportSearchIndexedtables[]> {
    return this.session.TypedClient.OpsupportSearchIndexedtables.Get(this.defaultOptions)
      .then((response: TypedEntityCollectionData<OpsupportSearchIndexedtables>) => {
        return response.Data.sort((t1, t2) =>
          t1.DisplayName.Column.GetDisplayValue().localeCompare(t2.DisplayName.Column.GetDisplayValue()),
        );
      })
      .catch((error: any): OpsupportSearchIndexedtables[] => {
        this.errorHandler.handleError(error);
        return [];
      });
  }

  public GetTableDisplay(table: OpsupportSearchIndexedtables): string {
    return table.DisplayName.Column.GetDisplayValue();
  }

  public GetTableValue(table: OpsupportSearchIndexedtables): string {
    return table.GetEntity().GetDisplay();
  }
}
