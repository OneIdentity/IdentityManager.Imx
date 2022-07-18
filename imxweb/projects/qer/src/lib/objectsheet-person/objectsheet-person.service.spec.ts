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
import { LoggerTestingModule } from 'ngx-logger/testing';
import { configureTestSuite } from 'ng-bullet';

import { ObjectsheetPersonService } from './objectsheet-person.service';
import { PersonService } from '../person/person.service';
import { PortalPersonUid } from 'imx-api-qer';
import { TypedEntityCollectionData, TypedEntity, MultiLanguageStringData } from 'imx-qbm-dbts';
import { ImxTranslationProviderService } from 'qbm';
import { QerApiService } from '../qer-api-client.service';

describe('ObjectsheetPersonService', () => {
  let service: ObjectsheetPersonService;

  const existingItem = {
    GetEntity: () => ({
      GetDisplay: () => 'some to remove',
      GetKeys: () => ['0']
    })
  } as TypedEntity;

  let personUidMock = [existingItem];

  const personServiceGetSpy = jasmine.createSpy('get').and.returnValue(
    Promise.resolve({
      tableName: '',
      totalCount: 1,
      Data: personUidMock
    } as TypedEntityCollectionData<PortalPersonUid>));

  const personServiceStub = {
    get: personServiceGetSpy
  };

  const getTranslationSpy = jasmine.createSpy('GetTranslation').and.callFake((object: MultiLanguageStringData) => object.Key);

  const qerApiServiceStub = {
    typedClient: {
      PortalDelegations: {
        Get: jasmine.createSpy('Get')
      },
      PortalItshopRequests: {
        Get: jasmine.createSpy('Get')
      }
    }
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [LoggerTestingModule],
      providers: [
        {
          provide: PersonService,
          useValue: personServiceStub
        },
        {
          provide: ImxTranslationProviderService,
          useValue: {
            GetTranslation: getTranslationSpy
          }
        },
        {
          provide: QerApiService,
          useValue: qerApiServiceStub
        },
      ]
    });
    service = TestBed.inject(ObjectsheetPersonService);
  });

  beforeEach(() => { 
    personServiceGetSpy.calls.reset();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return the Person by the uid', () => {
    // Arrange
    const uid = 'uid-123';

    // Act
    const person = service.getPerson(uid);

    // Assert
    expect(person).not.toBeNull();
    expect(personServiceGetSpy).toHaveBeenCalled();
  });
});
