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
import { configureTestSuite } from 'ng-bullet';
import { LoggerTestingModule } from 'ngx-logger/testing';

import { clearStylesFromDOM } from '../../testing/clear-styles.spec';
import { ViewPropertyDefaultComponent } from './view-property-default.component';

@Component({
  selector: 'imx-view-property',
  template: '<p>MockViewProperty</p>',
})
class MockViewProperty {
  @Input() columnContainer: any;
  @Input() defaultValue: any;
}

describe('ViewPropertyDefaultComponent', () => {
  let component: ViewPropertyDefaultComponent;
  let fixture: ComponentFixture<ViewPropertyDefaultComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        ViewPropertyDefaultComponent,
        MockViewProperty
      ],
      imports: [
        LoggerTestingModule
      ],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewPropertyDefaultComponent);
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
