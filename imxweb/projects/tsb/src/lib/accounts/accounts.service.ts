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

import { Injectable } from '@angular/core';

import { PortalTargetsystemUnsAccount, V2ApiClientMethodFactory } from '@imx-modules/imx-api-tsb';
import {
  CollectionLoadParameters,
  DataModel,
  DataModelFilter,
  EntityCollectionData,
  EntitySchema,
  FilterTreeData,
  MethodDefinition,
  MethodDescriptor,
  TypedEntityCollectionData,
} from '@imx-modules/imx-qbm-dbts';
import { DataSourceToolbarExportMethod } from 'qbm';
import { DbObjectKeyBase } from '../target-system/db-object-key-wrapper.interface';
import { TargetSystemDynamicMethodService } from '../target-system/target-system-dynamic-method.service';
import { TsbApiService } from '../tsb-api-client.service';
import { AccountTypedEntity } from './account-typed-entity';
import { AcountsFilterTreeParameters as AccountsFilterTreeParameters } from './accounts.models';

@Injectable({ providedIn: 'root' })
export class AccountsService {
  constructor(
    private readonly tsbClient: TsbApiService,
    private readonly dynamicMethod: TargetSystemDynamicMethodService,
  ) {}

  public get accountSchema(): EntitySchema {
    return this.tsbClient.typedClient.PortalTargetsystemUnsAccount.GetSchema();
  }

  /**
   * Gets a list of accounts.
   *
   * @param navigationState Page size, start index, search and filtering options etc,.
   *
   * @returns Wrapped list of Accounts.
   */
  public async getAccounts(
    navigationState: CollectionLoadParameters,
    signal: AbortSignal,
  ): Promise<TypedEntityCollectionData<PortalTargetsystemUnsAccount>> {
    return this.tsbClient.typedClient.PortalTargetsystemUnsAccount.Get(navigationState, { signal });
  }

  public exportAccounts(): DataSourceToolbarExportMethod {
    const factory = new V2ApiClientMethodFactory();
    return {
      getMethod: (withProperties: string, navigationState: CollectionLoadParameters, PageSize?: number) => {
        let method: MethodDescriptor<EntityCollectionData>;
        if (PageSize) {
          method = factory.portal_targetsystem_uns_account_get({ ...navigationState, withProperties, PageSize, StartIndex: 0 });
        } else {
          method = factory.portal_targetsystem_uns_account_get({ ...navigationState, withProperties });
        }
        return new MethodDefinition(method);
      },
    };
  }

  public async getAccount(dbObjectKey: DbObjectKeyBase, columnName?: string): Promise<AccountTypedEntity> {
    return this.dynamicMethod.get(AccountTypedEntity, { dbObjectKey, columnName });
  }

  public async getAccountInteractive(dbObjectKey: DbObjectKeyBase, columnName: string): Promise<AccountTypedEntity> {
    return (await this.dynamicMethod.getById(AccountTypedEntity, { dbObjectKey, columnName })) as AccountTypedEntity;
  }

  /** @deprecated Will be removed. Please load the data model first. */
  public async getFilterOptions(): Promise<DataModelFilter[]> {
    return (await this.getDataModel()).Filters ?? [];
  }

  public async getDataModel(): Promise<DataModel> {
    return this.tsbClient.client.portal_targetsystem_uns_account_datamodel_get(undefined);
  }

  public async getFilterTree(parameter: AccountsFilterTreeParameters): Promise<FilterTreeData> {
    return this.tsbClient.client.portal_targetsystem_uns_account_filtertree_get(parameter);
  }
}
