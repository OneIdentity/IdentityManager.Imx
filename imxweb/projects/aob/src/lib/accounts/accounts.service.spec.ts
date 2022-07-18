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

import { TestBed } from '@angular/core/testing';
import { configureTestSuite } from 'ng-bullet';
import { LoggerTestingModule } from 'ngx-logger/testing';

import { AccountsService } from './accounts.service';
import { ImxTranslationProviderService } from 'qbm';
import { DbObjectKey, TypedEntityCollectionData, IEntity, IForeignKeyInfo, EntityCollectionData, EntityData, TypedEntity, IEntityColumn } from 'imx-qbm-dbts';
import { PortalApplicationusesaccount, PortalApplication } from 'imx-api-aob';
import { SelectionContainer } from '../applications/edit-application/selection-container';
import { AobAccountContainer } from './aob-account-container';
import { AobApiService } from '../aob-api-client.service';

describe('AccountsService', () => {
  function createDbKey(key): string {
    return '<Key><T>table0</T><P>' + key + '</P></Key>';
  }

  function createEntity(account: { key: string, display: string, UID_AOBAppUsesAccount?: string }): IEntity {
    return {
      GetDisplay: () => account.display,
      GetKeys: () => [account.key],
      GetColumn: name => ({
        XObjectKey: { GetValue: () => createDbKey(account.UID_AOBAppUsesAccount) }
      }[name] as IEntityColumn)
    } as IEntity;
  }

  function createEntityData(account: { key: string, display: string }): EntityData {
    return {
      Display: account.display,
      Keys: [account.key]
    };
  }

  const account1 = {
    display: 'account1',
    key: 'account1uid',
    UID_AOBAppUsesAccount: '1'
  };

  const account2 = {
    display: 'account2',
    key: 'account2uid',
    UID_AOBAppUsesAccount: '1'
  };

  const account3 = {
    display: 'account3',
    key: 'account3uid',
    UID_AOBAppUsesAccount: '1'
  };

  const account4 = {
    display: 'account4',
    key: 'account4uid',
    UID_AOBAppUsesAccount: '1'
  };

  const account5 = {
    display: 'account5',
    key: 'account5uid',
    UID_AOBAppUsesAccount: undefined
  };

  const accountsAllMock = [account1, account2, account3, account4, account5];

  const pageSize = 2;

  const tableNameAccounts = 'UNSAccountB';

  const application1uid = '1';

  const applicationUsesAccountsDbTableMock = {};
  applicationUsesAccountsDbTableMock[application1uid] = {
    totalCount: accountsAllMock.length,
    Data: accountsAllMock.map(account =>
      ({
        ObjectKeyAccount: { value: new DbObjectKey(tableNameAccounts, [account.key]).ToXmlString() },
        UID_AOBAppUsesAccount: { value: account.UID_AOBAppUsesAccount },
        GetEntity: () => (createEntity(account))
      })
    ) as PortalApplicationusesaccount[]
  };

  function getApplicationUsesAccount(applicationUid: string, page = 1): TypedEntityCollectionData<AobAccountContainer> {
    const accountsCollection = applicationUsesAccountsDbTableMock[applicationUid];
    return accountsCollection ?
      { totalCount: accountsCollection.length , Data: accountsCollection.Data.slice(page - 1, pageSize) } :
      { totalCount: 0, Data: [] };
  }

  function getApplicationCandidatesEntityCollection(page = 1): EntityCollectionData {
    return {
      TotalCount: accountsAllMock.length,
      Entities: accountsAllMock.slice(page - 1, pageSize).map(a => createEntityData(a)),
    };
  }

  const sessionServiceStub = {
    client: {
      portal_applicationusesaccount_delete: jasmine.createSpy('portal_applicationusesaccount_delete')
    },
    typedClient: {
      PortalApplicationusesaccount: {
        Get: jasmine.createSpy('Get'),
        GetSchema: () => ({ Display: '' })
      },
      PortalApplicationusesaccountNew:
        jasmine.createSpyObj('PortalApplicationusesaccountNew', {
          createEntity: {
            UID_AOBApplication: {},
            ObjectKeyAccount: {
              GetMetadata: () => ({
                GetFkRelations: () => [
                  {
                    TableName: tableNameAccounts,
                    Get: _ => Promise.resolve(getApplicationCandidatesEntityCollection())
                  } as IForeignKeyInfo
                ]
              })
            },
            GetEntity: () => ({
              Commit: () => Promise.resolve()
            }),
          }
        })
    }
  };

  sessionServiceStub.typedClient.PortalApplicationusesaccount.Get.and.callFake((applicationUid: string, _) =>
    Promise.resolve(getApplicationUsesAccount(applicationUid))
  );

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [LoggerTestingModule],
      providers: [
        {
          provide: AobApiService,
          useValue: sessionServiceStub
        },
        {
          provide: ImxTranslationProviderService,
          useValue: {}
        }
      ]
    });
  });

  beforeEach(() => {
    sessionServiceStub.client.portal_applicationusesaccount_delete.calls.reset();
    sessionServiceStub.typedClient.PortalApplicationusesaccount.Get.calls.reset();
    sessionServiceStub.typedClient.PortalApplicationusesaccountNew.createEntity.calls.reset();
  });

  it('should be created', () => {
    const service: AccountsService = TestBed.get(AccountsService);
    expect(service).toBeDefined();
  });

  it('provides assigned account and displays', async () => {
    const service: AccountsService = TestBed.get(AccountsService);

    const assigned = await service.getAssigned(application1uid);
    expect(sessionServiceStub.typedClient.PortalApplicationusesaccount.Get).toHaveBeenCalled();
    expect(assigned[0].GetEntity().GetDisplay()).toEqual(account1.display);
  });

  [
    {
      assigned: [account1, account2],
      selected: [],
      numOfDeletes: 2,
      numOfAdds: 0
    },
    {
      assigned: [account1, account2],
      selected: [account1, account2],
      numOfDeletes: 0,
      numOfAdds: 0
    },
    {
      assigned: [account1, account2],
      selected: [account3, account4],
      numOfDeletes: 2,
      numOfAdds: 2
    },
    {
      assigned: [account1, account2],
      selected: [account5],
      numOfDeletes: 2,
      numOfAdds: 1
    },
  ].forEach(testcase =>
  it('can update assigned accounts, ' +
    'assigned: [' + testcase.assigned.map(t => t.key) +
    '], selected: [' + testcase.selected.map(t => t.key) + ']', async () => {
    const service: AccountsService = TestBed.get(AccountsService);

    function createAccount(account: { key: string, display: string, UID_AOBAppUsesAccount: string }) {
      service['appUsesAccounts'][account.key] = { UID_AOBAppUsesAccount: { value: account.UID_AOBAppUsesAccount } } as PortalApplicationusesaccount;

      return {
        GetEntity: () => createEntity(account)
      } as TypedEntity;
    }  

    const assignedAccounts = testcase.assigned.map(a => createAccount(a));
    const selectedAccounts = testcase.selected.map(a => createAccount(a));

    const selection = new SelectionContainer((item: TypedEntity) => item.GetEntity().GetKeys().join());
    selection.init(assignedAccounts);
    selection.selected = selectedAccounts;

    await service.updateApplicationUsesAccounts(
      { UID_AOBApplication: { value: application1uid } } as PortalApplication,
      selection.getChangeSet()
    );

    expect(sessionServiceStub.client.portal_applicationusesaccount_delete).toHaveBeenCalledTimes(testcase.numOfDeletes);
    expect(sessionServiceStub.typedClient.PortalApplicationusesaccountNew.createEntity).toHaveBeenCalledTimes(testcase.numOfAdds);
  }));
});
