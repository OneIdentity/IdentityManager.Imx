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

import { ImxTranslationProviderService } from 'qbm';
import { QerApiService } from '../qer-api-client.service';
import { OwnerControlService } from './owner-control.service';

describe('OwnerControlService', () => {
  let service: OwnerControlService;

  const qerApiServiceStub = {
    client: {
      portal_candidates_Person_get: jasmine.createSpy('portal_candidates_Person_get').and.returnValue(Promise.resolve([{}])),
    }
  };
  
  const translationProviderStub = {
    GetColumnDisplay: jasmine.createSpy('GetColumnDisplay')
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [
        OwnerControlService,
        {
          provide: QerApiService,
          useValue: qerApiServiceStub
        },
        {
          provide: ImxTranslationProviderService,
          useValue: translationProviderStub
        }
      ]
    });
  });

  beforeEach(() => {
    service = TestBed.inject(OwnerControlService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  describe('createGroupOwnerPersonEntityColumn() tests', () => {
    it('should return a fabricated IEntityColumn to represent a fk UID_Person property', () => {
      const grpOwnerPersonColumn = service.createGroupOwnerPersonCdr(false);
      expect(grpOwnerPersonColumn.column.ColumnName).toEqual('PersonColumnName');
      expect(grpOwnerPersonColumn.column.GetMetadata().GetFkRelations()[0].TableName).toEqual('Person');
    });
  });

});
