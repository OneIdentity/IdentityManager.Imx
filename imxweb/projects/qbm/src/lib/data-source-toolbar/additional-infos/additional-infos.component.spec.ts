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
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { configureTestSuite } from 'ng-bullet';

import { clearStylesFromDOM } from '../../testing/clear-styles.spec';
import { AdditionalInfosComponent } from './additional-infos.component';

describe('AdditionalInfosComponent', () => {
  let component: AdditionalInfosComponent;
  let fixture: ComponentFixture<AdditionalInfosComponent>;

  configureTestSuite(() =>
    TestBed.configureTestingModule({
      declarations: [AdditionalInfosComponent],
      providers: [
        {
          provide: MatDialogRef,
          useValue: { close: () => { } },
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            dataModel: {},
            entitySchema: {},
            displayedColumns: [],
            additionalPropertyNames: [],
            preselectedProperties: [],
            type: 'columns'
          }
        }
      ]
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(AdditionalInfosComponent);
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
