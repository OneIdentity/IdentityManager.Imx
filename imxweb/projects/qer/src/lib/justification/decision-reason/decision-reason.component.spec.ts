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

import { Component, Input, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { configureTestSuite } from 'ng-bullet';

import { IEntityColumn } from 'imx-qbm-dbts';
import { clearStylesFromDOM } from 'qbm';
import { JustificationService } from '../justification.service';
import { DecisionReasonComponent } from './decision-reason.component';

@Component({
  selector: 'imx-cdr-editor',
  template: '<p>MockCdrEditorComponent</p>'
})
class MockCdrEditorComponent {
  @Input() cdr: any;
}

@Component({
  template: `
  <imx-decision-reason
    [reasonStandard]="reasonStandard"
    [reasonFreetext]="reasonFreetext">
  </imx-decision-reason>
  `
})
class TestHostComponent {
  readonly reasonStandard = {
    column: {} as IEntityColumn,
    isReadOnly: () => false
  };
  readonly reasonFreetext = {
    column: {} as IEntityColumn,
    isReadOnly: () => false
  };
  @ViewChild(DecisionReasonComponent, { static: true }) component: DecisionReasonComponent;
}

describe('DecisionReasonComponent', () => {
  let testHostComponent: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  const mockJustifications = {};

  configureTestSuite(() =>
    TestBed.configureTestingModule({
      declarations: [
        DecisionReasonComponent,
        MockCdrEditorComponent,
        TestHostComponent
      ],
      providers: [
        {
          provide: JustificationService,
          useValue: {
            get: uid => Promise.resolve(mockJustifications[uid])
          }
        }
      ]
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    testHostComponent = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  for (const testcase of [
    { minLength: 0 },
    { requiresText: false, uid: 'some uid', minLength: 0 },
    { requiresText: true, uid: 'some uid', minLength: 1 }
  ]) {
    it('checks reason', async () => {
      if (testcase.uid) {
        mockJustifications[testcase.uid] = { RequiresText: { value: testcase.requiresText } };
      }

      const value = {
        DataValue: testcase.uid
      };

      spyOn(testHostComponent.component, 'addReasonFreetext');

      await testHostComponent.component.checkReason(value);

      expect(testHostComponent.component.reasonFreetext.minLength).toEqual(testcase.minLength);
    });
  }
});
