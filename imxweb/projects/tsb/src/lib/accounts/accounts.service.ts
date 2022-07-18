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

import {
  CollectionLoadParameters,
  TypedEntityCollectionData,
  DataModelFilter,
  EntitySchema,
  FilterTreeData,
  DataModel
} from 'imx-qbm-dbts';
import { TsbApiService } from '../tsb-api-client.service';
import { PortalTargetsystemUnsAccount } from 'imx-api-tsb';
import { TargetSystemDynamicMethodService } from '../target-system/target-system-dynamic-method.service';
import { AccountTypedEntity } from './account-typed-entity';
import { DbObjectKeyBase } from '../target-system/db-object-key-wrapper.interface';
import { AcountsFilterTreeParameters as AccountsFilterTreeParameters } from './accounts.models';

@Injectable({ providedIn: 'root' })
export class AccountsService {
  constructor(
    private readonly tsbClient: TsbApiService,
    private readonly dynamicMethod: TargetSystemDynamicMethodService
  ) { }

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
    return this.tsbClient.typedClient.PortalTargetsystemUnsAccount.Get(navigationState);
  }

  public async getAccount(dbObjectKey: DbObjectKeyBase, columnName?: string): Promise<AccountTypedEntity> {
    return this.dynamicMethod.get(AccountTypedEntity, { dbObjectKey, columnName });
  }

  public async getAccountInteractive(dbObjectKey: DbObjectKeyBase, columnName: string): Promise<AccountTypedEntity> {
    return (await this.dynamicMethod.getById(AccountTypedEntity, { dbObjectKey, columnName })) as AccountTypedEntity;
  }

  public async getFilterOptions(): Promise<DataModelFilter[]> {
    return (await this.getDataModel()).Filters;
  }

  public async getDataModel(): Promise<DataModel>{
    return this.tsbClient.client.portal_targetsystem_uns_account_datamodel_get(undefined);
  }


  public async getFilterTree(parameter: AccountsFilterTreeParameters):Promise<FilterTreeData>{
    return this.tsbClient.client.portal_targetsystem_uns_account_filtertree_get(parameter);
  }
}
