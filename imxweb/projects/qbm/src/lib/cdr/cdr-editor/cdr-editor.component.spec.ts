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

import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, AbstractControl } from '@angular/forms';
import { configureTestSuite } from 'ng-bullet';
import { LoggerTestingModule } from 'ngx-logger/testing';
import * as TypeMoq from 'typemoq';

import { CdrEditorComponent } from './cdr-editor.component';
import { ColumnDependentReference } from '../column-dependent-reference.interface';
import { CdrRegistryService } from '../cdr-registry.service';
import { clearStylesFromDOM } from '../../testing/clear-styles.spec';

@Component({
  template: `
  <imx-cdr-editor [cdr]="cdr" (controlCreated)="onControlCreated($event)"></imx-cdr-editor>
  `
})
class TestHostComponent {
  cdr: ColumnDependentReference;
  onControlCreated(control) { this.control = control; }
  @ViewChild(CdrEditorComponent, { static: true }) component: CdrEditorComponent;
  control: AbstractControl;
}

describe('CdrEditorComponent', () => {
  let component: CdrEditorComponent;
  let testHostComponent: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  const mockControl = new FormControl('some value');

  const cdrRegistryServiceStub = {
    createEditor: jasmine.createSpy('createEditor').and.returnValue({ instance: { control: mockControl } })
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [LoggerTestingModule],
      providers: [
        { provide: CdrRegistryService, useValue: cdrRegistryServiceStub },
      ],
      declarations: [
        CdrEditorComponent,
        TestHostComponent
      ]
    });
  });

  beforeEach(waitForAsync(() => {
    cdrRegistryServiceStub.createEditor.calls.reset();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    testHostComponent = fixture.componentInstance;
    component = testHostComponent.component;
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  [
    { cdr: undefined, expectedRegisterCalls: 0 },
    { cdr: TypeMoq.Mock.ofType<ColumnDependentReference>().object, expectedRegisterCalls: 1 }
  ].forEach(testcase =>
    it('calls CdrRegistryService register on creation if cdr is defined', () => {
      testHostComponent.cdr = testcase.cdr;

      fixture.detectChanges();

      expect(component.cdr).toEqual(testcase.cdr);
      expect(cdrRegistryServiceStub.createEditor).toHaveBeenCalledTimes(testcase.expectedRegisterCalls);
      if (testcase.expectedRegisterCalls > 0) {
        expect(testHostComponent.control.value).toEqual(mockControl.value);
      }
    })
  );
});
