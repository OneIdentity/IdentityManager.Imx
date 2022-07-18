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

import { EventEmitter } from '@angular/core';
import { Component, Input, Output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PolicyFilterElement } from 'imx-api-att';
import { IEntityColumn } from 'imx-qbm-dbts';
import { configureTestSuite } from 'ng-bullet';

import { clearStylesFromDOM } from 'qbm';
import { EditNameComponent } from './edit-name.component';
import { FilterElementColumnService } from './filter-element-column.service';
import { FilterElementModel } from './filter-element-model';

function buildFilterModel(data: PolicyFilterElement, factory: FilterElementColumnService): FilterElementModel {
    const ret = new FilterElementModel([{ Uid: 'uid1' }], ['Display for uid1'], data, '', factory);
    return ret;
}

@Component({
    selector: 'imx-cdr-editor',
    template: '<p>MockRequestTable</p>'
})
class MockCdr {
    @Input() cdr: any;
    @Output() valueChange = new EventEmitter<any>();
}

describe('EditNameComponent', () => {
    let component: EditNameComponent;
    let fixture: ComponentFixture<EditNameComponent>;

    const mockFactory = {
        buildColumn: jasmine.createSpy('buildColumn').and.returnValue({
            GetValue: () => 'uid1',
            GetDisplayValue: () => 'Display for uid1',
            GetMetadata: () => ({
                GetFkRelations: () => [{
                    Get: () => ({ Entities: [], TotalCount: 1 })
                }]
            }) as unknown

        } as IEntityColumn)
    }

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            imports: [
                MatFormFieldModule,
                MatInputModule,
                ReactiveFormsModule,
                NoopAnimationsModule
            ],
            providers: [
                {
                    provide: FilterElementColumnService,
                    useValue: mockFactory
                }
            ],
            declarations: [
                MockCdr,
                EditNameComponent
            ]
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(EditNameComponent);
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
        component.filterElementModel = buildFilterModel({ ParameterValue: '' }, TestBed.inject(FilterElementColumnService));
        component.ngOnChanges();

        const spy = spyOn(component.valueChanged, 'emit');

        const control = new FormControl('');
        component.invokeValueChangedEvent(control);
        control.setValue('name');
        expect(spy.calls.mostRecent().args).toEqual([{ ParameterValue: 'name', displays: ['name'] }]);
        component.invokeValueChangedEvent(control);
        control.setValue('name2');
        expect(spy.calls.mostRecent().args).toEqual([{ ParameterValue: 'name2', displays: ['name2'] }]);
    });
});
