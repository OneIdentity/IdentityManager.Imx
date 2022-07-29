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

import { GroupsService } from './groups.service';
import { CollectionLoadParameters, CompareOperator, FilterType } from 'imx-qbm-dbts';
import { TsbTestBed } from '../test/tsb-test-bed.spec';
import { TsbApiService } from '../tsb-api-client.service';
import { TargetSystemDynamicMethodService } from '../target-system/target-system-dynamic-method.service';

describe('GroupsService', () => {
  let service: GroupsService;

  const serviceItemCommitSpy = jasmine.createSpy('Commit');

  const mockTsbApiService = {
    typedClient: {
      PortalTargetsystemUnsGroup: {
        Get: jasmine.createSpy('Get').and.returnValue(Promise.resolve({})),
      },
      PortalTargetsystemAdsgroup: {
        Get: jasmine.createSpy('Get').and.returnValue(Promise.resolve({ Data: [{}] })),
      },
      PortalTargetsystemUnsGroupServiceitem: {
        Get: jasmine.createSpy('Get').and.returnValue(Promise.resolve({
          Data: [{
            UID_OrgRuler: { value: 'ruler' },
            GetEntity: () => ({
              Commit: serviceItemCommitSpy
            })
          }]
        })),
      },
      PortalAdsgroupMemberships: {
        Get: jasmine.createSpy('Get').and.returnValue(Promise.resolve({ Data: [] })),
      },
      PortalTargetsystemUnsDirectmembers: {
        Get: jasmine.createSpy('Get').and.returnValue(Promise.resolve({ Data: [] })),
      },
      PortalTargetsystemUnsNestedmembers: {
        Get: jasmine.createSpy('Get').and.returnValue(Promise.resolve({ Data: [] })),
      },
      PortalTargetsystemUnsGroupmembers: {
        Get: jasmine.createSpy('Get').and.returnValue(Promise.resolve({ Data: [] })),
      },
    },
    client: {
      portal_targetsystem_uns_group_datamodel_get: jasmine
        .createSpy('portal_targetsystem_uns_group_datamodel_get')
        .and.returnValue({ Filters: [] }),
      portal_targetsystem_uns_group_serviceitem_bulk_put: jasmine
        .createSpy('portal_targetsystem_uns_group_serviceitem_bulk_put')
        .and.returnValue(Promise.resolve()),
      portal_targetsystem_uns_group_filtertree_get: jasmine
        .createSpy('portal_targetsystem_uns_group_filtertree_get')
        .and.returnValue({ Elements: [] })
    },
    apiClient: {
      processRequest: jasmine.createSpy('processRequest').and.returnValue(Promise.resolve({ TotalCount: 0, Entities: [{ Name: '111' }] }))
    }
  };

  const dynamicMethod = {
    get: jasmine.createSpy('get').and.returnValue({})
  };

  let navigationState: CollectionLoadParameters = { StartIndex: 1, PageSize: 50 };

  const mockAccProductFilter = {
    ColumnName: 'UID_AccProduct',
    Type: FilterType.Compare,
    CompareOp: CompareOperator.Equal,
    Value1: 'testAccProdId',
  };

  TsbTestBed.configureTestingModule({
    providers: [
      GroupsService,
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
    service = TestBed.inject(GroupsService);
    navigationState = { StartIndex: 1, PageSize: 50 };
    serviceItemCommitSpy.calls.reset();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('retrieves the groups', async () => {
    mockTsbApiService.typedClient.PortalTargetsystemUnsGroup.Get.calls.reset;
    expect(await service.getGroups(navigationState)).toBeDefined();
    expect(mockTsbApiService.typedClient.PortalTargetsystemUnsGroup.Get).toHaveBeenCalled();
  });

  it('retrieves group details', async () => {
    mockTsbApiService.typedClient.PortalTargetsystemAdsgroup.Get.calls.reset;
    expect(await service.getGroupDetails({ TableName: 'adsgroup', Keys: ['testGroupId'] })).toBeDefined();
  });

  it('retrieves the specific groupServiceItem', async () => {
    mockTsbApiService.typedClient.PortalTargetsystemUnsGroupServiceitem.Get.calls.reset;
    expect(await service.getGroupServiceItem('testAccProdId')).toBeDefined();
    const expectedParams = { filter: [mockAccProductFilter] };
    expect(mockTsbApiService.typedClient.PortalTargetsystemUnsGroupServiceitem.Get).toHaveBeenCalledWith(expectedParams);
  });

  it('retrieves the direct group members', async () => {
    mockTsbApiService.typedClient.PortalTargetsystemUnsDirectmembers.Get.calls.reset;
    expect(await service.getGroupDirectMembers('testGroupId', {})).toBeDefined();
    expect(mockTsbApiService.typedClient.PortalTargetsystemUnsDirectmembers.Get).toHaveBeenCalledWith('testGroupId', {});
  });

  it('retrieves the nested group members', async () => {
    mockTsbApiService.typedClient.PortalTargetsystemUnsNestedmembers.Get.calls.reset;
    expect(await service.getGroupNestedMembers('testGroupId', {})).toBeDefined();
    expect(mockTsbApiService.typedClient.PortalTargetsystemUnsNestedmembers.Get).toHaveBeenCalledWith('testGroupId', {});
  });

  it('retrieves the groups group members', async () => {
    mockTsbApiService.typedClient.PortalTargetsystemUnsGroupmembers.Get.calls.reset;
    expect(await service.getGroupsGroupMembers('testGroupId', navigationState)).toBeDefined();
    expect(mockTsbApiService.typedClient.PortalTargetsystemUnsGroupmembers.Get).toHaveBeenCalledWith('testGroupId', navigationState);
  });

  it('retrieves the filter options for the groups', async () => {
    mockTsbApiService.client.portal_targetsystem_uns_group_datamodel_get.calls.reset;
    expect(await service.getFilterOptions(true)).toBeDefined();
    expect(mockTsbApiService.client.portal_targetsystem_uns_group_datamodel_get).toHaveBeenCalled();
  });

  describe('updateMultipleOwner() tests', () => {
    it('should update owner with role', async () => {
      const res = await service.updateMultipleOwner(['key1'], { uidRole: 'role' });
      expect(serviceItemCommitSpy).toHaveBeenCalled();
      expect(res).toEqual('#LDS#The product owner has been successfully assigned.');
    });

    it('should update owner with identity', async () => {
      const res = await service.updateMultipleOwner(['key1'], { uidPerson: 'person' });
      expect(serviceItemCommitSpy).toHaveBeenCalled();
      expect(res).toEqual('#LDS#The product owner has been successfully assigned. It may take some time for the changes to take effect.');
    });
  });

  describe('bulkUpdateGroupServiceItems() tests', () => {
    it('should make the relevant api call with the updateData', async () => {
      const mockUpdateData = { Keys: [['test-key']], Data: [{ Name: 'IsInActive', Value: true }] };
      await service.bulkUpdateGroupServiceItems(mockUpdateData);
      expect(mockTsbApiService.client.portal_targetsystem_uns_group_serviceitem_bulk_put).toHaveBeenCalledWith(mockUpdateData);
    });
  });
});
