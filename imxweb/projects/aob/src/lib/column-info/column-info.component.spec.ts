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
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { EuiCoreModule } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';
import { TranslateModule } from '@ngx-translate/core';

import { ColumnInfoComponent } from './column-info.component';
import { IWriteValue } from 'imx-qbm-dbts';
import { DisableControlModule, clearStylesFromDOM } from 'qbm';

@Component({
  selector: 'imx-application-property',
  template: '<p>MockApplicationPropertyComponent</p>'
})
class MockApplicationPropertyComponent {
  @Input() public display: any;
  @Input() public icon: any;
}

describe('ColumnInfoComponent', () => {
  let component: ColumnInfoComponent<any>;
  let fixture: ComponentFixture<ColumnInfoComponent<any>>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [
        DisableControlModule,
        EuiCoreModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        TranslateModule.forRoot()
      ],
      declarations: [
        ColumnInfoComponent,
        MockApplicationPropertyComponent
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ColumnInfoComponent);
    component = fixture.componentInstance;
    component.property = {
      value: 'test',
      Column: {
        GetDisplayValue: _ => '',
        GetMetadata: () => ({ GetDisplay: (_) => '' })
      },
      GetMetadata: () => ({})
    } as IWriteValue<any>;
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });
});
