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
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule, } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { EuiCoreModule, EuiLoadingService, EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';
import { LoggerTestingModule } from 'ngx-logger/testing';

import { PortalAttestationFilterMatchingobjects } from 'imx-api-att';
import { clearStylesFromDOM, ConfirmationService } from 'qbm';
import { PolicyService } from '../policy.service';
import { AttestationCasesComponentParameter } from './attestation-cases-component-parameter.interface';
import { AttestationCasesComponent } from './attestation-cases.component';


@Component({
  selector: 'imx-data-table',
  template: '<p>MockDataTableComponent</p>'
})
class MockDataTableComponent {
  @Input() public dst: any;
  @Input() public dataSource: any;
  @Input() public navigationState: any;
  @Input() public displayedColumns: any;
  @Input() public entitySchema: any;
  @Input() public mode: 'auto' | 'manual' = 'auto';
  @Input() public selectable = false;
  @Input() public detailViewTitle: string;

  @Output() public tableStateChanged: any;
}

@Component({
  selector: 'imx-data-table-column',
  template: '<p>MockDataTableColumnComponent</p>'
})
class MockDataTableColumnComponent {
  @Input() public entityColumn: any;
  @Input() public entitySchema: any;
  @Input() public columnLabel: any;
}

@Component({
  selector: 'imx-data-table-generic-column',
  template: '<p>MockDataTableGenericColumnComponent</p>'
})
class MockDataTableGenericColumnComponent {
  @Input() public columnLabel: any;
  @Input() public columnName: any;
}
@Component({
  selector: 'imx-cdr-editor',
  template: '<p>MockRequestTable</p>'
})
class MockCdr {
  @Input() cdr: any;
  @Output() valueChange = new EventEmitter<any>();
}

@Component({
  selector: 'imx-data-source-paginator',
  template: '<p>MockDataSourcePaginatorComponent</p>'
})
class MockDataSourcePaginatorComponent {
  @Input() public dst: any;
}

@Component({
  selector: 'imx-data-source-toolbar',
  template: '<p>MockDataSourceToolbarComponent</p>'
})
class MockDataSourceToolbarComponent {
  @Input() public dst: any;
  @Input() public hiddenElements: any;
  @Input() public settings: any;
}

describe('MatchingObjectsComponent', () => {
  let component: AttestationCasesComponent;
  let fixture: ComponentFixture<AttestationCasesComponent>;

  const mockPolicyService = {
    AttestationMatchingObjectsSchema: PortalAttestationFilterMatchingobjects.GetEntitySchema(),
    getObjectsForFilter: jasmine.createSpy('getObjectsForFilter').and.returnValue(Promise.resolve({})),
    createAttestationRun: jasmine.createSpy('createAttestationRun'),
    getDataModel: jasmine.createSpy('getDataModel').and.returnValue(Promise.resolve({})),
    getCasesThreshold: jasmine.createSpy('getCasesThreshold').and.returnValue(Promise.resolve(99999))
  }

  const sideSheetRef = {
    close: jasmine.createSpy('close')
  };

  let confirm = true;
  const mockConfirmationService = {
    confirm: jasmine.createSpy('confirm')
      .and.callFake(() => Promise.resolve(confirm))
  }

  let data: AttestationCasesComponentParameter = {
    canCreateRuns: true,
    concat: 'OR',
    filter: undefined,
    uidPickCategory: '',
    uidobject: 'objects'
  }

  const euiLoadingServiceStub = {
    hide: jasmine.createSpy('hide'),
    show: jasmine.createSpy('show')
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [
        EuiCoreModule,
        MatFormFieldModule,
        MatInputModule,
        MatCardModule,
        MatTabsModule,
        ReactiveFormsModule,
        MatSnackBarModule,
        NoopAnimationsModule,
        LoggerTestingModule
      ],
      declarations: [
        MockCdr,
        MockDataTableComponent,
        MockDataTableColumnComponent,
        MockDataTableGenericColumnComponent,
        MockDataSourceToolbarComponent,
        MockDataSourcePaginatorComponent,
        AttestationCasesComponent
      ],
      providers: [
        {
          provide: PolicyService,
          useValue: mockPolicyService
        },
        {
          provide: EuiLoadingService,
          useValue: euiLoadingServiceStub
        },
        {
          provide: EuiSidesheetRef,
          useValue: sideSheetRef
        },
        {
          provide: ConfirmationService,
          useValue: mockConfirmationService
        },
        { provide: EUI_SIDESHEET_DATA, useValue: data },
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AttestationCasesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    mockPolicyService.getObjectsForFilter.calls.reset();
    mockPolicyService.createAttestationRun.calls.reset();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  xit('should initialiize', async () => {
    await component.ngOnInit();
    expect(mockPolicyService.getObjectsForFilter).toHaveBeenCalledWith('objects', '',
      { Elements: undefined, ConcatenationType: 'OR' }, { PageSize: 20, StartIndex: 0, ParentKey: '' });
  });

  xit('can update navigation', async () => {
    await component.onNavigationStateChanged({ PageSize: 20, StartIndex: 21 });

    expect(mockPolicyService.getObjectsForFilter).toHaveBeenCalledWith('objects', '',
      { Elements: undefined, ConcatenationType: 'OR' }, { PageSize: 20, StartIndex: 21 });
  });

  it('can update selected', () => {
    const newSelection: PortalAttestationFilterMatchingobjects[] = [{
      Key: {
        value: '1'
      }
    } as PortalAttestationFilterMatchingobjects
    ]
    component.onSelectionChanged(newSelection);
    expect(component.selectedItems).toEqual(newSelection);
  });

  describe('an attestation run', () => {
    for (const testcase of [
      { confirm: true, cases: 1001 },
      { confirm: false, cases: 1001 },
      { confirm: true, cases: 1 },
      { confirm: false, cases: 1 }
    ]) {
      it(`${testcase.confirm ? 'should' : ' shouldn\'t'} be started, because the user ${testcase.confirm ? 'has' : 'has not'} confirmed the dialog`,
        async () => {
          confirm = testcase.confirm;

          const matching = Array.from(new Array(testcase.cases), (val, index) => (
            { Key: { value: '12345' + index } } as PortalAttestationFilterMatchingobjects
          ));
          component.data.uidpolicy = 'objects';

          await component.createRun(matching);

          if (testcase.cases <= 1000 || testcase.confirm) {
            expect(mockPolicyService.createAttestationRun).toHaveBeenCalledWith('objects', jasmine.any(Array));
          } else {
            expect(mockPolicyService.createAttestationRun).not.toHaveBeenCalled();
          }
        });
    }
  });
});
