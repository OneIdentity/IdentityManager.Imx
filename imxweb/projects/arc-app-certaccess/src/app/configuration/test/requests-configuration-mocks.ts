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

import { PortalShopConfigMembers, PortalShopConfigStructure } from 'imx-api-qer';
import { CollectionLoadParameters, FkProviderItem, IEntity, IEntityColumn, TypedEntityCollectionData } from 'imx-qbm-dbts';
import { PortalAttestationSchedules } from 'imx-api-arc';
import { of } from 'rxjs';

function mockData(): TypedEntityCollectionData<any> {
  return { totalCount: 0, Data: [] };
}

const mockEntityColumn = {
  ColumnName: '',
  GetMetadata: () => {
    return {
      CanEdit: () =>  false,
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
  getDataModel:() => Promise.resolve({})
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
  } as PortalShopConfigStructure;

  public static mockRequestsService: any = {
    getShopStructures: jasmine.createSpy('getShopStructures').and.returnValue(Promise.resolve(mockData())),
    getAttestationSchedules: jasmine.createSpy('getAttestationSchedules').and.returnValue(Promise.resolve(mockData())),
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
    attestationSchedulesSchema: {
      Columns: {
        __Display: { ColumnName: '__Display' },
        LastRun: { ColumnName: 'LastRun' },
        NextRun: { ColumnName: 'NextRun' },
        FrequencyType: { ColumnName: 'FrequencyType' },
      },
    },
  };
  public static readonly storage = {};
  public static mockStorageService: any = {
    isHelperAlertDismissed: jasmine.createSpy('isHelperAlertDismissed').and.callFake(
      (key: string) => RequestsConfigurationCommonMocks.storage[key]),
    storeHelperAlertDismissal: jasmine.createSpy('storeHelperAlertDismissal').and.callFake(
      (key: string) => RequestsConfigurationCommonMocks.storage[key] = true),
  };

  public static mockDialogRef = { afterClosed: () => of(undefined) };

  public static mockAttSchedule = {
    GetEntity: () => mockRequestEntity,
    StartTime: { value: undefined },
    FrequencySubType: { value: undefined },
    FrequencyType: { value: undefined },
    DayOfYear: { value: undefined }
  } as PortalAttestationSchedules;

  public static mockAttScheduleTypeWeek = {
    FrequencyType: { value: 'Week' },
  } as any;

  public static mockAttScheduleTypeMonth = {
    FrequencyType: { value: 'Month' },
  } as any;

  public static expectedMonthFrequencySelectOptions = [
    { value: '1', display: '1' },
    { value: '2', display: '2' },
    { value: '3', display: '3' },
    { value: '4', display: '4' },
    { value: '5', display: '5' },
    { value: '6', display: '6' },
    { value: '7', display: '7' },
    { value: '8', display: '8' },
    { value: '9', display: '9' },
    { value: '10', display: '10' },
    { value: '11', display: '11' },
    { value: '12', display: '12' },
    { value: '13', display: '13' },
    { value: '14', display: '14' },
    { value: '15', display: '15' },
    { value: '16', display: '16' },
    { value: '17', display: '17' },
    { value: '18', display: '18' },
    { value: '19', display: '19' },
    { value: '20', display: '20' },
    { value: '21', display: '21' },
    { value: '22', display: '22' },
    { value: '23', display: '23' },
    { value: '24', display: '24' },
    { value: '25', display: '25' },
    { value: '26', display: '26' },
    { value: '27', display: '27' },
    { value: '28', display: '28' },
    { value: '29', display: '29' },
    { value: '30', display: '30' },
    { value: '31', display: '31' },
  ];
}
