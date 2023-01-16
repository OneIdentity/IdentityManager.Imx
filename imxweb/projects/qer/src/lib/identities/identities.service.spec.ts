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
 * Copyright 2021 One Identity LLC.
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
import { IdentitiesService } from './identities.service';
import { CollectionLoadParameters } from 'imx-qbm-dbts';
import { IdentitesTestBed } from './test/identities-test-bed.spec';
import { QerApiService } from '../qer-api-client.service';
import { QerPermissionsService } from '../admin/qer-permissions.service';

describe('IdentitiesService', () => {
  let service: IdentitiesService;

  const mockQerApiService = {
    typedClient: {
      PortalPersonUid: {
        Get: jasmine.createSpy('Get').and.returnValue(Promise.resolve({ Data: ['uid1'] })),
      },
      PortalPersonAll: {
        Get: jasmine.createSpy('Get').and.returnValue(Promise.resolve({})),
      },
      PortalPersonReports: {
        Get: jasmine.createSpy('Get').and.returnValue(Promise.resolve({})),
      },
      PortalAdminPerson: {
        Get: jasmine.createSpy('Get').and.returnValue(Promise.resolve({ Data: ['test1'] })),
      },
      PortalPersonReportsInteractive: {
        Get_byid: jasmine.createSpy('Get_byid').and.returnValue(Promise.resolve({ Data: ['test1'] })),
      },
      PortalPersonReportsInteractive_byid: {
        Get_byid: jasmine.createSpy('Get_byid').and.returnValue(Promise.resolve({ Data: ['test1'] })),
      },
    },
    client: {
      portal_person_all_datamodel_get: jasmine.createSpy('portal_person_all_datamodel_get').and.returnValue({ Filters: [] }),
      portal_admin_person_delete: jasmine.createSpy('portal_admin_person_delete').and.returnValue({}),
    },
  };
  const navigationState: CollectionLoadParameters = { StartIndex: 1, PageSize: 50 };

  IdentitesTestBed.configureTestingModule({
    providers: [
      IdentitiesService,
      {
        provide: QerApiService,
        useValue: mockQerApiService,
      }
      ,
      {
        provide: QerPermissionsService,
        useValue: {
          isPersonAdmin: ()=> true
        }
      },
    ],
  });

  beforeEach(() => {
    service = TestBed.get(IdentitiesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('retrieves a certain person', async () => {
    mockQerApiService.typedClient.PortalPersonUid.Get.calls.reset;
    expect(await service.getPerson('uid1')).toBeDefined();
    expect(mockQerApiService.typedClient.PortalPersonUid.Get).toHaveBeenCalled();
  });

  it('retrieves all reports of a person', async () => {
    mockQerApiService.typedClient.PortalPersonReports.Get.calls.reset;
    expect(await service.getReportsOfManager(navigationState)).toBeDefined();
    expect(mockQerApiService.typedClient.PortalPersonReports.Get).toHaveBeenCalled();
  });

  it('retrieves persons details (as an admin)', async () => {
    mockQerApiService.typedClient.PortalAdminPerson.Get.calls.reset;
    expect(await service.getAdminPerson('test1')).toBeDefined();
    expect(mockQerApiService.typedClient.PortalAdminPerson.Get).toHaveBeenCalled();
  });

  it('retrieves persons details (as a manager)', async () => {
    mockQerApiService.typedClient.PortalPersonReportsInteractive.Get_byid.calls.reset;
    expect(await service.getPersonInteractive('test1')).toBeDefined();
    expect(mockQerApiService.typedClient.PortalPersonReportsInteractive_byid.Get_byid).toHaveBeenCalled();
  });

  it('retrieves the filter options for the identities', async () => {
    mockQerApiService.client.portal_person_all_datamodel_get.calls.reset;
    expect(await service.getDataModel()).toBeDefined();
    expect(mockQerApiService.client.portal_person_all_datamodel_get).toHaveBeenCalled();
  });
  it('makes a request to delete the given identity id', async () => {
    mockQerApiService.client.portal_admin_person_delete.calls.reset;
    expect(await service.deleteIdentity('test1')).toBeDefined();
    expect(mockQerApiService.client.portal_admin_person_delete).toHaveBeenCalledWith('test1');
  });
});
