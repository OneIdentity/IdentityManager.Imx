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
import { EuiCoreModule } from '@elemental-ui/core';
import * as CadenceIcons from '@elemental-ui/cadence-icon/codepoints';
import { configureTestSuite } from 'ng-bullet';

import { IconStackComponent } from './icon-stack.component';
import { clearStylesFromDOM } from '../testing/clear-styles.spec';

describe('IconStackComponent', () => {
  let component: IconStackComponent;
  let fixture: ComponentFixture<IconStackComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [IconStackComponent],
      imports: [EuiCoreModule]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IconStackComponent);
    component = fixture.componentInstance;
    component.icon1 = Object.keys(CadenceIcons)[0];
    component.icon2 = Object.keys(CadenceIcons)[0];
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });
});
