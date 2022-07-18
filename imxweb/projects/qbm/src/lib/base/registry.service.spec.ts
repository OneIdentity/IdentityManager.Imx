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
import * as TypeMoq from 'typemoq';

import { IExtension } from '../ext/extension';
import { RegistryService } from './registry.service';

describe('RegistryService', () => {

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [RegistryService]
    });
  });

  it('should be created', inject([RegistryService], (service: RegistryService<IExtension>) => {
    expect(service).toBeDefined();
  }));

  it('should be created', inject([RegistryService], (service: RegistryService<IExtension>) => {
    // register an extension
    const extMock = TypeMoq.Mock.ofType<IExtension>();
    service.register('123', extMock.object);
    expect(service.Registry['123'].length).toBe(1);

    // register another extension
    service.register('456', extMock.object);
    expect(service.Registry['456'].length).toBe(1);

    // register the same extension twice, doesn't increase the count
    const extMock2 = TypeMoq.Mock.ofType<IExtension>();
    service.register('456', extMock2.object);
  }));
});
