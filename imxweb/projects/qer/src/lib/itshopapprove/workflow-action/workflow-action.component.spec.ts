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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { EUI_SIDESHEET_DATA, EuiSidesheetRef } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';

import { clearStylesFromDOM } from 'qbm';
import { WorkflowActionComponent } from './workflow-action.component';

@Component({
  selector: 'imx-bulk-editor',
  template: '<p>MockBulkEditorComponent</p>'
})
class MockBulkEditorComponent {
  @Input() entities: any;
  @Input() hideButtons: any;
}

@Component({
  selector: 'imx-cdr-editor',
  template: '<p>MockCdrEditorComponent</p>'
})
class MockCdrEditorComponent {
  @Input() public cdr: any;
}

@Component({
  selector: 'imx-decision-reason',
  template: '<p>MockDecisionReasonComponent</p>'
})
class MockDecisionReasonComponent {
  @Input() reasonStandard: any;
  @Input() reasonFreetext: any;
}

describe('WorkflowActionComponent', () => {
  let component: WorkflowActionComponent;
  let fixture: ComponentFixture<WorkflowActionComponent>;

  configureTestSuite(() =>
    TestBed.configureTestingModule({
      declarations: [
        WorkflowActionComponent,
        MockBulkEditorComponent,
        MockCdrEditorComponent,
        MockDecisionReasonComponent
      ],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule
      ],
      providers: [
        {
          provide: EUI_SIDESHEET_DATA,
          useValue: {
            actionParameters: { reason: { column: {} } },
            requests: [],
            showValidDate: true,
            customValidation: {
              validate: () => false,
              message: undefined
            }
          }
        },
        {
          provide: EuiSidesheetRef,
          useValue: {
            close: jasmine.createSpy('close')
          }
        }
      ]
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowActionComponent);
    component = fixture.componentInstance;
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
