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
import { EuiSidesheetService, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { IClientProperty } from 'imx-qbm-dbts';
import { ClassloggerService, ConfirmationService } from 'qbm';

import { PickCategorySidesheetComponent } from './pick-category-sidesheet.component';
import { PickCategoryService } from '../pick-category.service';

describe('PickCategorySidesheetComponent', () => {
  let component: PickCategorySidesheetComponent;
  let fixture: ComponentFixture<PickCategorySidesheetComponent>;

  const sidesheetData = {
    pickCategory: {
      GetEntity: () => ({
        GetKeys: () => ['123'],
        GetDisplayLong: () => 'longDisplay',
        GetColumn: () => ({ GetValue: () => ({}) }),
      }),
    },
    isNew: false
  };

  let confirm = true;
  const mockConfirmationService = {
    confirm: jasmine.createSpy('confirm')
      .and.callFake(() => Promise.resolve(confirm))
  }

  const deletePickedItemsSpy = jasmine.createSpy('deletePickedItems').and.returnValue(Promise.resolve({}));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        PickCategorySidesheetComponent
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        MatSnackBarModule
      ],
      providers: [
        {
          provide: EUI_SIDESHEET_DATA,
          useValue: sidesheetData,
        },
        {
          provide: EuiSidesheetService,
          useValue: {}
        },
        {
          provide: ConfirmationService,
          useValue: mockConfirmationService
        },
        {
          provide: ClassloggerService,
          useValue: {
            debug: jasmine.createSpy('debug').and.callThrough(),
            trace: jasmine.createSpy('trace').and.callThrough()
          }
        },
        {
          provide: PickCategoryService,
          useValue: {
            pickcategoryItemsSchema: { Columns: { __Display: { ColumnName: '__Display' } as IClientProperty } },
            deletePickedItems: deletePickedItemsSpy,
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
    fixture = TestBed.createComponent(PickCategorySidesheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    deletePickedItemsSpy.calls.reset();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('removePickedItems() tests', () => {
    for (const testcase of [
      { confirm: true },
      { confirm: false }
    ]) {
      it('should make a call to delete the picked items, if the user confirm the dialog', async () => {
        confirm = testcase.confirm;
        await component.removePickedItems();

        if(testcase.confirm) {
          expect(deletePickedItemsSpy).toHaveBeenCalled();
        } else {
          expect(deletePickedItemsSpy).not.toHaveBeenCalled();
        }
      });
    }
  });
});
