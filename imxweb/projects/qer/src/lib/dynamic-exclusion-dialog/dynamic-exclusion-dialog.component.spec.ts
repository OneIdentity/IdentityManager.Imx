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
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RequestsConfigurationTestBed } from '../itshop-config/test/requests-configuration-test-bed';
import { DynamicExclusionDialogComponent } from './dynamic-exclusion-dialog.component';

describe('DynamicExclusionDialogComponent', () => {
  let component: DynamicExclusionDialogComponent;
  let fixture: ComponentFixture<DynamicExclusionDialogComponent>;

  const mockMatDialogRef = {
    close: jasmine.createSpy('close')
  };

  RequestsConfigurationTestBed.configureTestingModule({
    imports: [
      MatDialogModule,
      NoopAnimationsModule
    ],
    declarations: [ DynamicExclusionDialogComponent ],
    providers: [
      {
        provide: MatDialogRef,
        useValue: mockMatDialogRef
      }
    ]
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicExclusionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('save() tests', () => {
    it('should close the dialog with the description form field value', () => {
      mockMatDialogRef.close.calls.reset();
      const mockReason = 'A test reason';
      component.dynamicExclusionForm.get('description').setValue(mockReason);
      component.save();
      expect(mockMatDialogRef.close).toHaveBeenCalledWith(mockReason);
    });
  });
  describe('cancel() tests', () => {
    it('should close the dialog with the description form field value', () => {
      mockMatDialogRef.close.calls.reset();
      component.cancel();
      expect(mockMatDialogRef.close).toHaveBeenCalledWith(undefined);
    });
  });
});
