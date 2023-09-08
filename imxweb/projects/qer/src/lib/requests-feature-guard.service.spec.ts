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

import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { QerApiService } from './qer-api-client.service';
import { RequestsFeatureGuardService } from './requests-feature-guard.service';
import { StartComponent } from './wport/start/start.component';

describe('RequestsFeatureGuardService', () => {
  let service: RequestsFeatureGuardService;

  const sessionServiceStub = {
    client: {
      portal_person_config_get: jasmine.createSpy('portal_person_config_get').and.returnValue(Promise.resolve([{}])),
    }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([{ path: '', component: StartComponent }])],
      providers: [
        {
          provide: QerApiService,
          useValue: sessionServiceStub
        }
      ]
    });
    service = TestBed.inject(RequestsFeatureGuardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
