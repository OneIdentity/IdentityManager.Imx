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
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { EuiCoreModule } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';

import { AutoCompleteComponent } from './auto-complete.component';
import { clearStylesFromDOM } from '../testing/clear-styles.spec';

describe('AutoCompleteComponent', () => {
  let component: AutoCompleteComponent;
  let fixture: ComponentFixture<AutoCompleteComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, MatAutocompleteModule, MatInputModule, EuiCoreModule],
      declarations: [ AutoCompleteComponent ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AutoCompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('can filter elements', () => {
    component.availableOptions = ['testen1', 'testen2', 'test3'];
    component.filterText = 'testen';
    component.filterOptions();
    expect(component.filteredOptions.length).toBe(2);
    expect(component.filteredOptions[0]).toBe('testen1');
    expect(component.filteredOptions[1]).toBe('testen2');
  });

  it('can clear elements', () => {
    component.availableOptions = ['testen1', 'testen2', 'test3'];
    component.filterText = 'testen';
    component.filterOptions();
    expect(component.filteredOptions.length).toBe(2);
    component.clearText();
    expect(component.filteredOptions.length).toBe(3);
    expect(component.filterText).toBe('');
  });
});
