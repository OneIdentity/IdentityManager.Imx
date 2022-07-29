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

import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, Output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';
import { of } from 'rxjs';

import { clearStylesFromDOM, ConfirmationService } from 'qbm';
import { ServiceItemEditComponent } from './service-item-edit.component';

@Component({
  selector: 'imx-bulk-editor',
  template: '<p>MockBulkPropertyEditorComponent</p>'
})
class MockBulkPropertyEditorComponent {
  @Input() public entities: any;
  @Output() public saveItem: any = new EventEmitter<any>();
  @Output() public skipItem: any = new EventEmitter<any>();
}

describe('ServiceItemEditComponent', () => {
  let component: ServiceItemEditComponent;
  let fixture: ComponentFixture<ServiceItemEditComponent>;

  let confirm = true;
  const mockConfirmationService = {
    confirm: jasmine.createSpy('confirm')
      .and.callFake(() => Promise.resolve(confirm))
  }

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        MockBulkPropertyEditorComponent,
        ServiceItemEditComponent
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ],
      providers: [
        {
          provide: EUI_SIDESHEET_DATA,
          useValue: [
            {
              requestColumns: [],
              cartItem: {
                UID_PersonOrdered: {
                  Column: {
                    GetDisplayValue: () => ''
                  }
                }
              }
            }
          ]
        },
        {
          provide: EuiSidesheetRef,
          useValue: {
            closeClicked: () => of(null),
            close: jasmine.createSpy('close')
          }
        },
        {
          provide: ConfirmationService,
          useValue: mockConfirmationService
        }
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceItemEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
