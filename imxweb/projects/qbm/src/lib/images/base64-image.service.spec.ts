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
import * as TypeMoq from 'typemoq';

import { Base64ImageService } from './base64-image.service';
import { IWriteValue } from 'imx-qbm-dbts';

describe('Base64ImageService', () => {


  it('should be created', () => {
    const service: Base64ImageService = TestBed.get(Base64ImageService);
    expect(service).toBeTruthy();
  });

  [
    { description: 'null image', image: null, expect: { hasImage: false, data: '' } },
    { description: 'empty image', image: '', expect: { hasImage: false, data: '' } },
    { description: 'image', image: '5642', expect: { hasImage: true, data: 'data:image/png;base64,5642' } },
  ].forEach(testcase =>
    it(`can handle an image with ${testcase.description}`, () => {
      // Arrange
      const service: Base64ImageService = TestBed.get(Base64ImageService);
      const writeValueMock = TypeMoq.Mock.ofType<IWriteValue<string>>();
      writeValueMock.setup(wm => wm.value).returns(() => testcase.image);


      // Act & Assert
      expect(service.getImageUrl(writeValueMock.object)).toBe(testcase.expect.data);
    }));


  [
    { description: 'null url', image: null, expect: '' },
    { description: 'empty url', image: '', expect: '' },
    { description: 'url', image: '5642', expect: '5642' },
    { description: 'url', image: 'data:image/png;base64,5642', expect: '5642' },
  ].forEach(testcase =>
    it(`can handle an url with ${testcase.description}`, () => {
      // Arrange
      const service: Base64ImageService = TestBed.get(Base64ImageService);

      // Act & Assert
      expect(service.getImageData(testcase.image)).toBe(testcase.expect);
    }));
});
