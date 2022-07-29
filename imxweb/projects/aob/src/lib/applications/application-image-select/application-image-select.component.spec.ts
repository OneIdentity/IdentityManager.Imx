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
import { MatDialog } from '@angular/material/dialog';
import { configureTestSuite } from 'ng-bullet';
import { of } from 'rxjs';

import { Base64ImageService, clearStylesFromDOM } from 'qbm';
import { ApplicationImageSelectComponent } from './application-image-select.component';
import { IEntityColumn } from 'imx-qbm-dbts';

@Component({
  selector: 'imx-image-select',
  template: '<p>MockImageSelectComponent</p>'
})
class MockImageSelectComponent {
  @Input() public control: any;
  @Input() public valueWrapper: any;
  @Input() public fileFormatHint: any;
  @Input() public hideRemoveButton: any;
}

@Component({
  template: `
  <imx-application-image-select [column]="column"></imx-application-image-select>
  `
})
class TestHostComponent {
  @ViewChild(ApplicationImageSelectComponent, { static: true })
    public readonly component: ApplicationImageSelectComponent;

  private value;
  public readonly column = {
    GetMetadata: () => ({ CanEdit: () => true }),
    GetValue: () => this.value,
    PutValue: v => this.value = v,
  } as IEntityColumn;
}

describe('ApplicationImageSelectComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  let result: any;
  const mockMatDialog = {
    open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of(result) })
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        ApplicationImageSelectComponent,
        MockImageSelectComponent,
        TestHostComponent
      ],
      providers: [
        {
          provide: Base64ImageService,
          useValue: {
            addBase64Prefix: value => value,
            getImageData: value => value
          }
        },
        {
          provide: MatDialog,
          useValue: mockMatDialog
        }
      ],
    });
  });

  beforeEach(() => {
    mockMatDialog.open.calls.reset();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  for (const testcase of [
    { resultOpen: { file: 'myImageUrl'}, expected: 'myImageUrl' },
    { resultOpen: undefined, expected: undefined }
  ]) {
    it('should open the image-selector-dialog', async () => {
      const component = fixture.componentInstance.component;

      result = testcase.resultOpen;

      await component.openEditDialog();

      expect(mockMatDialog.open).toHaveBeenCalled();

      expect(component.control.value).toBe(testcase.expected ?? component['defaultIcon']);
      expect(component.column.GetValue()).toBe(testcase.expected);
    });
  }
});
