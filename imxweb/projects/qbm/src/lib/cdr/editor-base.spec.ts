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

import { EventEmitter } from '@angular/core';
import { TestBed, ComponentFixture, inject } from '@angular/core/testing';
import { FormControl, AbstractControl } from '@angular/forms';
import { configureTestSuite } from 'ng-bullet';
import { LoggerTestingModule } from 'ngx-logger/testing';

import { EditorBase } from './editor-base';
import { ClassloggerService } from '../classlogger/classlogger.service';
import { clearStylesFromDOM } from '../testing/clear-styles.spec';
import { IEntityColumn } from 'imx-qbm-dbts';

class EditorMock extends EditorBase {
  control = new FormControl();
}

describe('EditorBase', () => {
  let component: EditorMock;
  let fixture: ComponentFixture<EditorMock>;

  function createColumn(minLength = 0) {
    return {
      ColumnChanged: {
        subscribe: (args) => { return { unsubscribe: () => { } } }
      },
      GetDisplayValue: () => undefined,
      GetValue: () => undefined,
      GetMetadata: () => ({
        GetMinLength: () => minLength,
        GetMaxLength: () => 255,
        CanEdit: () => true
      })
    };
  }

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerTestingModule
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditorMock);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });


  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create an instance', inject([ClassloggerService], (logger: ClassloggerService)  => {
    expect(new EditorMock(logger)).toBeDefined();
  }));

  it('can handle null', inject([ClassloggerService], (logger: ClassloggerService) => {
    const test = new EditorMock(logger);
    test.bind({
      column: null,
      isReadOnly: () => false
    });
    expect(test.columnContainer.value).toBeUndefined();
  }));

  it('should create and bind', inject([ClassloggerService], logger => {
    const editor = new EditorMock(logger);
    editor.bind({
      column: createColumn() as IEntityColumn,
      isReadOnly: () => false
    });
    expect(editor).toBeDefined();
  }));

  it('unsubscribes on destroy', () => {
    component.control = new FormControl();

    component.bind({
      column: createColumn() as IEntityColumn,
      isReadOnly: () => false
    });

    fixture.detectChanges();

    const valueChanges = component.control.valueChanges as EventEmitter<any>;

    fixture.destroy();

    expect(valueChanges.observers.length).toEqual(0);
  });

  [
    { description: '= 0', minLength: 0, expectedValidator: false },
    { description: '> 0', minLength: 1, expectedValidator: true }
  ].forEach(testcase =>
  it('should ' + (testcase.expectedValidator ? '' : 'not') + 'set the validator if minLength '
    + testcase.description, inject([ClassloggerService], logger => {
    const editor = new EditorMock(logger);
    editor.bind({
      column: createColumn(testcase.minLength) as IEntityColumn,
      isReadOnly: () => false
    });
    if (testcase.expectedValidator) {
      expect(editor.control.validator({} as AbstractControl).required).toBeDefined();
    } else {
      expect(editor.control.validator).toBeNull();
    }
  })));
});
