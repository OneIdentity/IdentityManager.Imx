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
 * Copyright 2021 One Identity LLC.
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

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { configureTestSuite } from 'ng-bullet';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { LoggerTestingModule } from 'ngx-logger/testing';

import { clearStylesFromDOM, ImxTranslationProviderService, MetadataService } from 'qbm';
import { PolicyService } from '../policy.service';
import { EditGenericComponent } from './edit-generic.component';
import { FilterElementModel } from './filter-element-model';
import { IEntityColumn } from 'imx-qbm-dbts';
import { PolicyFilterElement } from 'imx-api-att';
import { FilterElementColumnService } from './filter-element-column.service';


@Component({
    selector: 'imx-cdr-editor',
    template: '<p>MockRequestTable</p>'
})
class MockCdr {
    @Input() cdr: any;
    @Output() valueChange = new EventEmitter<any>();
}

function buildFilterModel(data: PolicyFilterElement, factory: FilterElementColumnService): FilterElementModel {
    const ret = new FilterElementModel([{ Uid: 'uid1' }], ['Display for uid1'], data, '', factory);
    return ret;
}

describe('EditGenericComponent', () => {
    let component: EditGenericComponent;
    let fixture: ComponentFixture<EditGenericComponent>;

    const mockPolicyService = {
        getFilterCandidates: jasmine.createSpy('getFilterCandidates').and.returnValue(Promise.resolve({ TotalCount: 1 }))
    }

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
                NoopAnimationsModule,
                LoggerTestingModule,
            ],
            declarations: [
                MockCdr,
                EditGenericComponent
            ],
            providers: [
                {
                    provide: ImxTranslationProviderService,
                    useValue: {}
                },
                {
                    provide: PolicyService,
                    useValue: mockPolicyService
                },
                {
                    provide: FilterElementColumnService,
                    useValue: mockFactory
                },
                {
                  provide: MetadataService,
                  useValue: {
                      updateTable: jasmine.createSpy('updateTable'),
                  }
              }
            ]
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(EditGenericComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        mockPolicyService.getFilterCandidates.calls.reset();
    });

    afterAll(() => {
        clearStylesFromDOM();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('can init', async () => {

        component.filterElementModel = buildFilterModel({ AttestationSubType: 'uid1' },
            TestBed.inject(FilterElementColumnService));
        await component.ngOnChanges();

        expect(component.cdr).toBeDefined();
    });

    xit('can emit a change', async () => {
        component.filterElementModel = buildFilterModel({ AttestationSubType: 'uid1' },
            TestBed.inject(FilterElementColumnService));
        await component.ngOnChanges();

        const spy = spyOn(component.valueChanged, 'emit');

        await component.invokeValueChangedEvent({DataValue: 'uid1', DisplayValue:'Display for uid1'});

        expect(spy.calls.mostRecent().args).toEqual([{ ParameterValue: '\'uid1\'', displays: ['Display for uid1'] }]);
    });


    it('can get candidates', async () => {
        component.filterElementModel = buildFilterModel({ AttestationSubType: 'uid1' },
            TestBed.inject(FilterElementColumnService));

        component.ngOnChanges();

        const elements = await component.cdr.column.GetMetadata().GetFkRelations()[0].Get();
        expect(elements.TotalCount).toEqual(1);
    });

});
