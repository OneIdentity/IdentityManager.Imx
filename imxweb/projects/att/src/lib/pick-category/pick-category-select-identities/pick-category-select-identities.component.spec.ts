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
 * Copyright 2023 One Identity LLC.
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

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { PortalPersonAll } from 'imx-api-qer';

import { MetadataService } from 'qbm';
import { IdentitiesService } from 'qer';
import { PickCategoryService } from '../pick-category.service';
import { PickCategorySelectIdentitiesComponent } from './pick-category-select-identities.component';

describe('PickCategorySelectIdentitiesComponent', () => {
  let component: PickCategorySelectIdentitiesComponent;
  let fixture: ComponentFixture<PickCategorySelectIdentitiesComponent>;

  const sidesheetData = {
    pickCategory: {
      DisplayName: { Column: { GetDisplayValue: () => 'DisplayName' } },
      GetEntity: () => ({
        GetKeys: () => ['123'],
        GetDisplayLong: () => 'longDisplay',
        GetColumn: () => ({ GetValue: () => ({}) }),
      }),
    },
  };

  const metadataServiceStub = {
    tables: {},
    update: jasmine.createSpy('update')
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        PickCategorySelectIdentitiesComponent
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ],
      providers: [
        {
          provide: EUI_SIDESHEET_DATA,
          useValue: sidesheetData,
        },
        {
          provide: EuiSidesheetRef,
          useValue: {}
        },
        {
          provide: MetadataService,
          useValue: metadataServiceStub
        },
        {
          provide: PickCategoryService,
          useValue: {
            handleOpenLoader: jasmine.createSpy('handleOpenLoader').and.callThrough(),
            handleCloseLoader: jasmine.createSpy('handleCloseLoader').and.callThrough()
          }
        },
        {
          provide: IdentitiesService,
          useValue: {
            personAllSchema: PortalPersonAll.GetEntitySchema(),
            getAllPerson: jasmine.createSpy('getAllPerson').and.returnValue(Promise.resolve(
              { totalCount: 100, Data: ['1', '2', '3'] }              
            )),
          }
        },
      ]
    })
  .compileComponents();
  }));

beforeEach(() => {
  fixture = TestBed.createComponent(PickCategorySelectIdentitiesComponent);
  component = fixture.componentInstance;
  fixture.detectChanges();
});

it('should create', () => {
  expect(component).toBeTruthy();
});
});
