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

import { Component, ViewChild, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { EuiCoreModule } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { SelectComponent } from './select.component';
import { TypedEntity } from 'imx-qbm-dbts';
import { clearStylesFromDOM } from '../testing/clear-styles.spec';

@Component({
  selector: 'imx-autocomplete',
  template: '<p>MockAutocomplete</p>'
})
class MockAutocompleteComponent {
  @Input() public label: any;
  @Input() public multi: any;
  @Input() public itemIcon: any;
  @Input() public items: any;
  @Input() public itemsSelected: any;
  @Input() public dataSource: any;
  @Input() public contentProvider: any;
  @Input() public isLocalDatasource: any;
  @Input() public pageSize: any;
  @Input() public errorMessage: any;
  @Input() public totalCount: any;
}

@Component({
  template: `
  <form [formGroup]="formGroup">
    <imx-select [label]="label" [placeholder]="placeholder" [multi]="multi"
      [items]="items" [itemsSelected]="itemsSelected" [formCtrl]="formControl"
      [contentProvider]="contentProvider">
    </imx-select>
  </form>
  `
})
class TestHostComponent<T> {
  @ViewChild(SelectComponent, { static: true }) component: SelectComponent<T>;
  formControl = new FormControl();
  formGroup = new FormGroup({ control: this.formControl });
  label: string;
  placeholder: string;
  items = [];
  itemsSelected = [];
  multi = false;
  contentProvider = {
    display: item => item.GetEntity().GetDisplay(),
    key: item => item.GetEntity().GetKeys()[0]
  };

  // helper methods for tests:
  get keys(): string[] { return this.getKeys(this.items); }
  get keysSelected(): string[] { return this.getKeys(this.itemsSelected); }
  private getKeys(items: any[]): string[] { return items.map(item => this.contentProvider.key(item)); }
}

describe('SelectComponent', () => {
  let component: SelectComponent<TypedEntity>;
  let testHostComponent: TestHostComponent<TypedEntity>;
  let fixture: ComponentFixture<TestHostComponent<TypedEntity>>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        SelectComponent,
        MockAutocompleteComponent,
        TestHostComponent
      ],
      imports: [
        EuiCoreModule,
        FormsModule,
        LoggerTestingModule,
        MatChipsModule,
        MatIconModule,
        MatInputModule,
        MatProgressSpinnerModule,
        ScrollingModule,
        NoopAnimationsModule,
        ReactiveFormsModule
      ]
    })
  });

  beforeEach(() => {
    fixture = TestBed.createComponent<TestHostComponent<TypedEntity>>(TestHostComponent);
    testHostComponent = fixture.componentInstance;
    component = testHostComponent.component;
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  [
    { placeholder: null, expectedPlaceholder: 'label' },
    { placeholder: '', expectedPlaceholder: 'label' },
    { placeholder: 'placeholder', expectedPlaceholder: 'placeholder' }
  ].forEach(testcase => {
    it('should create with correct placeholder', () => {
      // Arrange
      testHostComponent.label = 'label';
      testHostComponent.placeholder = testcase.placeholder;

      // Act
      fixture.detectChanges();

      expect(component.label).toBe('label');
    })
  });

  [
    { removeExistingItem: true },
    { removeExistionItem: false }
  ].forEach(testcase => {
    it(`should handle removing ${testcase.removeExistingItem ? 'an existing' : 'a nonexisting'} item from the selection`, () => {
      // Arrange
      const existingItem = {
        GetEntity: () => ({
          GetDisplay: () => 'some to remove',
          GetKeys: () => ['0']
        })
      } as TypedEntity;

      const existingItemOther = {
        GetEntity: () => ({
          GetDisplay: () => 'some other',
          GetKeys: () => ['1']
        })
      } as TypedEntity;

      const itemToRemove = testcase.removeExistingItem ? existingItem : {
        GetEntity: () => ({
          GetDisplay: () => 'some to remove that does not exist',
          GetKeys: () => ['2']
        })
      } as TypedEntity;

      testHostComponent.itemsSelected = [
        existingItemOther,
        existingItem
      ];

      fixture.detectChanges();

      // Act
      component.removeItem(itemToRemove);

      // Assert
      if (testcase.removeExistingItem) {
        expect(testHostComponent.itemsSelected.length).toBe(1);
        expect(testHostComponent.keysSelected[0]).toEqual(testHostComponent.contentProvider.key(existingItemOther));
        expect(component.formCtrl.dirty).toBeTruthy();
      } else {
        expect(testHostComponent.itemsSelected.length).toBe(2);
        expect(component.formCtrl.dirty).toBeFalsy();
      }
    })
  });

});
