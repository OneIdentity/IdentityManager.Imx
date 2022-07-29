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
import { EditUintComponent } from './edit-uint.component';
import { FilterElementColumnService } from './filter-element-column.service';
import { FilterElementModel } from './filter-element-model';


function buildFilterModel(value: string): FilterElementModel {
    const ret = new FilterElementModel([],
        [value],
        { ParameterValue: value },
        '',
        ({ buildColumn: jasmine.createSpy('buildColumn') } as unknown) as FilterElementColumnService
    );

    return ret;
}
describe('EditUnitComponent', () => {
    let component: EditUintComponent;
    let fixture: ComponentFixture<EditUintComponent>;

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            imports: [
                MatFormFieldModule,
                MatInputModule,
                ReactiveFormsModule,
                NoopAnimationsModule
            ],
            declarations: [
                EditUintComponent
            ]
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(EditUintComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterAll(() => {
        clearStylesFromDOM();
    });

    it('should create', () => {
        component.filterElementModel = buildFilterModel('2');

        expect(component).toBeTruthy();
    });


    it('emits event on change', () => {
        let value;
        component.valueChanged.subscribe(v => value = v);

        component.filterElementModel = buildFilterModel('2');
        component.ngOnInit();

        component.control.setValue(2);

        expect(value).toEqual({ ParameterValue: 2, displays: ['2'] });
    });
});
