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

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatMenuModule } from '@angular/material/menu';
import { EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';

import { clearStylesFromDOM, CdrModule } from 'qbm';
import { CartItemEditComponent } from './cart-item-edit.component';
import { PortalCartitem } from 'imx-api-qer';
import { CartItemsService } from '../cart-items.service';

describe('CartItemEditComponent', () => {
  let component: CartItemEditComponent;
  let fixture: ComponentFixture<CartItemEditComponent>;

  const extendedColumnNames = [
    'ValidFrom',
    'testColumn1'
  ];

  const defaultColumnNames = [
    'OrderReason',
    'UID_QERJustificationOrder',
    'PWOPriority',
    extendedColumnNames[0],
    'ValidUntil',
    'RequestType'
  ];

  function createCartitem() {
    const cartitem = {
      GetEntity: () => ({
        GetKeys: () => undefined
      })
    };

    defaultColumnNames.forEach(name =>
      cartitem[name] = { Column: { ColumnName: name } }
    );

    cartitem['PWOPriority'].value = 1;
    cartitem['OrderReason'].value = 'No reason';
    cartitem['RequestType'].value = 'request';
    cartitem['UID_QERJustificationOrder'].value = 'uidKistification';

    return cartitem;
  }

  const cartItemsServiceStub = {
    getAssignmentText: (cartItem: PortalCartitem) => cartItem.Assignment.Column.GetDisplayValue()
  };

  const sidesheetData = {
    entityWrapper: {
      typedEntity: createCartitem(),
      parameterCategoryColumns: extendedColumnNames.map(name => ({
        parameterCategoryName: 'some name',
        column: { ColumnName: name }
      }))
    }
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        CartItemEditComponent
      ],
      imports: [
        CdrModule,
        MatMenuModule
      ],
      providers: [
        {
          provide: CartItemsService,
          useValue: cartItemsServiceStub
        },
        {
          provide: EUI_SIDESHEET_DATA,
          useValue: sidesheetData
        },
        {
          provide: EuiSidesheetRef,
          useValue: {
            close: jasmine.createSpy('close')
          }
        }
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CartItemEditComponent);
    component = fixture.componentInstance;
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component.shoppingCartItem.OrderReason.value).toBe('No reason');
    expect(component.shoppingCartItem.PWOPriority.value).toBe(1);
  });

  it('should init the correct columns', () => {
    expect(component.columns.length).toEqual(6);
    expect(component.columns[0].ColumnName).toEqual(extendedColumnNames[0]);
    expect(component.columns[1].ColumnName).toEqual(extendedColumnNames[1]);
    expect(component.columns[2].ColumnName).toEqual(defaultColumnNames[0]);
    expect(component.columns[3].ColumnName).toEqual(defaultColumnNames[1]);
    expect(component.columns[4].ColumnName).toEqual(defaultColumnNames[2]);
  });
});
