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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { EuiLoadingService, EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { TranslateModule } from '@ngx-translate/core';
import { PortalServiceitems } from 'imx-api-qer';
import { ValueStruct } from 'imx-qbm-dbts';
import { configureTestSuite } from 'ng-bullet';
import { ConfirmationService } from 'qbm';
import { ServiceItemTreeWrapper } from '../../product-selection/service-item-order.interface';
import { Subject } from 'rxjs';
import { ServiceItemsService } from '../../service-items/service-items.service';

import { OptionalItemsSidesheetComponent } from './optional-items-sidesheet.component';

describe('OptionalItemsSidesheetComponent', () => {
  let component: OptionalItemsSidesheetComponent;
  let fixture: ComponentFixture<OptionalItemsSidesheetComponent>;

  const mockTree: ServiceItemTreeWrapper = {
    trees: [
      {
        Display: 'item1',
        UidAccProduct: 'item1',
        isMandatory: true,
        isChecked: true,
        isIndeterminate: false,
        parentChecked: true,
        Recipients: ['User'],
        UidRecipients: ['User'],
        Mandatory: [
          {
            Display: 'mandatory1',
            UidAccProduct: 'mandatory1',
            isMandatory: true,
            isChecked: true,
            isIndeterminate: false,
            parentChecked: true,
            Mandatory: [],
            Optional: [],
          },
        ],
        Optional: [
          {
            Display: 'optional1',
            UidAccProduct: 'optional1',
            isMandatory: false,
            isChecked: false,
            isIndeterminate: false,
            parentChecked: true,
            Mandatory: [],
            Optional: [
              {
                Display: 'optional2',
                UidAccProduct: 'optional2',
                isMandatory: false,
                isChecked: false,
                isIndeterminate: true,
                parentChecked: false,
                Mandatory: [],
                Optional: [],
              },
            ],
          },
        ],
      },
    ],
    totalOptional: 2,
  };

  const euiSideSheetRefStub = {
    closeClicked: jasmine.createSpy('closeClicked').and.returnValue(new Subject()),
    close: jasmine.createSpy('close'),
  };

  const serviceItemServiceStub = {
    getServiceItemsForPersons: jasmine
      .createSpy('getServiceItemsForPersons')
      .and.callFake((serviceItems: PortalServiceitems[], recipients: ValueStruct<string>) => [{}]),
    getServiceItem: jasmine.createSpy('getServiceItem').and.callFake((uid: string) => {}),
  };

  const confirmationServiceStub = {
    confirm: jasmine.createSpy('confirm').and.callFake(() => Promise.resolve(true)),
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [OptionalItemsSidesheetComponent],
      imports: [MatCheckboxModule, TranslateModule.forRoot()],
      providers: [
        {
          provide: EuiLoadingService,
          useValue: {
            hide: jasmine.createSpy('hide'),
            show: jasmine.createSpy('show'),
          },
        },
        {
          provide: ServiceItemsService,
          useValue: serviceItemServiceStub,
        },
        {
          provide: EuiSidesheetRef,
          useValue: euiSideSheetRefStub,
        },
        {
          provide: ConfirmationService,
          useValue: confirmationServiceStub,
        },
        {
          provide: EUI_SIDESHEET_DATA,
          useValue: {
            serviceItemTree: mockTree,
            projectConfig: {},
          },
        },
      ],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OptionalItemsSidesheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    serviceItemServiceStub.getServiceItem.calls.reset();
    serviceItemServiceStub.getServiceItemsForPersons.calls.reset();
    euiSideSheetRefStub.close.calls.reset();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
