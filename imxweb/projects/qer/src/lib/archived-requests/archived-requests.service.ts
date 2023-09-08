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
import { DisplayBuilder, FkCandidateProvider, IClientProperty, MetaTableRelationData, ReadWriteEntity, ValType } from 'imx-qbm-dbts';
import { BaseCdr, ImxTranslationProviderService } from 'qbm';
import { QerApiService } from '../qer-api-client.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class ArchivedRequestsService {
  constructor(
    private readonly qerClient: QerApiService,
    private translate: TranslateService,
    private translateService: ImxTranslationProviderService
  ) {}

  public createRecipientCdr(): BaseCdr {
    const columnProperties = {};

    const property = this.createRequesterProperty();
    columnProperties[property.ColumnName] = property;
    const entityColumn = new ReadWriteEntity(
      { Columns: columnProperties },
      {},
      this.createRequesterFkProvider(property.FkRelation),
      undefined,
      new DisplayBuilder(this.translateService)
    ).GetColumn(property.ColumnName);

    return new BaseCdr(entityColumn, '#LDS#Recipient or requester');
  }

  private createRequesterProperty(): IClientProperty {
    const fkRelation = {
      ChildColumnName: 'PersonColumnName',
      ParentTableName: 'Person',
      ParentColumnName: 'UID_Person',
      IsMemberRelation: false,
    };
    return {
      ColumnName: fkRelation.ChildColumnName,
      Type: ValType.String,
      Description: this.translate.instant('#LDS#Here you can select a recipient or requester whose requests you want to display.'),
      FkRelation: fkRelation,
    };
  }

  private createRequesterFkProvider(fkRelation: MetaTableRelationData): FkCandidateProvider {
    return new FkCandidateProvider([
      {
        columnName: fkRelation.ChildColumnName,
        fkTableName: fkRelation.ParentTableName,
        parameterNames: ['OrderBy', 'StartIndex', 'PageSize', 'filter', 'search'],
        load: async (_, parameters = {}) => this.qerClient.client.portal_candidates_Person_get(parameters),
        getDataModel: async () => ({}),
        getFilterTree: async () => ({ Elements: [] }),
      },
    ]);
  }
}
