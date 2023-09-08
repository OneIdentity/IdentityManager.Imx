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

import { ApiClient, EntityData, ExtendedTypedEntityCollection, TypedEntity } from 'imx-qbm-dbts';
import { DynamicCollectionLoadParameters } from './dynamic-collection-load-parameters.interface';
import { DynamicMethodTypeWrapper } from './dynamic-method-type-wrapper.interface';
import { InteractiveParameter } from './interactive-parameter.interface';
import { MethodDescriptorService } from './method-descriptor.service';
import { TypedEntityBuilderService } from './typed-entity-builder.service';

@Injectable({
  providedIn: 'root'
})
export class DynamicMethodService {
  constructor(
    private readonly methodDescriptor: MethodDescriptorService,
    private readonly typedEntityBuilder: TypedEntityBuilderService,
  ) { }

  public async get<TEntity extends TypedEntity, TExtendedData = any>(
    apiClient: ApiClient,
    typeWrapper: DynamicMethodTypeWrapper<TEntity>,
    parameters: DynamicCollectionLoadParameters = {}
  ): Promise<ExtendedTypedEntityCollection<TEntity, TExtendedData>> {
    const data = await apiClient.processRequest(this.methodDescriptor.get(typeWrapper.path, parameters));

    return this.typedEntityBuilder.buildReadWriteEntities(
      apiClient,
      typeWrapper,
      data
    );
  }

  public async getInteractive<TEntity extends TypedEntity, TExtendedData = any>(
    apiClient: ApiClient,
    typeWrapper: DynamicMethodTypeWrapper<TEntity>,
    parameters: InteractiveParameter
  ): Promise<ExtendedTypedEntityCollection<TypedEntity, TExtendedData>> {
    const data = await apiClient.processRequest(this.methodDescriptor.getInteractive(typeWrapper.path + '/' + typeWrapper.key, parameters));

    return this.typedEntityBuilder.buildInteractiveEntities(
      apiClient,
      typeWrapper,
      data
    );
  }

  public createEntity<TEntity extends TypedEntity, TExtendedData = any>(
    apiClient: ApiClient,
    typeWrapper: DynamicMethodTypeWrapper<TEntity>,
    initialData?: EntityData
  ): ExtendedTypedEntityCollection<TEntity, TExtendedData> {
    const entity = this.typedEntityBuilder.createEntity(apiClient, typeWrapper, initialData);
    return {
      Data: [entity],
      totalCount: 1,
    };
  }

  public async delete(
    apiClient: ApiClient,
    path: string,
    pathParameters: { [name: string]: any }
  ): Promise<any> {
    return apiClient.processRequest(this.methodDescriptor.delete(path, pathParameters));
  }
}
