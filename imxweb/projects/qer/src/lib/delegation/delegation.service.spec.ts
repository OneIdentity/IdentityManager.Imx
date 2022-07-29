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
import { PortalDelegations } from 'imx-api-qer';
import { IEntity } from 'imx-qbm-dbts';
import { configureTestSuite } from 'ng-bullet';

import { QerApiService } from '../qer-api-client.service';
import { DelegationService } from './delegation.service';

describe('DelegationService', () => {
  let service: DelegationService;

  let commitSpy = jasmine.createSpy('Commit');

  const apiServiceStub = {
    typedClient: {
      PortalDelegations: {
        GetSchema: () => ({ Columns: [] }),
        createEntity: jasmine.createSpy('createEntity').and.returnValue({
          GetEntity: () => ({
            Commit: commitSpy
          }) as unknown as IEntity,
          ObjectKeyDelegated: { Value: '' }
        } as unknown as PortalDelegations)
      }
    }
  }

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [
        DelegationService,
        {
          provide: QerApiService,
          useValue: apiServiceStub
        }
      ]
    });
    service = TestBed.inject(DelegationService);
  });

  beforeEach(() => {
    apiServiceStub.typedClient.PortalDelegations.createEntity.calls.reset;
    commitSpy.calls.reset();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  for (const testcase of [
    {
      reference: {
        GetEntity: () => ({
          Commit: commitSpy
        }) as unknown as IEntity,
        ObjectKeyDelegated: { Value: '' }
      } as unknown as PortalDelegations,
      objectKeys: ['key1'],
      calls:1
    },
    {
      reference: {
        GetEntity: () => ({
          Commit: commitSpy
        }) as unknown as IEntity,
        ObjectKeyDelegated: { Value: '' }
      } as unknown as PortalDelegations,
      objectKeys: ['key1', 'key2'],
      calls:2
    }
  ]) {
    // TODO: Ist beim Upgrade auf Angular v11 kaputgegangrn. Reactivate
    // it(`can commit delegation for keys ${testcase.objectKeys}`, async () => {
    //   await service.commitDelegations(testcase.reference, testcase.objectKeys);
    //   expect(apiServiceStub.typedClient.PortalDelegations.createEntity).toHaveBeenCalledTimes(testcase.calls - 1);
    //   expect(commitSpy).toHaveBeenCalledTimes(testcase.calls);
    // });
  }

});
