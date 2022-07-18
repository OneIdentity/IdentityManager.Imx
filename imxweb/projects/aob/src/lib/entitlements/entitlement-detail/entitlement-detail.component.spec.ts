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

import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';
import { Subject } from 'rxjs';

import { clearStylesFromDOM, ConfirmationService, SnackBarService } from 'qbm';
import { EntitlementDetailComponent } from './entitlement-detail.component';

@Component({
  selector: 'imx-entitlement-edit',
  template: '<p>MockEntitlementEdit</p>'
})
class MockEntitlementEdit {
  @Input() entitlement: any;
  @Input() serviceItem: any;
  @Input() isStarlingTwoFactorConfigured: any;
}

describe('EntitlementDetailComponent', () => {
  let component: EntitlementDetailComponent;
  let fixture: ComponentFixture<EntitlementDetailComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        EntitlementDetailComponent,
        MockEntitlementEdit
      ],
      providers: [
        {
          provide: EUI_SIDESHEET_DATA,
          useValue: {}
        },
        {
          provide: EuiSidesheetRef,
          useValue: {
            closeClicked: jasmine.createSpy('closeClicked').and.returnValue(new Subject())
          }
        },
        {
          provide: ConfirmationService,
          useValue: {}
        },
        {
          provide: SnackBarService,
          useValue: { }
        }
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EntitlementDetailComponent);
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
