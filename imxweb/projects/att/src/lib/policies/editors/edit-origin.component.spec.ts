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
 * Copyright 2023 One Identity LLC.
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

import { ParmOpt } from 'imx-api-att';
import { ClassloggerService, clearStylesFromDOM } from 'qbm';
import { EditOriginComponent } from './edit-origin.component';
import { FilterElementColumnService } from './filter-element-column.service';
import { FilterElementModel } from './filter-element-model';
import { MockBuilder, MockedComponentFixture, MockRender } from 'ng-mocks';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';


function buildFilterModel(config: ParmOpt[], value: string): FilterElementModel {
    const ret = new FilterElementModel([{ Uid: '1', Options: config }],
        ['1 Display'], { ParameterValue: value, AttestationSubType: '1' },
        '',
        ({ buildColumn: jasmine.createSpy('buildColumn') } as unknown) as FilterElementColumnService
    );

    return ret;
}

describe('EditOriginComponent', () => {
    let component: EditOriginComponent;
    let fixture: MockedComponentFixture<EditOriginComponent>;

    beforeEach(() => {
      return MockBuilder(EditOriginComponent)
        .mock(ClassloggerService)
        .beforeCompileComponents(testbed => {
          testbed.configureTestingModule({
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
          })
        })
    })


    beforeEach(() => {
        fixture = MockRender(EditOriginComponent)
        component = fixture.point.componentInstance;
        fixture.detectChanges();
    });

    afterAll(() => {
        clearStylesFromDOM();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('inits controls', () => {
        const options = [
            { Display: 'One', Uid: '1' },
            { Display: 'Two', Uid: '2' },
            { Display: 'Three', Uid: '3' },
        ];
        component.filterElementModel = buildFilterModel(options, '"1","2"');
        component.ngOnInit();

        expect(component.control.controls.length).toEqual(3);
        expect(component.control.controls[0].value).toBeTruthy();
        expect(component.control.controls[1].value).toBeTruthy();
        expect(component.control.controls[2].value).toBeFalsy();
    });

    it('emits changes', () => {
        const options = [
            { Display: 'One', Uid: '1' },
            { Display: 'Two', Uid: '2' },
            { Display: 'Three', Uid: '3' },
        ];

        component.filterElementModel = buildFilterModel(options, '\'2\',\'3\'')
        component.ngOnInit();

        const spy = spyOn(component.valueChanged, 'emit');

        component.control.controls[0].setValue(false);
        component.control.controls[2].setValue(true);

        expect(spy.calls.mostRecent().args).toEqual([{ ParameterValue: '\'2\',\'3\'', displays: ['\'Two\'', '\'Three\''] }]);

    });
});
