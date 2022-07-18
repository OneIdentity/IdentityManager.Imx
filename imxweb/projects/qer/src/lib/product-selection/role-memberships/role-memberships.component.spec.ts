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
import { EuiLoadingService, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';

import { IClientProperty } from 'imx-qbm-dbts';
import { clearStylesFromDOM } from 'qbm';
import { ItshopService } from '../../itshop/itshop.service';
import { RoleMembershipsComponent } from './role-memberships.component';

describe('RoleMembershipsComponent', () => {
  let component: RoleMembershipsComponent;
  let fixture: ComponentFixture<RoleMembershipsComponent>;

  const itshop = {
    PortalItshopPeergroupMembershipsSchema: { Columns: { __Display: { ColumnName: '__Display' } as IClientProperty } },
    getPeerGroupMemberships: jasmine.createSpy('getPeerGroupMemberships').and.returnValue(Promise.resolve({}))
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        RoleMembershipsComponent
      ],
      providers: [
        {
          provide: EUI_SIDESHEET_DATA,
          useValue: {}
        },
        {
          provide: ItshopService,
          useValue: itshop
        },
        {
          provide: EuiLoadingService,
          useValue: {
            show: () => ({}),
            hide: () => {}
          }
        }
      ]
    });
  });

  beforeEach(() => {
    itshop.getPeerGroupMemberships.calls.reset();

    fixture = TestBed.createComponent(RoleMembershipsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component.dstWrapper.propertyDisplay).toBeDefined();
  });

  it('should get data', async () => {
    await component.getData();
    expect(component.dstSettings).toBeDefined();
    expect(itshop.getPeerGroupMemberships).toHaveBeenCalled();
  });
});
