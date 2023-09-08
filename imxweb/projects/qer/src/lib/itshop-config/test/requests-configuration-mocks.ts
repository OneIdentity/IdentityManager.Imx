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

import { PortalShopConfigMembers, PortalShopConfigStructure } from 'imx-api-qer';
import { CollectionLoadParameters, FkProviderItem, IEntity, IEntityColumn, TypedEntityCollectionData } from 'imx-qbm-dbts';
import { of } from 'rxjs';

function mockData(): TypedEntityCollectionData<any> {
  return { totalCount: 0, Data: [] };
}

const mockEntityColumn = {
  ColumnName: '',
  GetMetadata: () => {
    return {
      CanEdit: () => false,
      GetDisplay: () => '',
      GetMinLength: () => 0
    };
  },
  GetValue: () => ''

} as IEntityColumn;

const mockRequestEntity = {
  GetDisplay: () => 'Display value',
  GetKeys: () => ['testId'],
  GetColumn: (name) => mockEntityColumn,
  Commit: (bool) => Promise.resolve()
} as IEntity;

const mockfkProviderItem = {
  columnName: 'test-column',
  fkTableName: 'test-table',
  parameterNames: [],
  load: () => Promise.resolve(undefined),
  getDataModel: () => Promise.resolve({}),
  getFilterTree: async () => ({})
} as FkProviderItem;

const mockEntityWithFk = {
  GetDisplay: () => 'Display value',
  GetKeys: () => ['1'],
  GetColumn: (name) => mockEntityColumn,
  GetFkCandidateProvider: () => {
    return { getProviderItem: (colName, table) => mockfkProviderItem };
  }
} as IEntity;

const mockNewMemberEntity: any = {
  GetEntity: () => mockEntityWithFk
} as PortalShopConfigMembers;

export class RequestsConfigurationCommonMocks {
  public static navigationState: CollectionLoadParameters = { StartIndex: 1, PageSize: 50 };
  public static keyword = 'test1';

  public static mockEntityColumn = mockEntityColumn;

  public static mockEntity = {
    GetDisplay: () => 'Display value',
    GetKeys: () => ['1'],
    GetColumn: (name) => RequestsConfigurationCommonMocks.mockEntityColumn,
  } as IEntity;

  public static mockRequestShopStructure = {
    GetEntity: () => RequestsConfigurationCommonMocks.mockEntity,
    ITShopInfo: { value: undefined },
  } as PortalShopConfigStructure;

  public static mockRequestShopShelfStructure = {
    GetEntity: () => RequestsConfigurationCommonMocks.mockEntity,
    ITShopInfo: { value: undefined },
    UID_ParentITShopOrg: { value: undefined },
  } as PortalShopConfigStructure;

  public static mockRequestConfig = {
    GetEntity: () => mockRequestEntity,
    Ident_Org: { Column: RequestsConfigurationCommonMocks.mockEntityColumn },
    Description: { Column: RequestsConfigurationCommonMocks.mockEntityColumn },
    UID_OrgAttestator: { Column: RequestsConfigurationCommonMocks.mockEntityColumn },
    DecisionMethods: { Column: RequestsConfigurationCommonMocks.mockEntityColumn },
    UID_CustomerNode: { Column: RequestsConfigurationCommonMocks.mockEntityColumn },
    UID_PersonHead: { Column: RequestsConfigurationCommonMocks.mockEntityColumn },
    UID_PersonHeadSecond: { Column: RequestsConfigurationCommonMocks.mockEntityColumn },
  } as PortalShopConfigStructure;

  public static mockRequestsService: any = {
    getShopStructures: jasmine.createSpy('getShopStructures').and.returnValue(Promise.resolve(mockData())),
    createRequestConfigEntity: jasmine
      .createSpy('createRequestConfigEntity')
      .and.returnValue(RequestsConfigurationCommonMocks.mockRequestShopStructure),
    createNewRequestConfig: jasmine.createSpy('createNewRequestConfig').and.returnValue(Promise.resolve()),
    deleteRequestConfiguration: jasmine.createSpy('deleteRequestConfiguration').and.returnValue(Promise.resolve()),
    manageShelfDeleteStatus: jasmine.createSpy('manageShelfDeleteStatus'),
    getRequestConfigMembers: jasmine.createSpy('getRequestConfigMembers').and.returnValue(Promise.resolve(mockData())),
    generateRequestConfigMemberEntity: jasmine.createSpy('generateRequestConfigMemberEntity').and.returnValue(mockNewMemberEntity),
    removeRequestConfigMembers: jasmine.createSpy('removeRequestConfigMembers').and.returnValue(Promise.resolve()),
    removeRequestConfigMemberExclusions: jasmine.createSpy('removeRequestConfigMemberExclusions').and.returnValue(Promise.resolve()),
    handleOpenLoader: jasmine.createSpy('handleOpenLoader'),
    handleCloseLoader: jasmine.createSpy('handleCloseLoader'),
    openSnackbar: jasmine.createSpy('openSnackbar'),
    shelvesBlockedDeleteStatus: {},
    shopStructureSchema: {
      Columns: {
        __Display: { ColumnName: '__Display' },
        Description: { ColumnName: 'Description' },
        UID_OrgAttestator: { ColumnName: 'UID_OrgAttestator' },
      },
    },
    shopEntitlementsAdsGroupSchema: {
      Columns: {
        UID_ADSGroup: { ColumnName: 'UID_OrgAttestator', FkRelation: { ParentColumnName: '', ParentTableName: '' } },
      },
    },
    shopConfigMembersSchema: {
      Columns: {
        UID_Person: { ColumnName: 'UID_OrgAttestator', FkRelation: { ParentColumnName: '', ParentTableName: '' } },
      },
    },
    LdsShopHasBeenDeleted: '#LDS#The shop has been successfully deleted.',
  };
  public static readonly storage = {};
  public static mockStorageService: any = {
    isHelperAlertDismissed: jasmine.createSpy('isHelperAlertDismissed').and.callFake(
      (key: string) => RequestsConfigurationCommonMocks.storage[key]),
    storeHelperAlertDismissal: jasmine.createSpy('storeHelperAlertDismissal').and.callFake(
      (key: string) => RequestsConfigurationCommonMocks.storage[key] = true),
  };

  public static mockDialogRef = { afterClosed: () => of(undefined) };
}
