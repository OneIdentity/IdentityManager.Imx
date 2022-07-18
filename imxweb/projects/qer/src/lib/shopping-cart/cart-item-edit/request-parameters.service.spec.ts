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

import { ParameterDataService } from '../../parameter-data/parameter-data.service';
import { RequestParametersService } from './request-parameters.service';

describe('RequestParametersService', () => {
  let service: RequestParametersService;

  const parameterDataService = new class {
    readonly parameterCategoryColumns = [
      { parameterCategoryName: 'aaa', column: {} },
      { parameterCategoryName: 'StructureParameter', column: {} },
      { parameterCategoryName: 'a0', column: {} }
    ];

    readonly createParameterCategories = wrapper => Object.keys(wrapper.Parameters).map(name => ({
      name,
      parameters: wrapper.Parameters[name][0]
    }));

    readonly createInteractiveParameterCategoryColumns = (parameterCategories, __getFk) => parameterCategories.map(p => ({
      parameterCategoryName: p.name,
      column: {}
    }));

    readonly getEntityWriteDataColumns = jasmine.createSpy('getEntityWriteDataColumns');
  }();

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ParameterDataService,
          useValue: parameterDataService
        }
      ]
    });
    service = TestBed.inject(RequestParametersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should order the request parameters with StructureParameter first', () => {
    const columns = service.createInteractiveParameterCategoryColumns(
      {
        Parameters: {
          a: [[]],
          b: [[]],
          StructureParameter: [[]],
          c: [[]]
        },
        index: 0
      },
      __ => ([]),
      null // no typedentity required for test
    );

    expect(columns[0].parameterCategoryName).toEqual('StructureParameter');
  });
});
