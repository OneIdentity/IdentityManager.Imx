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
import { EuiLoadingService } from '@elemental-ui/core';

import { PortalRulesViolations } from 'imx-api-cpl';
import { configureTestSuite } from 'ng-bullet';

import { ClassloggerService } from 'qbm';
import { ApiService } from '../api.service';

import { RulesViolationsService } from './rules-violations.service';

describe('RulesViolationsService', () => {
  let service: RulesViolationsService;

  const testHelper = {
    cplClientStub: {
      typedClient: {
        PortalRulesViolations: {
          GetSchema: () => PortalRulesViolations.GetEntitySchema(),
        }
      },
      client: {
        portal_rules_violations_post: jasmine.createSpy('portal_rules_violations_post'),
        portal_rules_violations_datamodel_get: jasmine.createSpy('portal_rules_violations_datamodel_get'),
        portal_rules_violations_group_get: jasmine.createSpy('portal_rules_violations_group_get')
      }
    },

    euiLoadingServiceStub: {
      hide: jasmine.createSpy('hide'),
      show: jasmine.createSpy('show')
    }
  }

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ApiService,
          useValue: testHelper.cplClientStub
        },
        {
          provide: ClassloggerService,
          useValue: {
            debug: jasmine.createSpy('debug').and.callThrough()
          }
        },
        {
          provide: EuiLoadingService,
          useValue: testHelper.euiLoadingServiceStub
        },
      ]
    });
    service = TestBed.inject(RulesViolationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
