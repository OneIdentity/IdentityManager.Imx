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
import { TranslateService } from '@ngx-translate/core';
import { configureTestSuite } from 'ng-bullet';

import { imx_SessionService } from '../session/imx-session.service';
import { MetadataService } from './metadata.service';

describe('MetadataService', () => {
  const mockMetaTableData = {
    Display: 'dummyTableDisplay'
  };

  const clientSpy = jasmine.createSpyObj('Client', {
    'imx_metadata_table_get': Promise.resolve(mockMetaTableData)
  });

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [
        MetadataService,
        {
          provide: imx_SessionService, useClass: class {
            Client = clientSpy;
          }
        },
        {
          provide: TranslateService,
          useValue: {
            currentLang: 'de'
          }
        }
      ]
    });
  });

  it('should be created', () => {
    const service: MetadataService = TestBed.get(MetadataService);
    expect(service).toBeDefined();
  });

  it('could get the metadata of a table', async () => {
    const service = TestBed.get(MetadataService);
    const table = await service.GetTableMetadata('dummyTable');

    expect(table.Display).toBe(mockMetaTableData.Display);
    expect(clientSpy.imx_metadata_table_get).toHaveBeenCalled();
  });

  it('should update the table metadata', async () => {
    const service = TestBed.get(MetadataService);
    await service.update(['dummyTable']);

    expect(service.tables.dummyTable.Display).toBe(mockMetaTableData.Display);
    expect(clientSpy.imx_metadata_table_get).toHaveBeenCalled();
  });

  it('should update the table metadata for tables that are not already in the cache', async () => {
    const service = TestBed.get(MetadataService);
    await service.update(['dummyTable']);

    clientSpy.imx_metadata_table_get.calls.reset();

    await service.updateNonExisting(['dummyTable', 'another table']);

    expect(clientSpy.imx_metadata_table_get).toHaveBeenCalledWith('another table', { cultureName: 'de' });
  });
});
