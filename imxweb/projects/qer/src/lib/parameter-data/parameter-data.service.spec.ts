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

import { ParameterData, IEntityColumn } from 'imx-qbm-dbts';
import { ClassloggerService, EntityService } from 'qbm';
import { ParameterDataService } from './parameter-data.service';

describe('ParameterDataService', () => {
  let service: ParameterDataService;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ClassloggerService,
          useValue: {
            debug: jasmine.createSpy('debug').and.callThrough(),
            trace: jasmine.createSpy('trace').and.callThrough()
          }
        },
        {
          provide: EntityService,
          useValue: {
            createLocalEntityColumn: (property, __2, __3) => ({
              ColumnName: property.ColumnName
            } as IEntityColumn)
          }
        }
      ]
    });
    service = TestBed.inject(ParameterDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('has parameters', () => {
    const result = service.hasParameters({
      Parameters: { someCategoryName: [[], [{}]] },
      index: 1
    });
    expect(result).toBeTruthy();
  });

  it('does not have parameters', () => {
    const result = service.hasParameters({
      Parameters: { someCategoryName: [[], [{}]] },
      index: 0
    });
    expect(result).toBeFalsy();
  });

  it('transforms extended parameter data to parameter categories', () => {
    const extendedParameterData = {
      aaa: [[
        {
          Property: { ColumnName: 'column name aaa' },
          Value: {}
        }
      ] as ParameterData[]],
      ccc: [[
        {
          Property: { ColumnName: 'column name ccc 1' },
          Value: {}
        },
        {
          Property: { ColumnName: 'column name ccc 2' },
          Value: {}
        }
      ] as ParameterData[]],
      aab: [[
        {
          Property: { ColumnName: 'column name aab' },
          Value: {}
        }
      ] as ParameterData[]]
    };

    const categories = service.createParameterCategories(
      { Parameters: extendedParameterData, index: 0 }
    );

    expect(categories[0].name).toEqual('aaa');
    expect(categories[0].parameters.length).toEqual(1);
    expect(categories[1].name).toEqual('ccc');
    expect(categories[1].parameters.length).toEqual(2);
    expect(categories[2].name).toEqual('aab');
    expect(categories[2].parameters.length).toEqual(1);
  });

  it('transforms parameter categories to parameter category columns', () => {
    const parameterCategories = [
      {
        name: 'aaa',
        parameters: [
          {
            Property: { ColumnName: 'column name aaa' },
            Value: {}
          }
        ] as ParameterData[]},
      {
        name: 'ccc',
        parameters: [
          {
            Property: { ColumnName: 'column name ccc 1' },
            Value: {}
          },
          {
            Property: { ColumnName: 'column name ccc 2' },
            Value: {}
          }
        ] as ParameterData[]},
      {
        name: 'aab',
        parameters: [
          {
            Property: { ColumnName: 'column name aab' },
            Value: {}
          }
        ] as ParameterData[]}
    ];

    const columns = service.createParameterCategoryColumns(
      parameterCategories,
      __ => []
    );

    expect(columns[0].parameterCategoryName).toEqual('aaa');
    expect(columns[0].column.ColumnName).toEqual('column name aaa');
    expect(columns[1].parameterCategoryName).toEqual('ccc');
    expect(columns[1].column.ColumnName).toEqual('column name ccc 1');
    expect(columns[2].parameterCategoryName).toEqual('ccc');
    expect(columns[2].column.ColumnName).toEqual('column name ccc 2');
    expect(columns[3].parameterCategoryName).toEqual('aab');
    expect(columns[3].column.ColumnName).toEqual('column name aab');
  });
});
