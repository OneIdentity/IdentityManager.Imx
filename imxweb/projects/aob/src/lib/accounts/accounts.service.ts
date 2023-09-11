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

import { ClassloggerService, ApiClientService } from 'qbm';
import {
  CollectionLoadParameters,
  FilterType,
  CompareOperator,
  IForeignKeyInfo,
  TypedEntityBuilder,
  DbObjectKey,
  TypedEntity,
  EntityCollectionData,
  ExtendedTypedEntityCollection
} from 'imx-qbm-dbts';
import { PortalApplication, PortalApplicationusesaccount } from 'imx-api-aob';
import { AobAccountContainer } from './aob-account-container';
import { AobApiService } from '../aob-api-client.service';

@Injectable({
  providedIn: 'root'
})
export class AccountsService {
  public get display(): string {
    return this.aobClient.typedClient.PortalApplicationusesaccount.GetSchema().Display;
  }

  private readonly builder = new TypedEntityBuilder(AobAccountContainer);

  private appUsesAccounts: { [name: string]: PortalApplicationusesaccount } = {};

  constructor(
    private readonly aobClient: AobApiService,
    private readonly logger: ClassloggerService,
    private readonly apiProvider: ApiClientService
  ) { }

  public async updateApplicationUsesAccounts(
    application: PortalApplication,
    changeSet: { add: TypedEntity[], remove: TypedEntity[] }
  ): Promise<boolean> {
    const assignResult = await this.assign(application, changeSet.add);
    return assignResult && this.unassign(application, changeSet.remove);
  }

  public getCandidateTables(): ReadonlyArray<IForeignKeyInfo> {
    return this.aobClient.typedClient.PortalApplicationusesaccountNew.createEntity()
      .ObjectKeyAccount.GetMetadata().GetFkRelations();
  }

  public async getSelectedAccountLength(uidApplication: string): Promise<number> {
    return (await this.apiProvider.request(() =>
      this.aobClient.typedClient.PortalApplicationusesaccount.Get(uidApplication, { PageSize: -1 }))).totalCount;
  }

  public async getAssigned(application: string, parameters: CollectionLoadParameters = {}): Promise<TypedEntity[]> {
    this.appUsesAccounts = {};

    this.logger.debug(this, 'getting assigned accounts...');

    const appUsesAccountCollection = await this.apiProvider.request(() =>
      this.aobClient.typedClient.PortalApplicationusesaccount.Get(application, parameters));

    return this.accountsWithTableInfo(appUsesAccountCollection, parameters);
  }

  public async getFirstAndCount(uidApplication: string): Promise<{ first: TypedEntity, count: number }> {
    const elements = await this.apiProvider.request(() =>
      this.aobClient.typedClient.PortalApplicationusesaccount.Get(uidApplication, { PageSize: 1 }));

    const accounts = await this.accountsWithTableInfo(elements, { PageSize: 1 });

    return {
      first: accounts.length === 0 ? undefined : accounts[0],
      count: elements.totalCount
    };
  }

  private async accountsWithTableInfo(appUsesAccountCollection: ExtendedTypedEntityCollection<PortalApplicationusesaccount, unknown>,
    parameters: CollectionLoadParameters): Promise<TypedEntity[]> {

    const accountsAssigned = [];
    const tables = this.getCandidateTables();

    if (appUsesAccountCollection && appUsesAccountCollection.Data && tables) {
      for (const appUsesAccount of appUsesAccountCollection.Data) {
        const tableName = DbObjectKey.FromXml(appUsesAccount.ObjectKeyAccount.value).TableName;
        const table = tables.find(fkr => fkr.TableName === tableName);

        if (table) {
          const accountCollection = await table.Get(
            {
              ...parameters,
              ...{
                filter: [
                  {
                    ColumnName: table.ColumnName,
                    Type: FilterType.Compare,
                    CompareOp: CompareOperator.Like,
                    Value1: `%${appUsesAccount.ObjectKeyAccount.value}%`
                  }
                ],
                search: undefined
              }
            }
          );

          if (accountCollection?.Entities?.length > 0) {
            const entity = this.builder.buildReadWriteEntity({
              entitySchema: AobAccountContainer.GetEntitySchema(),
              entityData: accountCollection.Entities[0]
            });
            this.appUsesAccounts[entity.GetEntity().GetKeys().join()] = appUsesAccount;
            accountsAssigned.push(entity);
          }
        }
      }
    }
    return accountsAssigned;
  }

  private async assign(application: PortalApplication, accounts: TypedEntity[]): Promise<boolean> {
    let count = 0;
    await this.apiProvider.request(async () => {
      for (const account of accounts) {
        this.logger.debug(this, 'assigning account to application...');
        const assignedAccount = this.aobClient.typedClient.PortalApplicationusesaccountNew.createEntity();
        assignedAccount.UID_AOBApplication.value = application.UID_AOBApplication.value;
        assignedAccount.ObjectKeyAccount.value = account.GetEntity().GetColumn('XObjectKey').GetValue();
        await assignedAccount.GetEntity().Commit();
        count++;
      }
    });
    return count === accounts.length;
  }

  private async unassign(application: PortalApplication, accounts: TypedEntity[]): Promise<boolean> {
    let count = 0;
    await this.apiProvider.request(async () => {
      for (const account of accounts) {
        this.logger.debug(this, 'unassigning account from application...');
        await this.aobClient.client.portal_applicationusesaccount_delete(
          application.UID_AOBApplication.value,
          this.appUsesAccounts[account.GetEntity().GetKeys().join()].UID_AOBAppUsesAccount.value
        );
        count++;
      }
    });
    return count === accounts.length;
  }

  private async searchCandidates(
    table: IForeignKeyInfo,
    keyword: string,
    parameters: CollectionLoadParameters = {}
  ): Promise<EntityCollectionData> {
    this.logger.debug(this, 'searching accounts...');

    return table.Get(
      {
        ...parameters,
        ...{
          filter: [
            {
              ColumnName: table.ColumnName,
              Type: FilterType.Compare,
              CompareOp: CompareOperator.Like,
              Value1: `%${keyword}%`
            }
          ],
          search: undefined
        }
      }
    );
  }
}
