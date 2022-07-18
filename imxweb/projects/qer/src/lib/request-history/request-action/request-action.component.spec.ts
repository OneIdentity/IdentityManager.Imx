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
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { PortalItshopRequests, PortalShopServiceitems } from 'imx-api-qer';
import { configureTestSuite } from 'ng-bullet';

import { clearStylesFromDOM } from 'qbm';
import { ServiceItemsService } from '../../service-items/service-items.service';
import { RequestHistoryService } from '../request-history.service';
import { RequestActionComponent } from './request-action.component';

@Component({
  selector: 'imx-cdr-editor',
  template: '<p>MockCdrEditorComponent</p>'
})
class MockCdrEditorComponent {
  @Input() public cdr: any;
}

@Component({
  selector: 'imx-data-source-toolbar',
  template: '<p>MockDataSourceToolbarComponent</p>'
})
class MockDataSourceToolbarComponent {
  @Input() settings: any;
}

@Component({
  selector: 'imx-data-table',
  template: '<p>MockDataTableComponent</p>'
})
export class MockDataTableComponent {
  @Input() dst: any;
  @Input() detailViewVisible: any;
}

@Component({
  selector: 'imx-data-table-column',
  template: '<p>MockDataTableColumnComponent</p>'
})
class MockDataTableColumnComponent {
  @Input() entityColumn: any;
  @Input() entitySchema: any;
}

@Component({
  selector: 'imx-decision-reason',
  template: '<p>MockDecisionReasonComponent</p>'
})
class MockDecisionReasonComponent {
  @Input() reasonStandard: any;
  @Input() reasonFreetext: any;
}

describe('RequestActionComponent', () => {
  let component: RequestActionComponent;
  let fixture: ComponentFixture<RequestActionComponent>;

  const maxValidDays = 1;
  const orderDate = new Date();
  orderDate.setHours(0,0,0,0);
  const validUntil = new Date();
  validUntil.setDate(orderDate.getDate() + 1);

  const requests = [
    { MaxValidDays: { value: maxValidDays }, OrderDate: { value: orderDate }, ValidUntil: { value: validUntil } },
    { MaxValidDays: { value: 0 }, OrderDate: { value: orderDate }, ValidUntil: { value: validUntil } },
    { MaxValidDays: { }, OrderDate: { value: orderDate }, ValidUntil: { value: validUntil } }
  ];

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        NoopAnimationsModule
      ],
      declarations: [
        RequestActionComponent,
        MockDataSourceToolbarComponent,
        MockDataTableComponent,
        MockDataTableColumnComponent,
        MockCdrEditorComponent,
        MockDecisionReasonComponent
      ],
      providers: [
        {
          provide: EuiSidesheetRef,
          useValue: {
            close: jasmine.createSpy('close')
          }
        },
        {
          provide: ServiceItemsService,
          useValue: {
            PortalShopServiceItemsSchema: PortalShopServiceitems.GetEntitySchema()
          }
        },
        {
          provide: RequestHistoryService,
          useValue: {
            PortalItshopRequestsSchema: PortalItshopRequests.GetEntitySchema()
          }
        },
        {
          provide: EUI_SIDESHEET_DATA,
          useValue: { requests }
        }
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  [ 0, 1 ].forEach(numOfDays =>
  it('should validate prolongation date', () => {
    const control = new FormControl();
    component.addProlongationMaxValidDaysCheck(control);

    const date = new Date(orderDate);
    date.setDate(date.getDate() + maxValidDays + numOfDays);
    control.setValue(date);

    expect(component.invalidProlongationDate).toEqual(numOfDays > 0);

    component.ngOnDestroy();
  }));

  [ 0, 1 ].forEach(numOfDays =>
  it('should validate unsubscription date', () => {
    const control = new FormControl();
    component.addUnsubscribeMaxValidDaysCheck(control);

    const date = new Date(validUntil);
    date.setDate(date.getDate() + numOfDays);
    control.setValue(date);

    expect(component.invalidUnsubscriptionDate).toEqual(numOfDays > 0);

    component.ngOnDestroy();
  }));
});
