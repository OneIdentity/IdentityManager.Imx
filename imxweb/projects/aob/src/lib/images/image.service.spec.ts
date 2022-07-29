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
import { DomSanitizer } from '@angular/platform-browser';
import { configureTestSuite } from 'ng-bullet';

import { ImageService } from './image.service';
import { QerApiService } from 'qer';

describe('ImageService', () => {
  let imageData: Blob;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: QerApiService,
          useValue: {
            client: {
                portal_person_image_get: jasmine.createSpy('portal_person_image_get').and.callFake(() => Promise.resolve(imageData))
            }
          }
        },
        {
          provide: DomSanitizer,
          useValue: {
            sanitize: () => 'safeString',
            bypassSecurityTrustUrl: value => value
          }
        }
      ]
    });
  });

  beforeEach(() => {
    imageData = new Blob(['test'], { type: 'image/png' });
  });

  it('should be created', () => {
    const service: ImageService = TestBed.get(ImageService);
    expect(service).toBeDefined();
  });

  it('can get an image', async () => {
    const service: ImageService = TestBed.get(ImageService);
    expect(await service.getPersonImageUrl('uid')).toContain('blob:http');
  });

  it('image null - emtpy string', async () => {
    imageData = null;
    const service: ImageService = TestBed.get(ImageService);
    expect(await service.getPersonImageUrl('uid')).toBeFalsy();
  });
});
