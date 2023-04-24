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
import { configureTestSuite } from 'ng-bullet';

import { ServicecategoryTreeDatabase } from './servicecategory-tree-database';
import { ProductSelectionService } from '../product-selection.service';
import { TypedEntityCollectionData, TypedEntity } from 'imx-qbm-dbts';
import { PortalShopCategories } from 'imx-api-qer';

describe('ServicecategoryTreeDatabase', () => {
  const euiLoadingServiceStub = {
    hide: jasmine.createSpy('hide'),
    show: jasmine.createSpy('show')
  };

  const existingItem = {
    GetEntity: () => ({
      GetDisplay: () => 'some to remove',
      GetKeys: () => ['0']
    })
  } as TypedEntity;

  let serviceCategoriesMock = [existingItem];

  const getServiceCategoriesSpy = jasmine.createSpy('getServiceCategories').and.returnValue(
    Promise.resolve({
      tableName: '',
      totalCount: 1,
      Data: serviceCategoriesMock
    } as TypedEntityCollectionData<PortalShopCategories>));

  const productSelectionServiceStub = {
    getServiceCategories: getServiceCategoriesSpy
  }

  let busyService: EuiLoadingService;
  let productSelectionService: ProductSelectionService;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ProductSelectionService,
          useValue: productSelectionServiceStub
        },
        {
          provide: EuiLoadingService,
          useValue: euiLoadingServiceStub
        }
      ]
    });

    busyService = TestBed.inject(EuiLoadingService);
    productSelectionService = TestBed.inject(ProductSelectionService);
  });

  it('should be created', () => {
    const scTreeDatabase = new ServicecategoryTreeDatabase(busyService, { DefaultPageSize: 20,PageSizeForAllElements:50 }, productSelectionService);
    expect(scTreeDatabase).toBeTruthy();
  });
});
