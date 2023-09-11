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

import { CompareOperator, ExtendedTypedEntityCollection, FilterType, IEntity, TypedEntity } from 'imx-qbm-dbts';
import { DynamicCollectionLoadParameters, DynamicMethodService, MetadataService } from 'qbm';
import { TsbApiService } from '../tsb-api-client.service';
import { DbObjectKeyWrapper } from './db-object-key-wrapper.interface';
import { PathParameterWrapper } from './path-parameter-wrapper';

@Injectable({
  providedIn: 'root'
})
export class TargetSystemDynamicMethodService {
  constructor(
    private readonly tsbClient: TsbApiService,
    private readonly dynamicMethod: DynamicMethodService,
    private readonly metadata: MetadataService
  ) { }

  public async getCollection<TEntity extends TypedEntity, TExtendedData = any>(
    type: new (e: IEntity) => TEntity,
    tableName: string,
    parameters: DynamicCollectionLoadParameters = {}
  ): Promise<ExtendedTypedEntityCollection<TEntity, TExtendedData>> {
    const path = '/portal/targetsystem/' + tableName;
    return this.dynamicMethod.get(this.tsbClient.apiClient, { type, path }, parameters);
  }

  public async getById<TEntity extends TypedEntity, TExtendedData = any>(
    type: new (e: IEntity) => TEntity,
    dbObjectKeyWrapper: DbObjectKeyWrapper
  ): Promise<TypedEntity> {
    const key = dbObjectKeyWrapper.dbObjectKey.Keys[0];
    const tableName = dbObjectKeyWrapper.dbObjectKey.TableName.toLowerCase();
    const path = '/portal/targetsystem/' + tableName + '/interactive';

    return (await this.dynamicMethod.getInteractive(this.tsbClient.apiClient, { type, key, path }, {
      name: dbObjectKeyWrapper.columnName, value: key
    })).Data[0];
  }

  public async get<TEntity extends TypedEntity, TExtendedData = any>(
    type: new (e: IEntity) => TEntity,
    dbObjectKeyWrapper: DbObjectKeyWrapper
  ): Promise<TEntity> {
    await this.metadata.updateNonExisting([dbObjectKeyWrapper.dbObjectKey.TableName]);

    const tableMetadata = this.metadata.tables[dbObjectKeyWrapper.dbObjectKey.TableName];

    const filter = [{
      ColumnName: dbObjectKeyWrapper.columnName ?? tableMetadata.PrimaryKeyColumns[0],
      Type: FilterType.Compare,
      CompareOp: CompareOperator.Equal,
      Value1: dbObjectKeyWrapper.dbObjectKey.Keys[0]
    }];

    return (await this.getCollection<TEntity, TExtendedData>(
      type, dbObjectKeyWrapper.dbObjectKey.TableName, { filter }
    ))?.Data[0];
  }

  public async delete(tableName: string, pathParameterWrapper: PathParameterWrapper): Promise<any> {
    const path = '/portal/' + tableName + '/' + pathParameterWrapper.path;
    return this.dynamicMethod.delete(this.tsbClient.apiClient, path, pathParameterWrapper.parameters);
  }
}
