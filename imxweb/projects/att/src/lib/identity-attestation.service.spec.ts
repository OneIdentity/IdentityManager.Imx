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
import { Subject } from 'rxjs';

import { AttestationHistoryActionService } from './attestation-history/attestation-history-action.service';
import { AttestationHistoryService } from './attestation-history/attestation-history.service';
import { AttestationCasesService } from './decision/attestation-cases.service';
import { IdentityAttestationService } from './identity-attestation.service';

describe('IdentityAttestationService', () => {
  let service: IdentityAttestationService;

  const attestationService = new class {
    readonly countTotal = 2;
    readonly get = __ => Promise.resolve({ totalCount: this.countTotal, Data: [] });
  }();
  const attestationApprove = new class {
    readonly countForUser = 1;
    readonly getNumberOfPending = __ => Promise.resolve(this.countForUser);
  }();
  const attestationAction = { applied: new Subject() };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AttestationHistoryService,
          useValue: attestationService
        },
        {
          provide: AttestationCasesService,
          useValue: attestationApprove
        },
        {
          provide: AttestationHistoryActionService,
          useValue: attestationAction
        }
      ]
    });
    service = TestBed.inject(IdentityAttestationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('gets number of pending attestations for a user', async () => {
    const count = await service.getNumberOfPendingForUser({});
    expect(count.total).toEqual(attestationService.countTotal);
    expect(count.pendingTotal).toEqual(attestationService.countTotal);
    expect(count.pendingForUser).toEqual(attestationApprove.countForUser);
  });
});
