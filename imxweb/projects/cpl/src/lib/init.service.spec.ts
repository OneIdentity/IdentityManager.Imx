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
import { Router, RouterModule } from '@angular/router';
import { configureTestSuite } from 'ng-bullet';
import { ExtService } from 'qbm';
import { IdentityRoleMembershipsService } from 'qer';
import { ApiService } from './api.service';
import { InitService } from './init.service';
import { RoleComplianceViolationsService } from './role-compliance-violations/role-compliance-violations.service';

describe('InitService', () => {
  let service: InitService;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterModule
      ],
      providers: [
        {
          provide: ExtService,
          useValue: {
            register: () => { }
          }
        },
        {
          provide: Router,
          useValue: {}
        },
        {
          provide: RoleComplianceViolationsService,
          useValue: {
            getRoleComplianceViolations: jasmine.createSpy('getRoleComplianceViolations').and
              .returnValue(Promise.resolve({}))
          }
        },
        {
          provide: ApiService,
          useValue: {}
        },
        {
          provide: IdentityRoleMembershipsService,
          useValue: {}
        }
      ]
    });
    service = TestBed.inject(InitService);
  });


  it('is defined', async () => {

    expect(service).toBeDefined();
  });
});
