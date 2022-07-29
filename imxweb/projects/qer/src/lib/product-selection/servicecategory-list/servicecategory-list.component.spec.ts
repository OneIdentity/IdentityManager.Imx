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

import { SimpleChange, SimpleChanges } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { EuiCoreModule, EuiLoadingService } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { TranslateModule } from '@ngx-translate/core';

import { IReadValue, TypedEntityCollectionData } from 'imx-qbm-dbts';
import { PortalShopCategories } from 'imx-api-qer';

import { clearStylesFromDOM } from 'qbm';
import { ServiceCategoryListComponent } from './servicecategory-list.component';
import { ProductSelectionService } from '../product-selection.service';


describe('ServiceCategoryListComponent', () => {
  let component: ServiceCategoryListComponent;
  let fixture: ComponentFixture<ServiceCategoryListComponent>;

  const euiLoadingServiceStub = {
    hide: jasmine.createSpy('hide'),
    show: jasmine.createSpy('show')
  };

  const existingItem = {
    GetEntity: () => ({
      GetDisplay: () => 'some to remove',
      GetKeys: () => ['0']
    }),
    UID_AccProductGroup: {
      value: 'uid-group-456'
    } as IReadValue<string>,
    UID_AccProductGroupParent: {
      value: 'uid-parent-123'
    } as IReadValue<string>,
  } as PortalShopCategories;

  let serviceCategoriesMock = [existingItem];

  const productSelectionServiceStub = {
    getServiceCategoryDisplaySingular: jasmine.createSpy('getServiceCategoryDisplaySingular').and.returnValue('Service categories'),
    getServiceCategories: jasmine.createSpy('getServiceCategories').and.returnValue(
      Promise.resolve({
        tableName: '',
        totalCount: 1,
        Data: serviceCategoriesMock
      } as TypedEntityCollectionData<PortalShopCategories>))
  }

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        ServiceCategoryListComponent
      ],
      imports: [
        LoggerTestingModule,
        EuiCoreModule,
        LoggerTestingModule,
        NoopAnimationsModule,
        ReactiveFormsModule,
        TranslateModule.forRoot({})
      ],
      providers: [
        {
          provide: EuiLoadingService,
          useValue: euiLoadingServiceStub
        },
        {
          provide: ProductSelectionService,
          useValue: productSelectionServiceStub
        }
      ]
    })
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceCategoryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    expect(component).toBeTruthy();
  }));

  it('should reset the servicecategory list of the dropdown', () => {
    component.resetCategory();

    expect(component.selectedServiceCategoryTree).toEqual([]);
  });

  it('should emit if child categories should be included or not', () => {

    const includeChildCategoriesspy = spyOn(component.includeChildCategories, 'emit');

    component.onIncludeChilds(true);

    expect(includeChildCategoriesspy).toHaveBeenCalledWith(true);
  });

  it('should emit the selected service category', () => {
    const includeChildCategoriesspy = spyOn(component.serviceCategorySelected, 'emit');
    const serviceCategoryMock = {} as PortalShopCategories;

    component.onServiceCategoryChanged(serviceCategoryMock);

    expect(includeChildCategoriesspy).toHaveBeenCalledWith(serviceCategoryMock);
  });

  it('should update the dropdown when the selected service category has changed', fakeAsync(() => {
    const serviceCategoryMock = {
      UID_AccProductGroup: {
        value: 'uid-group-123'
      } as IReadValue<string>,
      UID_AccProductGroupParent: {
        value: 'uid-parent-123'
      } as IReadValue<string>,
    } as PortalShopCategories;

    component.selectedServiceCategory = serviceCategoryMock;

    const change = {
      selectedServiceCategory: {
        currentValue: serviceCategoryMock
      } as SimpleChange
    } as SimpleChanges;

    component.ngOnChanges(change);
    tick();
 
    expect(component.selectedServiceCategoryTree.length).toBe(3);
    expect(component.selectedServiceCategoryTree[1].UID_AccProductGroup.value).toBe('uid-group-123'); 
  }));

});
