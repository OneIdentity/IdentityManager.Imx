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
import { configureTestSuite } from 'ng-bullet';

import { clearStylesFromDOM, ColumnDependentReference } from 'qbm';
import { RulesViolationsApproval } from '../../rules-violations-approval';
import { RulesViolationsMultiActionComponent } from './rules-violations-multi-action.component';

describe('RulesViolationsMultiActionComponent', () => {
  let component: RulesViolationsMultiActionComponent;
  let fixture: ComponentFixture<RulesViolationsMultiActionComponent>;

  
  const rulesViolationsActionParameters = {
    reason: {
      column: {
        ColumnName: 'reason'
      }
    } as any as ColumnDependentReference,
  }

  const ruleViolationApproval = {
    GetEntity: () => ({ GetDisplay: () => 'some other' }),
    stateBadge: () => { caption: 'caption'}
  } as any as RulesViolationsApproval;

  const rulesViolationAction = {
    actionParameters: rulesViolationsActionParameters,
    rulesViolationsApprovals: [ ruleViolationApproval ],
    approve: true,
    description: ''
  };


  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        RulesViolationsMultiActionComponent
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ]
    })
      .compileComponents();
  });


  beforeEach(() => {
    fixture = TestBed.createComponent(RulesViolationsMultiActionComponent);
    component = fixture.componentInstance;
    component.data = rulesViolationAction;
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
