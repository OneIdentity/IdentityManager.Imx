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

import { ServiceCategoriesService } from './service-categories.service';
import { ImxTranslationProviderService } from 'qbm';
import { QerApiService } from '../qer-api-client.service';
import { IEntity, MultiLanguageStringData } from 'imx-qbm-dbts';
import { PortalServicecategories } from 'imx-api-qer';

describe('ServiceCategoriesService', () => {
  const mockSc = [];

  function createEntity(key?: string): IEntity {
    return {
      GetDisplay: () => undefined,
      GetKeys: () => [key],
      Commit: () => { },
      DiscardChanges: () => { }
    } as IEntity
  }

  const sessionServiceStub = {
    client: {
      portal_servicecategories_delete: jasmine.createSpy('portal_servicecategories_delete').and.returnValue(Promise.resolve({})),
    },
    typedClient: {
      PortalServicecategories: jasmine.createSpyObj('PortalServicecategories', {
        Get: Promise.resolve({
          totalCount: mockSc.length,
          Data: mockSc
        }),
        Post:  Promise.resolve({
          totalCount: mockSc.length,
          Data: mockSc
        }),
        createEntity: Promise.resolve(mockSc),
      }),
      PortalServicecategoriesInteractive: jasmine.createSpyObj('PortalServicecategoriesInteractive', {
        Get_byid: Promise.resolve({
          totalCount: mockSc.length,
          Data: mockSc
        }),
      }),
      PortalCandidatesAccproductparamcategory: jasmine.createSpyObj('PortalCandidatesAccproductparamcategory', {
        Get: Promise.resolve({
          totalCount: mockSc.length,
          Data: mockSc
        })
      }),
    }
  };

  const translationProviderStub =  {
    GetTranslation: jasmine.createSpy('GetTranslation').and.callFake((object: MultiLanguageStringData) => object.Key)
  }

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: QerApiService,
          useValue: sessionServiceStub
        },
        {
          provide: ImxTranslationProviderService,
          useValue: translationProviderStub
        }
      ]
    });
  });

  beforeEach(() => {
    sessionServiceStub.typedClient.PortalServicecategories.Get.calls.reset();
  });

  it('provides service categories', async () => {
    const service: ServiceCategoriesService = TestBed.get(ServiceCategoriesService);
    const sc = await service.get();
    expect(sessionServiceStub.typedClient.PortalServicecategories.Get).toHaveBeenCalled();
    expect(sc.Data.length).toEqual(mockSc.length);
  });

  it('checks if AccProductParamCategories exists ', async () => {
    const service: ServiceCategoriesService = TestBed.get(ServiceCategoriesService);    
    await service.hasAccproductparamcategoryCandidates();

    expect(sessionServiceStub.typedClient.PortalCandidatesAccproductparamcategory.Get).toHaveBeenCalledWith({ PageSize: -1});
  });

  it('creating a service category ', () => {
    const service: ServiceCategoriesService = TestBed.get(ServiceCategoriesService);
    service.createEntity();

    expect(sessionServiceStub.typedClient.PortalServicecategories.createEntity).toHaveBeenCalled();
  });

  it('creating (PUT) a service category ', async () => {
    const service: ServiceCategoriesService = TestBed.get(ServiceCategoriesService);

    const portalServiceCategory = new class {
      GetEntity = () => createEntity('uid');
    }() as PortalServicecategories;

    await service.create(portalServiceCategory);

    expect(sessionServiceStub.typedClient.PortalServicecategories.Post).toHaveBeenCalledWith(portalServiceCategory);
  });

  it('deleting a service category', async () => {
    const service: ServiceCategoriesService = TestBed.get(ServiceCategoriesService);
    await service.delete('uid');

    expect(sessionServiceStub.client.portal_servicecategories_delete).toHaveBeenCalled();
  });
});
