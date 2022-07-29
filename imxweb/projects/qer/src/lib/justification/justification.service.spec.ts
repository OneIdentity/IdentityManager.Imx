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

import { EntityService, ImxTranslationProviderService } from 'qbm';
import { QerApiService } from '../qer-api-client.service';
import { JustificationType } from './justification-type.enum';
import { JustificationService } from './justification.service';

describe('JustificationService', () => {
  let service: JustificationService;

  const collection = {
    Entities: []
  };

  const column = { ColumnName: 'some column name' };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [
        JustificationService,
        {
          provide: QerApiService,
          useValue: {
            client: {
              portal_justifications_get: jasmine.createSpy('portal_justifications_get').and.callFake(() => collection)
            }
          }
        },
        {
          provide: ImxTranslationProviderService,
          useValue: {
            GetTranslation: jasmine.createSpy('GetTranslation')
          }
        },
        {
          provide: EntityService,
          useValue: {
            createLocalEntityColumn: jasmine.createSpy('createLocalEntityColumn').and.returnValue(column)
          }
        }
      ]
    });
    service = TestBed.inject(JustificationService);
  });

  it('creates CDR', async () => {
    const type = JustificationType.approve;
    collection.Entities = [{ Columns: { JustificationType: { Value: type } } }];
    expect((await service.createCdr(type)).column.ColumnName).toEqual(column.ColumnName);
  });

  it('does not create CDR when there are no matching justification types', async () => {
    collection.Entities = [{ Columns: { JustificationType: { Value: JustificationType.approve } } }];
    expect(await service.createCdr(JustificationType.deny)).toBeUndefined();
  });
});
