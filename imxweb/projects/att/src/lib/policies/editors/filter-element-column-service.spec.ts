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

import { IEntityColumn } from 'imx-qbm-dbts';
import { EntityService, } from 'qbm';
import { FilterElementColumnService } from './filter-element-column.service';
import { PolicyService } from '../policy.service';

describe('FilterElementColumnService', () => {

  const policyServiceStub = {
    getFilterCandidates: jasmine.createSpy('getFilterCandidates').and.returnValue(Promise.resolve({ TotalCount: 1 }))
  }

  const exampleColumn = {
    GetValue: () => 'uid1',
    GetDisplayValue: () => 'Display for uid1',
    GetMetadata: () => ({
      GetFkRelations: () => [{
        Get: () => ({ Entities: [], TotalCount: 1 })
      }]
    }) as unknown

  } as IEntityColumn;

  const entityServiceStub = {
    createLocalEntityColumn: jasmine.createSpy('createLocalEntityColumn').and.returnValue(exampleColumn)
  }

  let service: FilterElementColumnService;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerTestingModule
      ],
      providers: [
        {
          provide: PolicyService,
          useValue: policyServiceStub
        },
        {
          provide: EntityService,
          useValue: entityServiceStub
        }
      ]
    });
    service = TestBed.inject(FilterElementColumnService);
  });

  beforeEach(() => {
    policyServiceStub.getFilterCandidates.calls.reset();
    entityServiceStub.createLocalEntityColumn.calls.reset();
  });


  for (const testcase of [
    { param: null, withFk: false, displays: undefined, isCalled: false },
    { param: { RequiredParameter: 'UID_DEPARTMENT' }, displays: ['something good'], withFk: true, isCalled: true },
    { param: { RequiredParameter: 'NAME' }, displays: [], withFk: false, isCalled: true },
  ]) {
    it('can build a column', async () => {
      service.buildColumn(testcase.param,
        'test',
        'uidForaDepartment',
        'selected', testcase.displays,
        testcase.withFk);

      if (testcase.isCalled) {
        expect(entityServiceStub.createLocalEntityColumn).toHaveBeenCalled();
      } else {
        expect(entityServiceStub.createLocalEntityColumn).not.toHaveBeenCalled();
      }
    })
  }
});