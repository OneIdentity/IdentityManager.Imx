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
  CollectionLoadParameters,
  TypedEntityCollectionData,
  DataModelFilter,
  EntitySchema,
  FilterTreeData,
  DataModel,
  EntityCollectionData,
  MethodDescriptor,
  MethodDefinition,
} from 'imx-qbm-dbts';
import { TsbApiService } from '../tsb-api-client.service';
import { PortalTargetsystemUnsAccount, V2ApiClientMethodFactory } from 'imx-api-tsb';
import { TargetSystemDynamicMethodService } from '../target-system/target-system-dynamic-method.service';
import { AccountTypedEntity } from './account-typed-entity';
import { DbObjectKeyBase } from '../target-system/db-object-key-wrapper.interface';
import { AcountsFilterTreeParameters as AccountsFilterTreeParameters } from './accounts.models';
import { DataSourceToolbarExportMethod } from 'qbm';

@Injectable({ providedIn: 'root' })
export class AccountsService {
  private abortController = new AbortController();

  constructor(private readonly tsbClient: TsbApiService, private readonly dynamicMethod: TargetSystemDynamicMethodService) {}

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
  public async getAccounts(navigationState: CollectionLoadParameters): Promise<TypedEntityCollectionData<PortalTargetsystemUnsAccount>> {
    if (navigationState?.search !== undefined) {
      // abort the request only while searching
      this.abortCall();
    }
    return this.tsbClient.typedClient.PortalTargetsystemUnsAccount.Get(navigationState, { signal: this.abortController.signal });
  }

  public exportAccounts(navigationState: CollectionLoadParameters): DataSourceToolbarExportMethod {
    const factory = new V2ApiClientMethodFactory();
    return {
      getMethod: (withProperties: string, PageSize?: number) => {
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

     /** @deprecated Will be removed. Please load the data model first.*/
  public async getFilterOptions(): Promise<DataModelFilter[]> {
    return (await this.getDataModel()).Filters;
  }

  public async getDataModel(): Promise<DataModel> {
    return this.tsbClient.client.portal_targetsystem_uns_account_datamodel_get(undefined);
  }

  public async getFilterTree(parameter: AccountsFilterTreeParameters): Promise<FilterTreeData> {
    return this.tsbClient.client.portal_targetsystem_uns_account_filtertree_get(parameter);
  }

  private abortCall(): void {
    this.abortController.abort();
    this.abortController = new AbortController();
  }
}
