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

import { PipeTransform, Pipe, Component, Input, Output, EventEmitter } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { configureTestSuite } from 'ng-bullet';

import { clearStylesFromDOM } from 'qbm';
import { OrderForAdditionalUsersComponent } from './order-for-additional-users.component';
import { PortalCartitem } from 'imx-api-qer';
import { TypedEntity } from 'imx-qbm-dbts';
import { EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';

@Pipe({ name: 'ldsReplace' })
class MockLdsReplacePipe implements PipeTransform {
    transform() { }
}

@Component({
    selector: 'imx-fk-selector',
    template: '<p>MockFk selector</p>'
})

class MockFkSelector {
    @Input() public data: any;
    @Output() public elementSelecte = new EventEmitter<any>();
    @Output() public tableselected = new EventEmitter<any>();
}


describe('OrderForAdditionalUsersComponent', () => {
    let component: OrderForAdditionalUsersComponent;
    let fixture: ComponentFixture<OrderForAdditionalUsersComponent>;

    const cartItemEntity = {
        Commit: (reload?: any) => { }
    };

    const cartItem = {
        PWOPriority: { value: 1 },
        OrderReason: { value: 'No reason' },
        GetEntity: () => cartItemEntity,
        EntityWriteDataSingle: {}
    } as PortalCartitem;

    const cartItemContainer = {
        cartItem: cartItem,
        requestColumns: [
            {
                ColumnName: 'testColumn1',
                ExtendedProperties: []
            }
        ]
    };

    const mocksidesheetRefStub = {
        close: jasmine.createSpy('close')
    };

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            declarations: [
                OrderForAdditionalUsersComponent,
                MockLdsReplacePipe,
                MockFkSelector
            ],
            providers: [
                {
                    provide: EUI_SIDESHEET_DATA,
                    useValue: {
                        cartItemContainer: cartItemContainer
                    }
                },
                {
                    provide: EuiSidesheetRef,
                    useValue: mocksidesheetRefStub
                },
            ]
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(OrderForAdditionalUsersComponent);
        component = fixture.componentInstance;

        mocksidesheetRefStub.close.calls.reset();
    });

    afterAll(() => {
        clearStylesFromDOM();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should close the dialog with the selected typedentity list', () => {
        const data = [{}] as TypedEntity[];

        component.closeDialog(data);

        expect(mocksidesheetRefStub.close).toHaveBeenCalledWith(data);

    });
});
