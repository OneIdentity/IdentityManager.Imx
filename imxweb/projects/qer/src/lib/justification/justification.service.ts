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

import { PortalJustifications } from 'imx-api-qer';
import {
  CollectionLoadParameters,
  CompareOperator,
  EntityCollectionData,
  FilterType,
  FkProviderItem,
  IClientProperty,
  MetaTableRelationData,
  ValType,
} from 'imx-qbm-dbts';
import { ImxTranslationProviderService } from 'qbm';
import { BaseCdr, EntityService } from 'qbm';
import { QerApiService } from '../qer-api-client.service';
import { JustificationType } from './justification-type.enum';

@Injectable({
  providedIn: 'root',
})
export class JustificationService {
  private readonly parentColumnName = 'UID_QERJustification';

  constructor(
    private readonly apiService: QerApiService,
    private readonly entityService: EntityService,
    private readonly translate: ImxTranslationProviderService
  ) {}

  public async get(uid: string): Promise<PortalJustifications> {
    const collection = await this.apiService.typedClient.PortalJustifications.Get({
      filter: [
        {
          ColumnName: this.parentColumnName,
          Type: FilterType.Compare,
          CompareOp: CompareOperator.Like,
          Value1: uid,
        },
      ],
    });
    return collection && collection.Data && collection.Data.length > 0 ? collection.Data[0] : undefined;
  }

  public async createCdr(justificationType: JustificationType): Promise<BaseCdr> {
    if ((await this.getByType(justificationType))?.TotalCount === 0) {
      return undefined;
    }

    const property = this.createProperty();
    const fkProviderItem = this.createFkProviderItem(property.FkRelation, justificationType);
    const column = this.entityService.createLocalEntityColumn(property, [fkProviderItem]);
    const cdr = new BaseCdr(column, '#LDS#Reason for your decision');
    return cdr;
  }

  private createProperty(): IClientProperty {
    const fkRelation = {
      ChildColumnName: 'Justification',
      ParentTableName: 'QERJustification',
      ParentColumnName: this.parentColumnName,
      IsMemberRelation: false,
    };
    return {
      ColumnName: fkRelation.ChildColumnName,
      Type: ValType.String,
      Display: this.translate.GetTranslation({
        Key: 'Standard reason',
        UidColumn: 'QBM-D666A28FA9F3402BB17F80C68530E4CB',
      }),
      FkRelation: fkRelation,
    };
  }

  private createFkProviderItem(fkRelation: MetaTableRelationData, justificationType: JustificationType): FkProviderItem {
    return {
      columnName: fkRelation.ChildColumnName,
      fkTableName: fkRelation.ParentTableName,
      parameterNames: ['OrderBy', 'StartIndex', 'PageSize', 'filter', 'search'],
      load: async (_, parameters = {}) => this.getByType(justificationType, parameters),
      getDataModel: async () => ({}),
      getFilterTree: async () => ({}),
    };
  }

  private async getByType(justificationType: JustificationType, parameters: CollectionLoadParameters = {}): Promise<EntityCollectionData> {
    const collection = await this.apiService.client.portal_justifications_get(parameters);

    // tslint:disable-next-line:no-bitwise
    const entities = collection.Entities.filter((entityData) => (entityData.Columns.JustificationType.Value & justificationType) > 0);

    return {
      TotalCount: entities.length,
      IsLimitReached: collection.IsLimitReached,
      Entities: entities,
      TableName: collection.TableName,
    };
  }
}
