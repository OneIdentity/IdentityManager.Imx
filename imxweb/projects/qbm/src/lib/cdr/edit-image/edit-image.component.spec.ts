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
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { configureTestSuite } from 'ng-bullet';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { Subject } from 'rxjs';

import { clearStylesFromDOM } from '../../testing/clear-styles.spec';
import { EditImageComponent } from './edit-image.component';
import { IEntityColumn } from 'imx-qbm-dbts';
import { FileSelectorService } from '../../file-selector/file-selector.service';
import { Base64ImageService } from '../../images/base64-image.service';

@Component({
  selector: 'imx-image-select',
  template: '<p>MockImageSelectComponent</p>'
})
class MockImageSelectComponent {
  @Input() public control: any;
  @Input() public valueWrapper: any;
  @Input() public fileFormatHint: any;
}

function createColumn(value:any, minLength = 0) {
  return {
    GetDisplayValue: () => undefined,
    GetValue: () => value,
    PutValue: newValue => value = newValue,
    GetMetadata: () => ({
      GetDisplay: ()=> '',
      GetMinLength: () => minLength,
      CanEdit: () => true
    })
  };
}

const fileSelectorService = {
  fileFormatError: new Subject(),
  fileSelected: new Subject<any>()
};

describe('EditImageComponent', () => {
  let component: EditImageComponent;
  let fixture: ComponentFixture<EditImageComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        EditImageComponent,
        MockImageSelectComponent
      ],
      providers: [
        {
          provide: FileSelectorService,
          useValue: fileSelectorService
        },
        {
          provide: Base64ImageService,
          useValue: {
            getImageData: filepath => filepath
          }
        }
      ],
      imports: [
        FormsModule,
        LoggerTestingModule,
        MatInputModule,
        NoopAnimationsModule,
        ReactiveFormsModule
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('sets the control value on bind', () => {
    const value = 'someImageBinaryData';
    component.bind({
      column: createColumn(value) as IEntityColumn,
      isReadOnly: () => false
    });
    expect(component.control.value).toEqual(value);
  });

  [
    { description: '= 0', defaultValue:'', minLength: 0, expectedError: false },
    { description: '> 0 and no value is set', defaultValue:'', minLength: 1, expectedError: true },
    { description: '> 0 and a value is set', defaultValue:'a', minLength: 1, expectedError: false }
  ].forEach(testcase =>
  it(`should set error.required to ${ testcase.expectedError} if minLength ${testcase.description}`, () => {
    component.bind({
      column: createColumn(testcase.defaultValue,testcase.minLength) as IEntityColumn,
      isReadOnly: () => false
    });

    component.control.markAsTouched();
    component.control.updateValueAndValidity({ onlySelf: true, emitEvent: false });

    if (testcase.expectedError) {
      expect(component.control.errors.required).toBeTruthy();
    } else {
      expect(component.control.errors).toBeNull();
    }
  }));

  it('removes the current image', async () => {
    let value = 'someImageBinaryData';
    component.bind({
      column: createColumn(value) as IEntityColumn,
      isReadOnly: () => false
    });

    component.control.markAsPristine();

    expect(component.control.value).toBeDefined();
    expect(component.columnContainer.value).toBeDefined();

    await component.remove();

    expect(component.control.dirty).toBeTruthy();
    expect(component.control.value).toBeUndefined();
    expect(component.columnContainer.value).toBeUndefined();
  });

  it('changes the current image', fakeAsync(() => {
    let value = 'someImageBinaryData';
    component.bind({
      column: createColumn(value) as IEntityColumn,
      isReadOnly: () => false
    });

    component.control.markAsPristine();

    expect(component.control.value).toBeDefined();
    expect(component.columnContainer.value).toBeDefined();

    fileSelectorService.fileSelected.next('some other image');

    tick();

    expect(component.control.dirty).toBeTruthy();
    expect(component.control.value).toEqual('some other image');
    expect(component.columnContainer.value).toEqual('some other image');
  }));
});
