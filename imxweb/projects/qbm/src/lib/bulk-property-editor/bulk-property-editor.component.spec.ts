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

import { Component, Input, Output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { configureTestSuite } from 'ng-bullet';

import { clearStylesFromDOM } from '../testing/clear-styles.spec';
import { BulkPropertyEditorComponent } from './bulk-property-editor.component';

@Component({
  selector: 'imx-bulk-item',
  template: '<p>MockBulkItemComponent</p>'
})
class MockBulkItemComponent {
  @Input() public bulkItem: any;
  @Input() public expanded: any;
  @Output() public skipItem: any;
  @Output() public saveItem: any;
}

describe('BulkPropertyEditorComponent', () => {
  let component: BulkPropertyEditorComponent;
  let fixture: ComponentFixture<BulkPropertyEditorComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        BulkPropertyEditorComponent,
        MockBulkItemComponent
      ],
      imports: [
        FormsModule,
        MatExpansionModule,
        ReactiveFormsModule
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkPropertyEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
