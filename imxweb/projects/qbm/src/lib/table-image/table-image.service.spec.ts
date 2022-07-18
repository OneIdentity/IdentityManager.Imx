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

import { TestBed, inject } from '@angular/core/testing';
import { configureTestSuite } from 'ng-bullet';

import { TableImageService } from './table-image.service';

describe('TableImageService', () => {
  const imageId = 'QBM-a486f0eabf674392bbbdf8572453258c';
  const cssClassDefaultSize = 'imx-table-QBM-a486f0eabf674392bbbdf8572453258c';
  const cssClassLargeSize = 'imx-table-QBM-a486f0eabf674392bbbdf8572453258c-large';
  const cssClassDefaultIconDefaultSize = 'imx-table-QBM-1650955B496E4A3E959A46569B0F7D85';
  const cssClassDefaultIconLargeSize = 'imx-table-QBM-1650955B496E4A3E959A46569B0F7D85-large';

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [TableImageService]
    });
  });

  it('should be created', inject([TableImageService], (service: TableImageService) => {
    expect(service).toBeTruthy();
  }));

  it('should return a valid CSS class (default image size)', inject([TableImageService], (service: TableImageService) => {
    expect(service.getCss(imageId)).toEqual(cssClassDefaultSize);
  }));

  it('should return a valid CSS class (large image size)', inject([TableImageService], (service: TableImageService) => {
    expect(service.getCss(imageId, true)).toEqual(cssClassLargeSize);
  }));

  it('should return the CSS class of the default image (default image size)', inject([TableImageService], (service: TableImageService) => {
    expect(service.getDefaultCss()).toEqual(cssClassDefaultIconDefaultSize);
  }));

  it('should return the CSS class of the default image (large image size)', inject([TableImageService], (service: TableImageService) => {
    expect(service.getDefaultCss(true)).toEqual(cssClassDefaultIconLargeSize);
  }));

});
