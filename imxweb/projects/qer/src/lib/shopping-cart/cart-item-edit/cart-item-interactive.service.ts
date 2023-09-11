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
import { CartItemDataRead, PortalCartitem } from 'imx-api-qer';

import { ExtendedTypedEntityCollection, TypedEntity } from 'imx-qbm-dbts';
import { ExtendedEntityWrapper } from '../../parameter-data/extended-entity-wrapper.interface';
import { QerApiService } from '../../qer-api-client.service';
import { CartItemFkService } from './cart-item-fk.service';
import { RequestParametersService } from './request-parameters.service';

@Injectable({
  providedIn: 'root'
})
export class CartItemInteractiveService {
  constructor(
    private readonly qerClient: QerApiService,
    private readonly fkService: CartItemFkService,
    private readonly requestParametersService: RequestParametersService,
  ) { }

  public async getExtendedEntity(entityReference?: string, callbackOnChange?: () => void): Promise<ExtendedEntityWrapper<PortalCartitem>> {
    let collection: ExtendedTypedEntityCollection<PortalCartitem, CartItemDataRead>;
    if(!!entityReference){
      collection = await this.qerClient.typedClient.PortalCartitemInteractive.Get_byid(entityReference);
    }else{
      collection = await this.qerClient.typedClient.PortalCartitemInteractive.Get();
    }

    const index = 0;

    const typedEntity = collection.Data[index];

    return {
      typedEntity,
      parameterCategoryColumns: this.requestParametersService.createInteractiveParameterCategoryColumns(
        {
          Parameters: typedEntity.extendedDataRead?.Parameters,
          index
        },
        parameter => this.fkService.getFkProviderItemsInteractive(typedEntity, parameter),
        typedEntity,
        callbackOnChange
      )
    };
  }

  public async commitExtendedEntity(entityWrapper: ExtendedEntityWrapper<TypedEntity>): Promise<void> {
    return entityWrapper.typedEntity.GetEntity().Commit(true);
  }
}
