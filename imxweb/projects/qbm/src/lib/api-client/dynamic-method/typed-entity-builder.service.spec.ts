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

import { ApiClient, EntityCollectionData, EntityData, TypedEntity } from 'imx-qbm-dbts';
import { AppConfigService } from '../../appConfig/appConfig.service';
import { ImxTranslationProviderService } from '../../translation/imx-translation-provider.service';
import { MethodDescriptorService } from './method-descriptor.service';
import { TypedEntityBuilderService } from './typed-entity-builder.service';

describe('TypedEntityBuilderService', () => {
  let service: TypedEntityBuilderService;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AppConfigService,
          useValue: {
            client: {
              getSchema: jasmine.createSpy('getSchema').and.returnValue({
                FkCandidateRoutes: []
              })
            }
          }
        },
        {
          provide: MethodDescriptorService,
          useValue: {}
        },
        {
          provide: ImxTranslationProviderService,
          useValue: {}
        }
      ]
    });
    service = TestBed.inject(TypedEntityBuilderService);
  });

  it('should build ReadWriteEntities', () => {
    const data = {
      Entities: [{ Columns: { someColumn: {} } } as EntityData]
    } as EntityCollectionData;

    spyOn(Object, 'values').and.returnValue([]); // in ReadWriteEntity constructor

    const collection = service.buildReadWriteEntities({} as ApiClient, { type: class extends TypedEntity {}, path: '' }, data);

    expect(data.Entities.length).toEqual(collection.Data.length);
  });
});
