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
import { EuiLoadingService } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';

import { IEntity } from 'imx-qbm-dbts';
import { PortalTermsofuse } from 'imx-api-qer';
import { AppConfigService, ElementalUiConfigService } from 'qbm';

import { TermsOfUseService } from './terms-of-use.service';
import { ProjectConfigurationService } from '../project-configuration/project-configuration.service';
import { QerApiService } from '../qer-api-client.service';

describe('TermsOfUseService', () => {
  let service: TermsOfUseService;

  const mockProjectConfigService = {
    getConfig: jasmine.createSpy('getConfig').and.returnValue(Promise.resolve({
      ITShopConfig: {
        StepUpAuthenticationProvider: 'NoAuth'
      }
    }))
  }
  
  const dummyCartUids = 'uid-123,uid-456';

  const termsOfUse1 = {
    display: 'termsOfUse1',
    key: 'termsOfUse1Key',
  };

  const termsOfUse2 = {
    display: 'termsOfUse2',
    key: 'termsOfUse2Key',
  };
  const termsOfUse3 = {
    display: 'termsOfUse3',
    key: 'termsOfUse3Key',
  };
  const termsOfUseList = [termsOfUse1, termsOfUse2, termsOfUse3];

  const portalTermsOfUseGetSpy = jasmine.createSpyObj('PortalTermsofuse', {
    Get: Promise.resolve({
      totalCount: termsOfUseList.length,
      Data: termsOfUseList.map(termsOfUse =>
      ({
        DisplayContent: { value: termsOfUse.display },
        GetEntity: () => (createEntity(termsOfUse))
      })
      ) as PortalTermsofuse[]
    })
  });

  const apiServiceStub =  {
    client: {
      portal_itshop_cart_accept_post: jasmine.createSpy('portal_itshop_cart_accept_post')
    },
    typedClient: {
      PortalTermsofuse: portalTermsOfUseGetSpy
    }
  }

  const busyServiceShowSpy = jasmine.createSpy('show');
  const busyServiceHideSpy = jasmine.createSpy('hide');

  function createEntity(item: { key: string, display: string }): IEntity {
    return {
      GetDisplay: () => item.display,
      GetKeys: () => [item.key]
    } as IEntity;
  }

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: QerApiService,
          useValue: apiServiceStub
        },
        {
          provide: EuiLoadingService,
          useValue: {
            show: busyServiceShowSpy,
            hide: busyServiceHideSpy
          }
        },
        {
          provide: ProjectConfigurationService,
          useValue: mockProjectConfigService
        },
        {
          provide: AppConfigService,
          useValue: {
            BaseUrl: ''
          }
        },
        {
          provide: ElementalUiConfigService,
          useValue: { 
            Config: jasmine.createSpy('Config').and.returnValue({ downloadOptions: {} })
          }
        }
      ]
    });
    service = TestBed.inject(TermsOfUseService);
  });

  beforeEach(() => {
    busyServiceShowSpy.calls.reset();
    busyServiceHideSpy.calls.reset();
    apiServiceStub.client.portal_itshop_cart_accept_post.calls.reset();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get the terms of use for the given uids', async () => {
    const dummyUids = ['uid-123'];

    await service.getTermsOfUse(dummyUids);

    expect(portalTermsOfUseGetSpy.Get).toHaveBeenCalled();
  });

  it('should accept the terms of use without an authentication', async () => {

    await service.acceptCartItemsWithoutAuthentication(dummyCartUids);

    expect(apiServiceStub.client.portal_itshop_cart_accept_post).toHaveBeenCalledWith(dummyCartUids);
  });

});
