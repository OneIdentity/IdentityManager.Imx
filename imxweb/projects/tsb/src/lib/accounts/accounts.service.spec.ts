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
import { AccountsService } from './accounts.service';
import { CollectionLoadParameters } from 'imx-qbm-dbts';
import { TsbTestBed } from '../test/tsb-test-bed.spec';
import { TsbApiService } from '../tsb-api-client.service';
import { TargetSystemDynamicMethodService } from '../target-system/target-system-dynamic-method.service';

describe('AccountsService', () => {
  let service: AccountsService;

  const dynamicMethod = {
    get: jasmine.createSpy('get').and.returnValue({})
  };

  const mockTsbApiService = {
    typedClient: {
      PortalTargetsystemUnsAccount: {
        Get: jasmine.createSpy('Get').and.returnValue(Promise.resolve({})),
      },
      PortalTargetsystemAdsaccount: {
        Get: jasmine.createSpy('Get').and.returnValue(Promise.resolve({ Data: [{}] })),
      },
    },
    client: {
      portal_targetsystem_uns_account_datamodel_get: jasmine
        .createSpy('portal_targetsystem_uns_account_datamodel_get')
        .and.returnValue({ Filters: [] }),
      portal_targetsystem_uns_account_filtertree_get: jasmine
      .createSpy('portal_targetsystem_uns_account_filtertree_get')
      .and.returnValue({Elements:[]})
    }
  };
  let navigationState: CollectionLoadParameters = { StartIndex: 1, PageSize: 50 };

  TsbTestBed.configureTestingModule({
    providers: [
      AccountsService,
      {
        provide: TsbApiService,
        useValue: mockTsbApiService,
      },
      {
        provide: TargetSystemDynamicMethodService,
        useValue: dynamicMethod,
      }
    ]
  });

  beforeEach(() => {
    service = TestBed.inject(AccountsService);
    navigationState = { StartIndex: 1, PageSize: 50 };
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('retrieves the accounts', async () => {
    mockTsbApiService.typedClient.PortalTargetsystemUnsAccount.Get.calls.reset;
    expect(await service.getAccounts(navigationState)).toBeDefined();
    expect(mockTsbApiService.typedClient.PortalTargetsystemUnsAccount.Get).toHaveBeenCalled();
  });

  it('retrieves the specific Adsgroup', async () => {
    mockTsbApiService.typedClient.PortalTargetsystemUnsAccount.Get.calls.reset;
    expect(await service.getAccount({ TableName: 'ADSAccount', Keys: ['testAdsAccId'] })).toBeDefined();
  });

  it('retrieves the filter options for the accounts', async () => {
    mockTsbApiService.client.portal_targetsystem_uns_account_datamodel_get.calls.reset;
    expect(await service.getFilterOptions()).toBeDefined();
    expect(mockTsbApiService.client.portal_targetsystem_uns_account_datamodel_get).toHaveBeenCalled();
  });
});
