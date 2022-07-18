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

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { EuiMaterialModule, EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';
import { ClassloggerService, SnackBarService } from 'qbm';
import { Subject } from 'rxjs';

import { ServiceItemsEditService } from '../service-items-edit.service';
import { ServiceItemsEditSidesheetComponent } from './service-items-edit-sidesheet.component';

describe('ServiceItemsEditSidesheetComponent', () => {
  let component: ServiceItemsEditSidesheetComponent;
  let fixture: ComponentFixture<ServiceItemsEditSidesheetComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        ServiceItemsEditSidesheetComponent
      ],
      imports: [
        ReactiveFormsModule,
        EuiMaterialModule
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ],
      providers: [
        {
          provide: ClassloggerService,
          useValue: {
            debug: jasmine.createSpy('debug').and.callThrough(),
            trace: jasmine.createSpy('trace').and.callThrough()
          }
        },
        {
          provide: ServiceItemsEditService,
          useValue: {
            hasAccproductparamcategoryCandidates: jasmine.createSpy('hasAccproductparamcategoryCandidates').and.returnValue(true),
            handleOpenLoader: jasmine.createSpy('handleOpenLoader').and.callThrough(),
            handleCloseLoader: jasmine.createSpy('handleCloseLoader').and.callThrough(),
          }
        },
        {
          provide: EUI_SIDESHEET_DATA,
          useValue: {},
        },
        {
          provide: EuiSidesheetRef,
          useValue: {
            closeClicked: () => new Subject(),
            close: jasmine.createSpy('close')
          }
        },
        {
          provide: SnackBarService,
          useValue: {
            open: jasmine.createSpy('open')
          }
        },
      ]
    })
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceItemsEditSidesheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
