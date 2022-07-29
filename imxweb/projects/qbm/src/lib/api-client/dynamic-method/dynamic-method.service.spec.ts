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

import { ApiClient, TypedEntity } from 'imx-qbm-dbts';
import { DynamicMethodService } from './dynamic-method.service';
import { MethodDescriptorService } from './method-descriptor.service';
import { TypedEntityBuilderService } from './typed-entity-builder.service';

describe('DynamicMethodService', () => {
  let service: DynamicMethodService;

  const methodDescriptor = {
    get: jasmine.createSpy('get'),
    delete: jasmine.createSpy('delete')
  };

  const typedEntityBuilder = new class {
    readonly data = [{}];
    readonly buildReadWriteEntities = jasmine.createSpy('buildReadWriteEntities').and.returnValue({
      totalCount: this.data.length,
      Data: this.data
    });
  }();

  const apiClient = {
    processRequest: jasmine.createSpy('processRequest')
  } as ApiClient;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: MethodDescriptorService,
          useValue: methodDescriptor
        },
        {
          provide: TypedEntityBuilderService,
          useValue: typedEntityBuilder
        }
      ]
    });
    service = TestBed.inject(DynamicMethodService);
  });

  beforeEach(() => {
    methodDescriptor.get.calls.reset();
    typedEntityBuilder.buildReadWriteEntities.calls.reset();
  });

  it('should get ExtendedTypedEntityCollection', async () => {
    const collection = await service.get(apiClient, { type: class extends TypedEntity {}, path: '' });

    expect(methodDescriptor.get).toHaveBeenCalled();

    expect(typedEntityBuilder.buildReadWriteEntities).toHaveBeenCalled();

    expect(collection.Data.length).toEqual(typedEntityBuilder.data.length);
  });

  it('should delete', async () => {
    await service.delete(apiClient, '', {});

    expect(methodDescriptor.delete).toHaveBeenCalled();
  });
});
