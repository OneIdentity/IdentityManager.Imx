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
import { CollectionLoadParameters, EntitySchema, TypedEntityCollectionData } from 'imx-qbm-dbts';
import { PortalShopCategories } from 'imx-api-qer';
import { QerApiService } from '../qer-api-client.service';

@Injectable()
export class ProductSelectionService {
    constructor(
        private readonly qerClient: QerApiService
    ) { }

    public getServiceCategoryDisplaySingular(): string {
        const schema = this.qerClient.typedClient.PortalShopCategories.GetSchema();
        return schema.DisplaySingular;
    }

    public get entitySchemaShopCategories(): EntitySchema {
        return this.qerClient.typedClient.PortalShopCategories.GetSchema();
    }

    public getServiceCategories(navigationState: CollectionLoadParameters & {
        UID_Person?: string;
        UID_AccProductGroupParent?: string;
        IncludeChildCategories?: boolean;
    }): Promise<TypedEntityCollectionData<PortalShopCategories>> {
        const opts: CollectionLoadParameters = {
            StartIndex: navigationState.StartIndex,
            OrderBy: navigationState.OrderBy,
            PageSize: navigationState.PageSize,
            filter: navigationState.filter,
            search: navigationState.search,
            UID_Person: navigationState.UID_Person,
        };

        if (!navigationState.search || navigationState.search === '') {
            opts.ParentKey = navigationState.UID_AccProductGroupParent
            ? navigationState.UID_AccProductGroupParent
            : "" // empty string: first level
          }
        
        return this.qerClient.typedClient.PortalShopCategories.Get(opts);
    }
}
