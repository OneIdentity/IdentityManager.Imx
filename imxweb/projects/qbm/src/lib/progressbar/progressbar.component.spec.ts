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
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { configureTestSuite } from 'ng-bullet';

import { ImxProgressbarComponent } from './progressbar.component';
import { clearStylesFromDOM } from '../testing/clear-styles.spec';

describe('ProgressbarComponent', () => {
  let component: ImxProgressbarComponent;
  let fixture: ComponentFixture<ImxProgressbarComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [MatProgressBarModule],
      declarations: [ImxProgressbarComponent]
    })
  });


  beforeEach(() => {
    fixture = TestBed.createComponent(ImxProgressbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('calculates absolute text', () => {
    component.maxValue = 100;
    component.value = 25;
    component.ngOnInit();
    expect(component.textVersion).toBe('25/100');
  });

  it('calculates percent text', () => {
    component.maxValue = 50;
    component.value = 10;
    component.inPercent = true;
    component.ngOnInit();
    expect(component.textVersion).toBe('20%');
  });
});
