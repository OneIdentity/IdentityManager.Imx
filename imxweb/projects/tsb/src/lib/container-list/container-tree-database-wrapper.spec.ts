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
import { EuiLoadingService } from '@elemental-ui/core';
import { PortalTargetsystemUnsContainer } from 'imx-api-tsb';
import { TypedEntity, TypedEntityCollectionData } from 'imx-qbm-dbts';
import { configureTestSuite } from 'ng-bullet';
import { DeHelperService } from '../de-helper.service';
import { ContainerTreeDatabaseWrapper } from './container-tree-database-wrapper';

describe('ContainerTreeDatabase', () => {

  const euiLoadingServiceStub = {
    hide: jasmine.createSpy('hide'),
    show: jasmine.createSpy('show')
  };

  const testContainer = {
    GetEntity: () => ({
      GetDisplay: () => 'Test 1',
      GetKeys: () => ['0']
    })
  } as TypedEntity;

  const getContainersSpy = jasmine.createSpy('getContainers').and.returnValue(
  Promise.resolve({
    tableName: '',
    totalCount: 1,
    Data: [testContainer]
  } as TypedEntityCollectionData<PortalTargetsystemUnsContainer>));

  const dataHelperServiceStub = {
    getContainers: getContainersSpy
  }

  let busyService: EuiLoadingService;
  let productSelectionService: DeHelperService;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: DeHelperService,
          useValue: dataHelperServiceStub
        },
        {
          provide: EuiLoadingService,
          useValue: euiLoadingServiceStub
        }
      ]
    });

    busyService = TestBed.inject(EuiLoadingService);
    productSelectionService = TestBed.inject(DeHelperService);
  });

  it('should be created', () => {
    const scTreeDatabase = new ContainerTreeDatabaseWrapper(busyService, productSelectionService);
    expect(scTreeDatabase).toBeTruthy();
  });

  describe('getData() tests', () => {
    [
      { description: 'without euiloadingservice', showLoading: false },
      { description: 'with euiloadingservice', showLoading: true }
    ].forEach(testcase => {
      it(`should load the data from the service ${testcase.showLoading}`, async() => {
        const scTreeDatabase = new ContainerTreeDatabaseWrapper(busyService, productSelectionService);
        const result = await scTreeDatabase.entityTreeDatabase.getData(testcase.showLoading);
        expect(result).toBeDefined();
        expect(result.totalCount).toEqual(1);
      })
    });
  });
});
