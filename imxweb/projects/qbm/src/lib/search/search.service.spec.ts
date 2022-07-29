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
import { Router } from '@angular/router';
import { ErrorHandler } from '@angular/core';
import { configureTestSuite } from 'ng-bullet';
import * as TypeMoq from 'typemoq';

import { IEntity, DbObjectKey, IReadValue } from 'imx-qbm-dbts';
import { OpsupportSearchIndexedtables } from 'imx-api-qbm';
import { imx_QBM_SearchService } from './search.service';
import { imx_SessionService } from '../session/imx-session.service';

function CreateIReadValue<T>(value: T): IReadValue<T> {
  const readValueMock = TypeMoq.Mock.ofType<IReadValue<T>>();
  readValueMock.setup((readValue: IReadValue<T>) => readValue.value).returns(() => value);
  return readValueMock.object;
}

describe('imx_QBM_SearchService', () => {
  let svc: imx_QBM_SearchService;
  const sessionServiceSpy = {
    Client: {
      opsupport_search_get: jasmine.createSpy('opsupport_search_get').and.returnValue(Promise.resolve([
        { Key: new DbObjectKey('testtable', 'aKey'), Display: 'theDisplay' },
        { Key: new DbObjectKey('testtable', 'anotherKey'), Display: 'anotherDisplay' },
        { Key: new DbObjectKey('testtable', 'aThirdKey'), Display: 'aThirdDisplay' }
      ]))
    },
    TypedClient: {
      OpsupportSearchIndexedtables: jasmine.createSpyObj('OpsupportSearchIndexedtables', {
        Get: Promise.resolve({ })
      })
    }
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [
        imx_QBM_SearchService,
        {
          provide: imx_SessionService,
          useValue: sessionServiceSpy
        },
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate')
          }
        },
        {
          provide: ErrorHandler,
          useValue: {
            handleError: jasmine.createSpy('handleError')
          }
        }
      ]
    })
  });

  beforeEach(() => {
    sessionServiceSpy.Client.opsupport_search_get.calls.reset();
    sessionServiceSpy.TypedClient.OpsupportSearchIndexedtables.Get.calls.reset();
  });

  beforeEach(inject([imx_QBM_SearchService], (s: imx_QBM_SearchService) => {
    svc = s;
  }));

  it('should be created', () => {
    expect(svc).toBeTruthy();
  });

  it('can fetch search results', () => {
    svc.search('bla', '');
    expect(sessionServiceSpy.Client.opsupport_search_get).toHaveBeenCalledWith({ term: 'bla', tables: '' });
  });

  it('can get the list of table for searchfiltering', done => {
    const tables = svc.getIndexedTables();
    tables.then(obj => {
      expect(sessionServiceSpy.TypedClient.OpsupportSearchIndexedtables.Get).toHaveBeenCalledWith({ PageSize: 200 });
    });
    done();
  });

  it('can get display and value from a given table', () => {
    const tableDisplay = 'Person';
    const dummyTableDisplay = {
      Column: { GetDisplayValue: () => tableDisplay }
    } as IReadValue<string>;
    const dummyTableValue = '(p)';
    const iEntityMock = TypeMoq.Mock.ofType<IEntity>();
    iEntityMock.setup(e => e.GetDisplay()).returns(() => dummyTableValue);

    const tables = TypeMoq.Mock.ofType<OpsupportSearchIndexedtables>();
    tables.setup(t => t.DisplayName).returns(() => dummyTableDisplay);
    tables.setup(t => t.GetEntity()).returns(() => iEntityMock.object);

    const resTableDisplay = svc.GetTableDisplay(tables.object);
    expect(resTableDisplay).toBe(tableDisplay);

    const resTableValue = svc.GetTableValue(tables.object);
    expect(resTableValue).toBe(dummyTableValue);
  });
});
