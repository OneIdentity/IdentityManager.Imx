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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

import { ClassloggerService, clearStylesFromDOM, ConfirmationService } from 'qbm';
import { ItshopPatternService } from '../itshop-pattern.service';
import { ItshopPatternCreateSidesheetComponent } from './itshop-pattern-create-sidesheet.component';

describe('ItshopPatternCreateSidesheetComponent', () => {
  let component: ItshopPatternCreateSidesheetComponent;
  let fixture: ComponentFixture<ItshopPatternCreateSidesheetComponent>;

  const commitSpy = jasmine.createSpy('Commit');
  const uid = '123';
  const sidesheetData = {
    pattern: {
      GetEntity: () => ({
        GetKeys: () => [uid],
        GetDisplayLong: () => 'longDisplay',
        GetColumn: () => ({ GetValue: () => ({}) }),
        Commit: commitSpy
      }),
      IsPublicPattern: {
        value: true
      },
    },
    isMyPattern: false,
    createMode: false,
    adminMode: false
  };

  const mockSidesheetRef = {
    close: jasmine.createSpy('close'),
    closeClicked: jasmine.createSpy('closeClicked').and.returnValue(of(undefined))
  };

  let confirm = true;
  const mockConfirmationService = {
    confirmLeaveWithUnsavedChanges: jasmine.createSpy('confirmLeaveWithUnsavedChanges')
      .and.callFake(() => Promise.resolve(confirm))
  }

  const patterServiceStub = {
    handleOpenLoader: jasmine.createSpy('handleOpenLoader').and.callThrough(),
    handleCloseLoader: jasmine.createSpy('handleCloseLoader').and.callThrough(),
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        ItshopPatternCreateSidesheetComponent
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ],
      imports: [
        FormsModule,
        ReactiveFormsModule,        
        TranslateModule.forRoot()
      ],
      providers: [
        {
          provide: EUI_SIDESHEET_DATA,
          useValue: sidesheetData,
        },
        {
          provide: EuiSidesheetRef,
          useValue: mockSidesheetRef
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
          provide: ItshopPatternService,
          useValue: patterServiceStub
        },
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ItshopPatternCreateSidesheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    mockSidesheetRef.close.calls.reset();
    mockSidesheetRef.closeClicked.calls.reset();
    commitSpy.calls.reset();
  })

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it(`should commit the changes of the selected pattern`, async () => {
    await component.save();

    expect(commitSpy).toHaveBeenCalledOnceWith(true);
    expect(mockSidesheetRef.close).toHaveBeenCalled();
  });
});

