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

import {
  ApiClient, EntityCollectionData, EntityData, EntityState, ExtendedTypedEntityCollection, ExtendedInteractiveEntityData,
  FkCandidateBuilder, InteractiveTypedEntityBuilder, TypedEntity, TypedEntityBuilder
} from 'imx-qbm-dbts';
import { AppConfigService } from '../../appConfig/appConfig.service';
import { ImxTranslationProviderService } from '../../translation/imx-translation-provider.service';
import { DynamicMethodTypeWrapper } from './dynamic-method-type-wrapper.interface';
import { MethodDescriptorService } from './method-descriptor.service';

@Injectable({
  providedIn: 'root'
})
export class TypedEntityBuilderService {
  constructor(
    private readonly appConfig: AppConfigService,
    private readonly methodDescriptor: MethodDescriptorService,
    private readonly translationProvider: ImxTranslationProviderService
  ) { }

  public buildReadWriteEntities<TEntity extends TypedEntity, TExtendedData = any>(
    apiClient: ApiClient,
    typeWrapper: DynamicMethodTypeWrapper<TEntity>,
    data: EntityCollectionData
  ): ExtendedTypedEntityCollection<TEntity, TExtendedData> {
    const schemaPath = typeWrapper.schemaPath ||
      (typeWrapper.path.startsWith('/') ? typeWrapper.path.substring(1) : typeWrapper.path).toLowerCase();

    const entitySchema = this.appConfig.client.getSchema(schemaPath);
    const fkProviderItems = new FkCandidateBuilder(entitySchema?.FkCandidateRoutes, apiClient).build();
    const commitMethod = (__, writeData) => apiClient.processRequest(this.methodDescriptor.put(typeWrapper.path, writeData));

    const builder = new TypedEntityBuilder(typeWrapper.type, fkProviderItems, commitMethod, this.translationProvider);
    return builder.buildReadWriteEntities<TExtendedData>(data, entitySchema);
  }

  public buildInteractiveEntities<TEntity extends TypedEntity, TExtendedData = any>(
    apiClient: ApiClient,
    typeWrapper: DynamicMethodTypeWrapper<TypedEntity>,
    data: ExtendedInteractiveEntityData<TExtendedData>
  ): ExtendedTypedEntityCollection<TypedEntity, TExtendedData> {
    const schemaPath = typeWrapper.schemaPath ||
      (typeWrapper.path.startsWith('/') ? typeWrapper.path.substring(1) : typeWrapper.path).toLowerCase();

    const entitySchema = this.appConfig.client.getSchema(schemaPath);
    const fkProviderItems = new FkCandidateBuilder(entitySchema?.FkCandidateRoutes, apiClient).build();
    const commitMethod = (__, writeData) => apiClient.processRequest(this.methodDescriptor.putInteractive(typeWrapper.path, writeData));

    const builder = new InteractiveTypedEntityBuilder(typeWrapper.type, fkProviderItems, commitMethod, this.translationProvider);
    return builder.buildReadWriteEntities<TExtendedData>(data, entitySchema);
  }

  public createEntity<TEntity extends TypedEntity>(
    apiClient: ApiClient,
    typeWrapper: DynamicMethodTypeWrapper<TEntity>,
    initialData?: EntityData
  ): TEntity {
    const schemaPath = typeWrapper.schemaPath ||
      (typeWrapper.path.startsWith('/') ? typeWrapper.path.substring(1) : typeWrapper.path).toLowerCase();
    const entitySchema = this.appConfig.client.getSchema(schemaPath);
    const fkProviderItems = new FkCandidateBuilder(entitySchema?.FkCandidateRoutes, apiClient).build();
    const commitMethod = (__, writeData) => apiClient.processRequest(this.methodDescriptor.post(typeWrapper.path, writeData));

    const builder = new TypedEntityBuilder(typeWrapper.type, fkProviderItems, commitMethod, this.translationProvider);
    return builder.buildReadWriteEntity({ entitySchema, entityData: initialData }, EntityState.Created);
  }
}
