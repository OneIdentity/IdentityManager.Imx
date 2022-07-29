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

import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { configureTestSuite } from 'ng-bullet';

import { AppConfigService } from 'qbm';
import { AttestationPoliciesGuardService } from './attestation-policies-guard.service';
import { PermissionsService } from '../admin/permissions.service';

@Component({
  template: `<div>Dummy</div>`
})
class DummyComponent {
}

describe('AttestationPolicyGuardService', () => {
  let service: AttestationPoliciesGuardService;

  let canSeeAttestationPolicies = false;

  const attPermissionsServiceStub = {
    canSeeAttestationPolicies: jasmine.createSpy('canSeeAttestationPolicies').and.callFake(() => canSeeAttestationPolicies)
  };


  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        DummyComponent
      ],
      imports: [
        RouterTestingModule.withRoutes([
          { path: 'dashboard', component: DummyComponent }
        ])],
      providers: [
        AttestationPoliciesGuardService,
        {
          provide: PermissionsService,
          useValue: attPermissionsServiceStub,
        },
        {
          provide: AppConfigService,
          useValue: {
            Config: {
              Title: '',
              routeConfig: {
                start: 'dashboard'
              }
            }
          }
        },
      ],
    });
  });


  beforeEach(() => {
    service = TestBed.inject(AttestationPoliciesGuardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('canActivate() should return true if user can see attestation policies', async () => {
    canSeeAttestationPolicies = true;

    const val = await service.canActivate();

    expect(val).toEqual(true);
  });

  it("canActivate() should return false if user can't see attestation policies", async () => {
    canSeeAttestationPolicies = false;

    const val = await service.canActivate();

    expect(val).toEqual(false);
  });
});
