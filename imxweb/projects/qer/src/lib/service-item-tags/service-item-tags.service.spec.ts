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
import { LoggerTestingModule } from 'ngx-logger/testing';
import { QerApiService } from '../qer-api-client.service';

import { ServiceItemTagsService } from './service-item-tags.service';

describe('ServiceItemTagsService', () => {

  const mockTagData = [
    { Ident_DialogTag: { value: 'tag1' },  GetEntity: () => ({ GetKeys: () => ['uid1'] }) },
    { Ident_DialogTag: { value: 'tag2' },  GetEntity: () => ({ GetKeys: () => ['uid2'] }) }
  ];

  const imxSessionStub = {
    typedClient: {
      PortalServiceitemsTags: jasmine.createSpyObj('PortalServiceitemsTags', {
        Get: Promise.resolve({
          totalCount: mockTagData.length,
          Data: mockTagData
        })
      })
    },
    client: {
      portal_serviceitems_tags_add_post: jasmine.createSpy('portal_serviceitems_tags_add_post'),
      portal_serviceitems_tags_delete: jasmine.createSpy('portal_serviceitems_tags_delete')
    }
  }

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [LoggerTestingModule],
      providers: [
        {
          provide: QerApiService,
          useValue: imxSessionStub
        }]
    })
  });

  beforeEach(() => {
    imxSessionStub.client.portal_serviceitems_tags_add_post.calls.reset();
    imxSessionStub.client.portal_serviceitems_tags_delete.calls.reset();
  })

  it('should be created', () => {
    const service: ServiceItemTagsService = TestBed.get(ServiceItemTagsService);
    expect(service).toBeTruthy();
  });

  it('fetches tags', async () => {
    const service: ServiceItemTagsService = TestBed.get(ServiceItemTagsService);
    const tags = await service.getTags('uidAccProduct');
    expect(tags.Data.length).toBe(mockTagData.length);
  });

  [
    { tagsAdded: ['addTag','addTag2'], tagsDeleted: ['tag1', 'tag2'], addCalls: 2, delCalls: 2 },
    { tagsAdded: [], tagsDeleted: ['tag1'], addCalls: 0, delCalls: 1 },
    { tagsAdded: ['addTag'], tagsDeleted: [], addCalls: 1, delCalls: 0 },
    { tagsAdded: ['tag1'], tagsDeleted: ['delTag'], addCalls: 0, delCalls: 0 }
  ].forEach(testcase =>
    it('can update tags', async () => {
      const service: ServiceItemTagsService = TestBed.get(ServiceItemTagsService);
      await service.updateTags('uidAccProduct', testcase.tagsAdded, testcase.tagsDeleted);

      expect(imxSessionStub.client.portal_serviceitems_tags_add_post).toHaveBeenCalledTimes(testcase.addCalls);
      expect(imxSessionStub.client.portal_serviceitems_tags_delete).toHaveBeenCalledTimes(testcase.delCalls);

    })
  );

});
