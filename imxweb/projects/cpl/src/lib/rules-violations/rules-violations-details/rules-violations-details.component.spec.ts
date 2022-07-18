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
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';
import { clearStylesFromDOM } from 'qbm';
import { Subject } from 'rxjs';
import { RulesViolationsActionService } from '../rules-violations-action/rules-violations-action.service';

import { RulesViolationsDetailsComponent } from './rules-violations-details.component';

describe('RulesViolationsDetailsComponent', () => {
  let component: RulesViolationsDetailsComponent;
  let fixture: ComponentFixture<RulesViolationsDetailsComponent>;

  const sidesheetData = {
    actionParameters: {},
    rulesViolationsApprovals: [],
    approve: true,
    description: ''
  };

  const sideSheetRef = {
    close: jasmine.createSpy('close')
  };

  const rulesViolationsActionServiceStub = {
    applied: new Subject(),
    approve: jasmine.createSpy('approve'),
    deny: jasmine.createSpy('deny')
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        RulesViolationsDetailsComponent
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ],
      providers: [
        {
          provide: EUI_SIDESHEET_DATA,
          useValue: sidesheetData
        },
        {
          provide: EuiSidesheetRef,
          useValue: sideSheetRef
        },
        {
          provide: RulesViolationsActionService,
          useValue: rulesViolationsActionServiceStub
        },
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RulesViolationsDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  beforeEach(waitForAsync(() => {
    rulesViolationsActionServiceStub.approve.calls.reset();
    rulesViolationsActionServiceStub.deny.calls.reset();
  }));

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call approve from actionService', async() => {
    await component.approve()

    expect(rulesViolationsActionServiceStub.approve).toHaveBeenCalledOnceWith([sidesheetData]);
  });

  it('should call deny from actionService', async() => {
    await component.deny()

    expect(rulesViolationsActionServiceStub.deny).toHaveBeenCalledOnceWith([sidesheetData]);
  });
});
