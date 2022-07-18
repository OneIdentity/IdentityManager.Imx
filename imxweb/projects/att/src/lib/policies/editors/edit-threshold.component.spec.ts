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
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { configureTestSuite } from 'ng-bullet';

import { clearStylesFromDOM } from 'qbm';
import { EditThresholdComponent } from './edit-threshold.component';

describe('EditThresholdComponent', () => {
    let component: EditThresholdComponent;
    let fixture: ComponentFixture<EditThresholdComponent>;

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            imports: [
                MatFormFieldModule,
                MatInputModule,
                ReactiveFormsModule,
                NoopAnimationsModule
            ],
            declarations: [
                EditThresholdComponent
            ]
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(EditThresholdComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterAll(() => {
        clearStylesFromDOM();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('emits event on change', () => {
        component.ngOnInit();

        const spy = spyOn(component.valueChanged, 'emit');

        component.riskIndexForm.get('lowerBounds').setValue(0.1);
        component.riskIndexForm.get('upperBounds').setValue(0.9);

        expect(spy.calls.mostRecent().args).toEqual([{
            ParameterValue: '0.1',
            ParameterValue2: '0.9',
            displays: ['10 - 90']
        }]);
    });
});
