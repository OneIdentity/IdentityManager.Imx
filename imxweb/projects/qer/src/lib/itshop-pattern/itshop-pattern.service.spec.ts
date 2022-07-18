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

import { PortalItshopPatternAdmin } from 'imx-api-qer';

import { ClassloggerService, SnackBarService } from 'qbm';
import { QerApiService } from '../qer-api-client.service';
import { ItshopPatternService } from './itshop-pattern.service';

const commitSpy = jasmine.createSpy('Commit');

function createPattern(uid: string): PortalItshopPatternAdmin {
  return {
    GetEntity: () => ({
      GetKeys: () => [uid],
      GetDisplayLong: () => 'longDisplay',
      GetColumn: () => ({ GetValue: () => ({}) }),
      Commit: commitSpy
    }),
    IsPublicPattern: {
      value: true
    },
  } as any as PortalItshopPatternAdmin;
}

describe('ItshopPatternService', () => {
  let service: ItshopPatternService;

  const uid = 'uid-123456';

  const euiLoadingServiceStub = {
    hide: jasmine.createSpy('hide'),
    show: jasmine.createSpy('show')
  };

  const pattern = createPattern(uid);

  const qerApiServiceStub = {
    typedClient: {
      PortalItshopPatternAdmin: {
        Get: jasmine.createSpy('Get').and.stub(),
        Post: jasmine.createSpy('Post').and.returnValue(Promise.resolve({ Data: [{}] })),
        GetSchema: jasmine.createSpy('GetSchema'),
      },
      PortalItshopPatternPrivate: {
        Get: jasmine.createSpy('Get').and.returnValue(Promise.resolve({ Data: [pattern] })),
        Post: jasmine.createSpy('Post').and.returnValue(Promise.resolve({ Data: [{}] })),
        GetSchema: jasmine.createSpy('GetSchema'),
      }
    },
    v2Client: {
      portal_itshop_pattern_copy_post: jasmine.createSpy('portal_itshop_pattern_copy_post').and.callFake(() => Promise.resolve([])),
      portal_itshop_pattern_private_delete: jasmine.createSpy('portal_itshop_pattern_private_delete').and.callFake(() => Promise.resolve([]))
    }
  }

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ClassloggerService,
          useValue: {
            debug: jasmine.createSpy('debug').and.callThrough(),
            trace: jasmine.createSpy('trace').and.callThrough()
          }
        },
        {
          provide: EuiLoadingService,
          useValue: euiLoadingServiceStub
        },
        {
          provide: SnackBarService,
          useValue: {
            open: jasmine.createSpy('open')
          }
        },
        {
          provide: QerApiService,
          useValue: qerApiServiceStub
        }
      ]
    });
    service = TestBed.inject(ItshopPatternService);
  });

  afterEach(() => {
    commitSpy.calls.reset();
    qerApiServiceStub.v2Client.portal_itshop_pattern_private_delete.calls.reset();
  })

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('GET itshopPatternAdminSchema() tests', () => {
    it('should return the public pattern schema', async () => {
      qerApiServiceStub.typedClient.PortalItshopPatternAdmin.GetSchema.calls.reset();
      service.itshopPatternAdminSchema;
      expect(qerApiServiceStub.typedClient.PortalItshopPatternAdmin.GetSchema).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET itshopPatternPrivateSchema() tests', () => {
    it('should return the private pattern schema', async () => {
      qerApiServiceStub.typedClient.PortalItshopPatternPrivate.GetSchema.calls.reset();
      service.itshopPatternPrivateSchema;
      expect(qerApiServiceStub.typedClient.PortalItshopPatternPrivate.GetSchema).toHaveBeenCalledTimes(1);
    });
  });

  it('provides public patterns', async () => {
    const sc = await service.getPublicPatterns();
    expect(qerApiServiceStub.typedClient.PortalItshopPatternAdmin.Get).toHaveBeenCalled();
  });

  it('provides private patterns', async () => {
    const sc = await service.getPrivatePatterns();
    expect(qerApiServiceStub.typedClient.PortalItshopPatternPrivate.Get).toHaveBeenCalled();
  });

  it('provides a single private patterns', async () => {
    const sc = await service.getPrivatePattern(uid);
    expect(qerApiServiceStub.typedClient.PortalItshopPatternPrivate.Get).toHaveBeenCalled();
  });

  it('creates a private copy of an existing pattern', async () => {
    await service.createCopy(uid);

    expect(qerApiServiceStub.v2Client.portal_itshop_pattern_copy_post).toHaveBeenCalledOnceWith(uid);
  });

  it('deletes a pattern', async () => {
    await service.delete([pattern]);

    expect(qerApiServiceStub.v2Client.portal_itshop_pattern_private_delete).toHaveBeenCalledOnceWith(uid);
  });

  it('deletes a list of patterns', async () => {
    const pattern1 = createPattern('uid-1');
    const pattern2 = createPattern('uid-2');
    const pattern3 = createPattern('uid-23');
    await service.delete([pattern1, pattern2, pattern3]);

    expect(qerApiServiceStub.v2Client.portal_itshop_pattern_private_delete).toHaveBeenCalledTimes(3);
  });


  it('toggle the publicPattern value of a pattern', async () => {
    await service.togglePublic(uid);

    expect(commitSpy).toHaveBeenCalledOnceWith(false);
  });

  it('toggle the publicPattern value of a pattern', async () => {
    await service.makePublic([pattern], true);

    expect(commitSpy).toHaveBeenCalledOnceWith(false);
  });
});
