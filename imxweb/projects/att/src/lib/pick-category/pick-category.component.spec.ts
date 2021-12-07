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
 * Copyright 2021 One Identity LLC.
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
import { MatDialog } from '@angular/material/dialog';
import { EuiSidesheetService } from '@elemental-ui/core';
import { IClientProperty } from 'imx-qbm-dbts';

import { ClassloggerService, UserMessageService } from 'qbm';
import { of, Subject } from 'rxjs';

import { PickCategoryComponent } from './pick-category.component';
import { PickCategoryService } from './pick-category.service';

describe('PickCategoryComponent', () => {
  let component: PickCategoryComponent;
  let fixture: ComponentFixture<PickCategoryComponent>;


  const sidesheetServiceStub = {
    open: jasmine.createSpy('open')
  };
  
  let result: any;
  const matDialogStub = {
    open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of(result) }),
    closeAll: jasmine.createSpy('closeAll')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ 
        PickCategoryComponent 
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ],
      providers: [

        {
          provide: PickCategoryService,
          useValue: {
            pickcategorySchema: { Columns: { __Display: { ColumnName: '__Display' } as IClientProperty } },
            getPickCategories: jasmine.createSpy('getPickCategories').and.returnValue({}),
            deletePickCategories: jasmine.createSpy('deletePickCategories').and.returnValue({}),            
            createPickCategory: jasmine.createSpy('createPickCategory').and.returnValue({}),
            handleOpenLoader: jasmine.createSpy('handleOpenLoader').and.callThrough(),
            handleCloseLoader: jasmine.createSpy('handleCloseLoader').and.callThrough(),
          }
        },
        {
          provide: EuiSidesheetService,
          useValue: sidesheetServiceStub
        },
        {
          provide: MatDialog,
          useValue: matDialogStub
        },
        {
          provide: UserMessageService,
          useValue: {
            subject: new Subject()
          }
        },
        {
          provide: ClassloggerService,
          useValue: {
            debug: jasmine.createSpy('debug').and.callThrough(),
            trace: jasmine.createSpy('trace').and.callThrough()
          }
        }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PickCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
