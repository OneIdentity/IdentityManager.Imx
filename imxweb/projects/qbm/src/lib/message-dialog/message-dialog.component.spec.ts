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
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { configureTestSuite } from 'ng-bullet';

import { MessageDialogComponent } from './message-dialog.component';
import { clearStylesFromDOM } from '../testing/clear-styles.spec';
import { MessageDialogResult } from './message-dialog-result.enum';

describe('MessageDialogComponent', () => {
  let component: MessageDialogComponent;
  let fixture: ComponentFixture<MessageDialogComponent>;
  const closeSpy = jasmine.createSpy('close');
  const data = {data: {}};

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [MatDialogModule],
      declarations: [ MessageDialogComponent ],
      providers: [
        {
          provide: MatDialogRef,
          useClass: class {
            close = closeSpy;
          }
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: data
        }
      ]
    })
  });



  beforeEach(() => {
    fixture = TestBed.createComponent(MessageDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('closes on callback', () => {
    component.click(MessageDialogResult.OkResult);
    expect(closeSpy).toHaveBeenCalled();
  });
});
