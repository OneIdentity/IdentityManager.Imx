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

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { EuiLoadingService, EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { of } from 'rxjs';

import { PortalAttestationPolicyEditInteractive } from 'imx-api-att';
import { UserModelService } from 'qer';
import { clearStylesFromDOM, ConfirmationService, SnackBarService } from 'qbm';
import { EditMasterDataComponent } from './edit-master-data.component';
import { IEntityColumn } from 'imx-qbm-dbts';
import { Policy } from '../policy.interface';
import { PolicyService } from '../policy.service';
import { FilterElementColumnService } from '../editors/filter-element-column.service';


@Component({
    selector: 'imx-cdr-editor',
    template: '<p>MockRequestTable</p>'
})
class MockCdr {
    @Input() cdr: any;
    @Output() valueChange = new EventEmitter<any>();
    @Output() controlCreated = new EventEmitter<any>();
}


@Component({
    selector: 'imx-policy-editor',
    template: '<p>MockPolicyEditor</p>'
})
class MockPolicyEditor {
    @Input() public formGroup: any;
    @Input() public filterModel: any;
}

const commitSpy = jasmine.createSpy('Commit');

function buildPolicy(isInactiv: boolean, minlegth: number, openCases: number): any {
    return {
        Ident_AttestationPolicy: {
            value: 'uidpolicy',
            Column: {
                GetMetadata: () => ({
                    CanSee: () => true
                }),
                GetDisplayValue: () => '',
                ColumnName: 'Ident_AttestationPolicy'
            }
        },
        Description: {
            value: 'uidpolicy',
            Column: {
                GetMetadata: () => ({
                    CanSee: () => true
                }),
                GetDisplayValue: () => '',
                ColumnName: 'Description'
            }
        },
        IsApproveRequiresMfa: {
            value: true,
            Column: {
                GetMetadata: () => ({
                    CanSee: () => true
                }),
                GetDisplayValue: () => '',
                ColumnName: 'IsApproveRequiresMfa'
            }
        },
        IsAutoCloseOldCases: {
            value: true,
            Column: {
                GetMetadata: () => ({
                    CanSee: () => true
                }),
                GetDisplayValue: () => '',
                ColumnName: 'IsAutoCloseOldCases'
            }
        },
        IsInActive: {
            value: isInactiv,
            Column: {
                GetMetadata: () => ({
                    CanSee: () => true
                }),
                GetDisplayValue: () => '',
                ColumnName: 'IsInActive'
            }
        },
        RiskIndex: {
            value: 0.9,
            Column: {
                GetMetadata: () => ({
                    CanSee: () => true
                }),
                GetDisplayValue: () => '',
                ColumnName: 'RiskIndex'
            }
        },
        LimitOfOldCases: {
            value: 42,
            Column: {
                GetMetadata: () => ({
                    CanSee: () => true
                }),
                GetDisplayValue: () => '',
                ColumnName: 'LimitOfOldCases'
            }
        },
        SolutionDays: {
            value: 7,
            Column: {
                GetMetadata: () => ({
                    CanSee: () => true
                }),
                GetDisplayValue: () => '',
                ColumnName: 'SolutionDays'
            }
        },
        UID_DialogCulture: {
            value: 'uidDialogCulture',
            Column: {
                GetMetadata: () => ({
                    CanSee: () => true
                }),
                GetDisplayValue: () => '',
                ColumnName: 'UID_DialogCulture'
            }
        },
        UID_AttestationObject: {
            value: 'uidAttestationObject',
            Column: {
                GetMetadata: () => ({
                    CanSee: () => true
                }),
                GetDisplayValue: () => '',
                ColumnName: 'UID_AttestationObject'
            }
        },
        UID_PWODecisionMethod: {
            value: 'uidPWODecisionMethod',
            Column: {
                GetMetadata: () => ({
                    CanSee: () => true
                }),
                GetDisplayValue: () => '',
                ColumnName: 'UID_PWODecisionMethod'
            }
        },
        UID_AttestationPolicyGroup: {
            value: 'uidPolicyGroup',
            Column: {
                GetMetadata: () => ({
                    CanSee: () => true
                }),
                GetDisplayValue: () => '',
                ColumnName: 'UID_AttestationPolicyGroup'
            }
        },
        UID_DialogSchedule: {
            value: 'DialogSchedule',
            Column: {
                GetMetadata: () => ({
                    CanSee: () => true
                }),
                GetDisplayValue: () => '',
                ColumnName: 'UID_DialogSchedule'
            }
        },
        IsShowElementsInvolved: {
            value: true,
            Column: {
                GetMetadata: () => ({
                    CanSee: () => true
                }),
                GetDisplayValue: () => '',
                ColumnName: 'IsShowElementsInvolved'
            }
        },
        UID_PersonOwner: {
            value: 'Owner',
            Column: {
                GetMetadata: () => ({
                    CanSee: () => true
                }),
                GetDisplayValue: () => '',
                ColumnName: 'UID_PersonOwner'
            }
        },
        Areas: {
            value: 'area',
            Column: {
                GetMetadata: () => ({
                    CanSee: () => true
                }),
                GetDisplayValue: () => '',
                ColumnName: 'Areas'
            }
        },
        NextRun: {
            value: 'ein datum',
            Column: {
                GetMetadata: () => ({
                    CanSee: () => true
                }),
                GetDisplayValue: () => '',
                ColumnName: 'NextRun'
            }
        },
        IsOob: {
            value: 'true',
            Column: {
                GetMetadata: () => ({
                    CanSee: () => true
                }),
                GetDisplayValue: () => '',
                ColumnName: 'IsOob'
            }
        },
        Attestators: {
            value: 'attestator',
            Column: {
                GetMetadata: () => ({
                    CanSee: () => true
                }),
                GetDisplayValue: () => '',
                ColumnName: 'Attestators',
                PutValueStruct: () => { }
            },
            GetMetadata: () => ({
                GetMinLength: () => minlegth
            })
        },
        CountOpenCases: {
            value: openCases,
            Column: {
                GetMetadata: () => ({
                    CanSee: () => true
                })
            }
        },
        UID_QERPickCategory: {
            Value: 'category',
            Column: {
                PutValueStuct: () => { },
                GetDisplayValue: () => '',
                GetMetadata: () => ({
                    CanEdit: () => true,
                    CanSee: () => true
                })
            },
            GetMetadata: () => ({
                CanEdit: () => true
            })
        }, IsPickCategoryMismatch: {
            Value: false,
            Column: {
                GetMetadata: () => ({
                    CanSee: () => true
                })
            },
            GetMetadata: () => ({
                CanEdit: () => false
            })
        },
        GetEntity: () => ({
            GetKeys: () => ['uid'],
            GetDisplay: () => 'display',
            Commit: commitSpy
        })
    } as unknown;
}

describe('EditMasterDataComponent', () => {
    let component: EditMasterDataComponent;
    let fixture: ComponentFixture<EditMasterDataComponent>;

    const data: Policy = {
        policy: buildPolicy(true, 0, 0), filterData: {
            IsReadOnly: false,
            Filter: { Elements: [{ AttestationSubType: 'a subType', ParameterName: 'NAME', ParameterValue: 'tester' }] },
            InfoDisplay: [['tester']],
        },
        isComplienceFrameworkEnabled: true
    };

    const mockPolicyService = {
        deleteAttestationPolicy: jasmine.createSpy('deleteAttestationPolicy'),
        userCanSeePolicy: jasmine.createSpy('userCanSeePolicy').and.returnValue(Promise.resolve(false)),
        getPolicyEditInteractive: jasmine.createSpy('getPolicyEditInteractive').and.returnValue(Promise.resolve(data)),
        getRunCountForPolicy: jasmine.createSpy('getRunCountForPolicy').and.returnValue(Promise.resolve(0))
    }

    const mockColumnService = {
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

    const mockSidesheetRef = {
        close: jasmine.createSpy('close'),
        closeClicked: jasmine.createSpy('closeClicked').and.returnValue(of(undefined))
    };

    let confirmLeaveWithUnsavedChanges = true;    
    let confirm = true;
    const mockConfirmationService = {
        confirmLeaveWithUnsavedChanges: jasmine.createSpy('confirmLeaveWithUnsavedChanges')
            .and.callFake(() => Promise.resolve(confirmLeaveWithUnsavedChanges)),
        confirm: jasmine.createSpy('confirm')
            .and.callFake(() => Promise.resolve(confirm))
    }

    const euiLoadingServiceStub = {
        hide: jasmine.createSpy('hide'),
        show: jasmine.createSpy('show')
    };


    const snackBarServiceStub = {
        open: jasmine.createSpy('open')
    };


    let result: any;
    const mockMatDialog = {
        open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of(result) }),
        closeAll: jasmine.createSpy('closeAll')
    };

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            imports: [
                MatCardModule,
                MatFormFieldModule,
                MatInputModule,
                ReactiveFormsModule,
                NoopAnimationsModule,
                LoggerTestingModule
            ],
            declarations: [
                MockCdr,
                MockPolicyEditor,
                EditMasterDataComponent
            ],
            providers: [
                {
                    provide: PolicyService,
                    useValue: mockPolicyService
                },
                {
                    provide: FilterElementColumnService,
                    useValue: mockColumnService
                },
                {
                    provide: ConfirmationService,
                    useValue: mockConfirmationService
                },
                {
                    provide: SnackBarService,
                    useValue: snackBarServiceStub
                },
                {
                    provide: EuiLoadingService,
                    useValue: euiLoadingServiceStub
                },
                {
                    provide: EuiSidesheetRef,
                    useValue: mockSidesheetRef
                },
                {
                    provide: MatDialog,
                    useValue: mockMatDialog
                },
                {
                    provide: UserModelService,
                    useValue: {
                        getUserConfig: jasmine.createSpy('getUserConfig').and.returnValue(Promise.resolve(
                            { IsStarlingTwoFactorConfigured: true }
                        ))
                    }
                },
                { provide: EUI_SIDESHEET_DATA, useValue: data }
            ]
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(EditMasterDataComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        mockPolicyService.deleteAttestationPolicy.calls.reset();
        commitSpy.calls.reset();
    });

    afterAll(() => {
        clearStylesFromDOM();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    for (const isNew of [
        true, false
    ]) {
        it(`can init ${isNew ? 'new' : 'existing'} policy`, async () => {
            component.policy.isNew = isNew;
            await component.ngOnInit();
            expect(component.formGroup.dirty).toEqual(isNew);
        });
    }

    for (const column of ['Ident_AttestationPolicy', 'Description', 'IsApproveRequiresMfa',
        'IsAutoCloseOldCases', 'IsInActive', 'RiskIndex', 'SolutionDays', 'UID_AttestationObject',
        'LimitOfOldCases',
        'UID_DialogCulture',
        'UID_PWODecisionMethod', 'UID_DialogSchedule', 'Areas', 'Attestators']) {
        it(`can add a form control for column ${column}`, fakeAsync(() => {
            const form = new FormControl();
            expect(component.objectProperties[column].formControl).not.toBeDefined();

            component.addControl(form, column);

            tick(1000);
            expect(component.objectProperties[column].formControl).toBeDefined();
        }));
    }

    it('updates dependencies', () => {
        const oldCdr = component.objectProperties.UID_PWODecisionMethod.cdr;

        expect(component.policy.filterData.Filter.Elements.length).toEqual(1)

        component.updateMethodAndFilter();

        expect(oldCdr).not.toBe(component.objectProperties.UID_PWODecisionMethod.cdr);
        expect(component.policy.filterData.Filter.Elements.length).toEqual(0)
    });

    it('updates attestations', async () => {
        const oldCdr = component.objectProperties.Attestators.cdr;

        await component.updateAttestation();

        expect(oldCdr).not.toBe(component.objectProperties.Attestators.cdr);
    });

    it('submits data', async () => {
        component.formGroup.markAsDirty();

        await component.submit();
        expect(commitSpy).toHaveBeenCalled();

    });

    for (const testcase of [
        { confirm: true, description: 'can delete a policy' },
        { confirm: false, description: 'can cancel delete for a policy' }
    ]) {
        it(testcase.description, async () => {
            confirm = testcase.confirm

            component.policy.policy = buildPolicy(false, 0, 0) as PortalAttestationPolicyEditInteractive

            await component.delete();

            if (testcase.confirm) {
                expect(mockPolicyService.deleteAttestationPolicy).toHaveBeenCalled();
                expect(mockSidesheetRef.close).toHaveBeenCalledWith(true);
            } else {
                expect(mockPolicyService.deleteAttestationPolicy).not.toHaveBeenCalled();
            }
        });
    }

    for (const testcase of [
        { description: 'active => inactive (with pending)', oldValue: false, result: true, hasPending: true, expectRevert: false, expects: false },
        { description: 'active => active (with pending and cancelation)', oldValue: false, result: false, hasPending: true, expectRevert: true, expects: true },
        { description: 'active => inactive (without pending)', oldValue: false, result: false, hasPending: false, expectRevert: false, expects: true },
        { description: 'inactive => active (with pending)', oldValue: true, result: true, hasPending: true, expectRevert: false, expects: false }
    ]) {
        it(testcase.description, fakeAsync(() => {
            tick(1000);
            component.policy.policy = buildPolicy(testcase.oldValue, 0, testcase.hasPending ? 1 : 0) as PortalAttestationPolicyEditInteractive

            const form = new FormControl();
            result = testcase.result;
            component.addControl(form, 'IsInActive');
            tick(1000);

            component.policy.policy.IsInActive.value = !testcase.oldValue;
            form.setValue(!testcase.oldValue);
            tick(1000);

            expect(component.policy.policy.IsInActive.value).toEqual(testcase.expects);
        }));
    }
});
