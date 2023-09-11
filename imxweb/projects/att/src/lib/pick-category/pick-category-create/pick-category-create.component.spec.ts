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
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { of } from 'rxjs';
import { PortalPickcategoryItems } from 'imx-api-qer';

import { ConfirmationService } from 'qbm';
import { PickCategoryService } from '../pick-category.service';
import { PickCategoryCreateComponent } from './pick-category-create.component';

describe('PickCategoryCreateComponent', () => {
  let component: PickCategoryCreateComponent;
  let fixture: ComponentFixture<PickCategoryCreateComponent>;

  
  let confirm = true;
  const mockConfirmationService = {
    confirm: jasmine.createSpy('confirm')
      .and.callFake(() => Promise.resolve(confirm))
  }

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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        PickCategoryCreateComponent
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ],
      imports: [
        FormsModule,
        ReactiveFormsModule
      ],
      providers: [
        {
          provide: EUI_SIDESHEET_DATA,
          useValue: sidesheetData,
        },
        {
          provide: EuiSidesheetRef,
          useValue: {
            close: jasmine.createSpy('close'),            
            closeClicked: jasmine.createSpy('closeClicked').and.returnValue(of(undefined)),
          }
        },
        {
          provide: ConfirmationService,
          useValue: mockConfirmationService
        },
        {
          provide: PickCategoryService,
          useValue: {
            pickcategoryItemsSchema: PortalPickcategoryItems.GetEntitySchema(),
            deletePickCategoryItems: jasmine.createSpy('deletePickCategoryItems').and.returnValue({}),
            getPickCategoryItems: jasmine.createSpy('getPickCategoryItems').and.returnValue({}),
            handleOpenLoader: jasmine.createSpy('handleOpenLoader').and.callThrough(),
            handleCloseLoader: jasmine.createSpy('handleCloseLoader').and.callThrough()
          }
        }
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PickCategoryCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    // expect(component).toBeTruthy();
  });
});
