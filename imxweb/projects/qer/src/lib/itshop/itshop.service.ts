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
 * Copyright 2021 One Identity LLC.
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

import { ClassloggerService } from 'qbm';
import {
  PortalItshopApproveHistory, PortalItshopCart,
  PortalItshopPersondecision, PortalItshopPeergroupMemberships, PwoData, ServiceItemsExtendedData
} from 'imx-api-qer';
import {
  CollectionLoadParameters, EntityCollectionData, EntitySchema, ExtendedTypedEntityCollection, FilterTreeData, TypedEntityBuilder, TypedEntityCollectionData
} from 'imx-qbm-dbts';
import { ParameterDataLoadParameters } from '../parameter-data/parameter-data-load-parameters.interface';
import { QerApiService } from '../qer-api-client.service';

@Injectable({
  providedIn: 'root'
})
export class ItshopService {
  public get PortalItshopPeergroupMembershipsSchema(): EntitySchema {
    return this.qerClient.typedClient.PortalItshopPeergroupMemberships.GetSchema();
  }

  public isChiefApproval = false;

  private readonly historyBuilder = new TypedEntityBuilder(PortalItshopApproveHistory);

  constructor(
    private readonly qerClient: QerApiService,
    private readonly logger: ClassloggerService,
  ) { }

  public async getPeerGroupMemberships(
    parameters: ({ UID_PersonReference: string } | { UID_PersonPeerGroup: string }) & { UID_Person?: string } & CollectionLoadParameters
  ): Promise<ExtendedTypedEntityCollection<PortalItshopPeergroupMemberships, ServiceItemsExtendedData>> {
    return this.qerClient.typedClient.PortalItshopPeergroupMemberships.Get(parameters);
  }


  public createTypedHistory(pwoData: PwoData): PortalItshopApproveHistory[] {
    if (pwoData?.WorkflowHistory) {
      return this.historyBuilder.buildReadWriteEntities(
        pwoData.WorkflowHistory,
        this.qerClient.typedClient.PortalItshopApproveHistory.GetSchema()
      ).Data;
    }

    return undefined;
  }

  public async getRequestParameterCandidates(parameters: ParameterDataLoadParameters): Promise<EntityCollectionData> {
    return this.qerClient.client.portal_itshop_requests_parameter_candidates_post(
      parameters.columnName,
      parameters.fkTableName,
      parameters.OrderBy,
      parameters.StartIndex,
      parameters.PageSize,
      parameters.filter,
      null,
      parameters.search,
      parameters.ParentKey,
      parameters.diffData
    );
  }


  public async getRequestParameterFilterTree(parameters: ParameterDataLoadParameters): Promise<FilterTreeData> {
    return this.qerClient.client.portal_itshop_requests_parameter_candidates_filtertree_post(
      parameters.columnName,
      parameters.fkTableName,
      parameters.filter,
      parameters.ParentKey,
      parameters.diffData
    );
  }

  public async getApprovers(uidRequest: string): Promise<TypedEntityCollectionData<PortalItshopPersondecision>> {
    return this.qerClient.typedClient.PortalItshopPersondecision.Get(uidRequest);
  }

  public async getCarts(): Promise<TypedEntityCollectionData<PortalItshopCart>> {
    return this.qerClient.typedClient.PortalItshopCart.Get({ PageSize: 1048576 });
  }

  public async deleteShoppingCart(uidShoppingCart: string): Promise<EntityCollectionData> {
    this.logger.log(this, 'Deleting shopping cart...');
    return this.qerClient.client.portal_itshop_cart_delete(uidShoppingCart);
  }
}
