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

import { QerApiService } from '../../../qer-api-client.service';
import { IdentityRoleMembershipsService } from './identity-role-memberships.service';


describe('IdentityRoleMembershipsService', () => {
  let service: IdentityRoleMembershipsService;

  const apiServiceStub = {
    typedClient: {
      PortalPersonRolemembershipsAerole: {
        GetSchema: jasmine.createSpy('GetSchema'),
        Get: jasmine.createSpy('Get')
      },
      PortalPersonRolemembershipsLocality: {
        GetSchema: jasmine.createSpy('GetSchema'),
        Get: jasmine.createSpy('Get')
      },
      PortalPersonRolemembershipsProfitcenter: {
        GetSchema: jasmine.createSpy('GetSchema'),
        Get: jasmine.createSpy('Get')
      },
      PortalPersonRolemembershipsDepartment: {
        GetSchema: jasmine.createSpy('GetSchema'),
        Get: jasmine.createSpy('Get')
      },
      PortalPersonRolemembershipsItshoporg: {
        GetSchema: jasmine.createSpy('GetSchema'),
        Get: jasmine.createSpy('Get')
      }
    }
  }

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [
        IdentityRoleMembershipsService,
        {
          provide: QerApiService,
          useValue: apiServiceStub
        }
      ]
    });
    service = TestBed.inject(IdentityRoleMembershipsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
