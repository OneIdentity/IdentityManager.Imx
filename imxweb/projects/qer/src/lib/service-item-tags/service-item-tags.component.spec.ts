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
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { configureTestSuite } from 'ng-bullet';

import { clearStylesFromDOM } from 'qbm';
import { ServiceItemTagsComponent } from './service-item-tags.component';

describe('ServiceItemTagsComponent', () => {
  let component: ServiceItemTagsComponent;
  let fixture: ComponentFixture<ServiceItemTagsComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        ServiceItemTagsComponent
      ],
      imports: [
        MatChipsModule,
        MatIconModule,
        MatFormFieldModule,
        NoopAnimationsModule,
        TranslateModule.forRoot()
      ],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceItemTagsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add a tag', () => {
    component.selection = ['a'];

    component.addTag({ value: 'b' } as MatChipInputEvent);

    expect(component.selection).toEqual(['a','b']);
  });

  it('should remove a tag', () => {
    component.selection = ['a'];

    component.removeTag('a');

    expect(component.selection).toEqual([]);
  });
});
