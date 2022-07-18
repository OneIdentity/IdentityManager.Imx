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
import { EuiSidesheetRef, EuiSidesheetService, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

import { ClassloggerService, clearStylesFromDOM, ConfirmationService, SnackBarService } from 'qbm';
import { ItshopPatternService } from '../itshop-pattern.service';
import { ItshopPatternSidesheetComponent } from './itshop-pattern-sidesheet.component';

describe('ItshopPatternSidesheetComponent', () => {
  let component: ItshopPatternSidesheetComponent;
  let fixture: ComponentFixture<ItshopPatternSidesheetComponent>;

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
    togglePublic: jasmine.createSpy('makePublic').and.returnValue({}),
    createCopy: jasmine.createSpy('createCopy').and.returnValue({}),
    handleOpenLoader: jasmine.createSpy('handleOpenLoader').and.callThrough(),
    handleCloseLoader: jasmine.createSpy('handleCloseLoader').and.callThrough(),
    deleteProducts: jasmine.createSpy('deleteProducts').and.callThrough(),
    delete: jasmine.createSpy('delete').and.callThrough(),
    getPatternItems:  jasmine.createSpy('getPatternItems').and.callThrough(),
  };

  const sidesheetServiceStub = {
    open: jasmine.createSpy('open').and.returnValue({
      afterClosed: () => of({})
    })
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        ItshopPatternSidesheetComponent
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
          provide: EuiSidesheetService,
          useValue: sidesheetServiceStub
        },
        {
          provide: SnackBarService,
          useValue: {
            open: jasmine.createSpy('open')
          }
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
    fixture = TestBed.createComponent(ItshopPatternSidesheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    patterServiceStub.togglePublic.calls.reset();
    patterServiceStub.createCopy.calls.reset();
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


  it(`should toggle the isPublicpattern value for the selected pattern`, async () => {
    await component.togglePublic();

    expect(patterServiceStub.togglePublic).toHaveBeenCalledOnceWith(uid);
  });


  it(`should create a copy of the selected pattern`, async () => {
    await component.createPrivateCopy();

    expect(patterServiceStub.createCopy).toHaveBeenCalledOnceWith(uid);
  });

  it(`should commit the changes of the selected pattern`, async () => {
    await component.save();

    expect(commitSpy).toHaveBeenCalledOnceWith(true);
    expect(mockSidesheetRef.close).toHaveBeenCalled();
  });
});
