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
 * Copyright 2022 One Identity LLC.
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

import { BaseCdr, BaseReadonlyCdr, ImxTranslationProviderService } from 'qbm';
import { MetaTableRelationData, FkCandidateProvider, IClientProperty, ValType, ReadWriteEntity, DisplayBuilder } from 'imx-qbm-dbts';
import { QerApiService } from '../qer-api-client.service';

@Injectable({
  providedIn: 'root',
})
export class OwnerControlService {
  constructor(private readonly qerClient: QerApiService, private readonly translate: ImxTranslationProviderService) {}

  public createGroupOwnerPersonCdr(readonly: boolean): BaseCdr {
    const columnProperties = {};

    const property = this.createGroupOwnerPersonProperty();
    columnProperties[property.ColumnName] = property;
    const entityColumn = new ReadWriteEntity(
      { Columns: columnProperties },
      {},
      this.createGroupOwnerPersonFkProvider(property.FkRelation),
      undefined,
      new DisplayBuilder(this.translate)
    ).GetColumn(property.ColumnName);

    return readonly ? new BaseReadonlyCdr(entityColumn,'#LDS#Identity') : new BaseCdr(entityColumn,'#LDS#Identity');
  }

  private createGroupOwnerPersonProperty(): IClientProperty {
    const fkRelation = {
      ChildColumnName: 'PersonColumnName',
      ParentTableName: 'Person',
      ParentColumnName: 'UID_Person',
      IsMemberRelation: false,
    };
    return {
      ColumnName: fkRelation.ChildColumnName,
      Type: ValType.String,
      Description: 'Identity',
      IsValidColumnForFiltering: true,
      FkRelation: fkRelation,
    };
  }

  private createGroupOwnerPersonFkProvider(fkRelation: MetaTableRelationData): FkCandidateProvider {
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
