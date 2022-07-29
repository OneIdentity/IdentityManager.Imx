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

import { AddressbookService } from './addressbook.service';
import { PortalPersonAll } from 'imx-api-qer';
import { PersonService } from '../person/person.service';

describe('AddressbookService', () => {
  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerTestingModule
      ],
      providers: [
        {
          provide: PersonService,
          useValue: {
            schemaPersonAll: { Columns: { name1: { ColumnName: 'name1' } } },
            schemaPersonUid: { Columns: { name1: { } } },
            getAll: jasmine.createSpy('getAll').and.returnValue(Promise.resolve({ Data: [] })),
            get: jasmine.createSpy('get').and.returnValue(Promise.resolve({ Data: [{ GetEntity: () => ({ GetColumn: __ => ({}) }) }] })),
            getDataModel: () => Promise.resolve({})
          }
        }
      ]
    });
  });

  it('should be created', () => {
    const service = TestBed.get(AddressbookService);
    expect(service).toBeDefined();
  });

  it('creates DataSourceWrapper', async () => {
    const columns = ['name1'];

    const service = TestBed.get(AddressbookService);

    const dstWrapper = await service.createDataSourceWrapper(columns);

    const dstSettings = await dstWrapper.getDstSettings();

    expect(dstSettings.displayedColumns[1].ColumnName).toEqual(columns[0]);
  });

  it('retrieves persons details', async () => {
    const personUid = 'some uid';
    const columns = ['name1'];

    const service = TestBed.get(AddressbookService);

    const detail = await service.getDetail({ GetEntity: () => ({ GetKeys: () => [personUid] }) } as PortalPersonAll, columns);

    expect(detail.columns.length).toEqual(columns.length);
    expect(detail.personUid).toEqual(personUid);
  });
});
