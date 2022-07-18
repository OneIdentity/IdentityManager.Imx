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
import { ActivatedRoute } from '@angular/router';
import { EuiCoreModule, EuiSidesheetService } from '@elemental-ui/core';
import { Subject } from 'rxjs';

import { IClientProperty } from 'imx-qbm-dbts';
import { UserMessageService } from 'qbm';
import { ServiceItemsEditComponent } from './service-items-edit.component';
import { ServiceItemsEditService } from './service-items-edit.service';

describe('ServiceItemsEditComponent', () => {
  let component: ServiceItemsEditComponent;
  let fixture: ComponentFixture<ServiceItemsEditComponent>;

  const sidesheetServiceStub = {
    open: jasmine.createSpy('open')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        ServiceItemsEditComponent
      ],
      imports: [
        EuiCoreModule
      ],
      providers: [
        {
          provide: ServiceItemsEditService,
          useValue: {
            serviceitemsSchema: { Columns: { __Display: { ColumnName: '__Display' } as IClientProperty } },
            get: jasmine.createSpy('get').and.returnValue({}),
            handleOpenLoader: jasmine.createSpy('handleOpenLoader').and.callThrough(),
            handleCloseLoader: jasmine.createSpy('handleCloseLoader').and.callThrough(),
          }
        },
        {
          provide: EuiSidesheetService,
          useValue: sidesheetServiceStub
        },
        {
          provide: UserMessageService,
          useValue: {
            subject: new Subject()
          }
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              url: [
                {
                  path: 'admin'
                },
                {
                  path: 'serviceitems'
                },
              ],
            }
          }
        }
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceItemsEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
