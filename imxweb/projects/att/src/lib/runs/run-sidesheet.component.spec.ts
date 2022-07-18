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

import { Component, Input, Output, Pipe, PipeTransform } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { EuiCoreModule, EuiLoadingService, EuiSidesheetRef, EuiSidesheetService, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';
import { of, Subject } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AuthenticationService, clearStylesFromDOM, ColumnDependentReference, SnackBarService } from 'qbm';
import { RunsService } from './runs.service';
import { RunSidesheetComponent } from './run-sidesheet.component';
import { AttestationActionService } from '../attestation-action/attestation-action.service';
import { AttestationHistoryService } from '../attestation-history/attestation-history.service';
import { AttestationHistoryActionService } from '../attestation-history/attestation-history-action.service';

@Pipe({ name: 'ldsReplace' })
class MockLdsReplacePipe implements PipeTransform {
  transform(value, ..._: []) { return value; }
}

@Component({
  selector: 'imx-progress',
  template: '<p>MockProgressComponent</p>',
})
export class MockProgressComponent {
  @Input() public attestationRun: any;
  @Input() public limit: any;
  @Input() public forecast: any;
}

@Component({
  selector: 'imx-attestation-run-approvers',
  template: '<p>MockPendingApproversComponent</p>',
})
export class MockPendingApproversComponent {
  @Input() public dataSource: any;
}
@Component({
  selector: 'imx-entity-column-editor',
  template: '<p>MockEntityColumnEditorComponent</p>',
})
export class MockEntityColumnEditorComponent {
  @Input() public column: any;
}


@Component({
  selector: 'imx-case-chart',
  template: '<p>MockChart</p>',
})
export class MockChart {
  @Input() public run: any;
}

@Component({
  selector: 'imx-attestation',
  template: '<p>MockAttestationComponent</p>',
})
export class MockAttestationComponent {
  @Input() public parameters: any;
  @Input() public pendingAttestations: any;
  @Output() public cancel: any;
}


describe('RunSidesheetComponent', () => {
  let component: RunSidesheetComponent;
  let fixture: ComponentFixture<RunSidesheetComponent>;

  function createProperty(value?, display?) {
    return {
      Column: {
        GetMetadata: () => ({ GetDisplay: () => display }),
        GetDisplayValue: () => value
      }
    };
  }

  const testHelper = new class {
    readonly data = {
      run: {
        UID_AttestationPolicy: createProperty(),
        PolicyProcessed: createProperty(),
        DueDate: createProperty(),
        PendingCases: createProperty(),
        NewCases: createProperty(),
        ClosedCases: createProperty(),
        DelegatedCases: createProperty(),
        EscalatedCases: createProperty(),
        SecondsLeft: createProperty(),
        ForecastClosedCases: createProperty(),
        ForecastRemainingDays: createProperty(),
        Delay: createProperty(),
        RunCategory: createProperty(),
        Progress: createProperty(),
        Speed: createProperty(),
        CountChunksUnderConstruction: createProperty(),
        GetEntity: () => ({
          GetKeys: () => ['UID']
        })
      },
      attestationRunConfig: {},
      isAdmin: true
    };

    readonly runServiceStub = {
      extendRun: jasmine.createSpy('extendRun'),
      getReportDownloadOptions: data => ({}),
      getCasesForRun: jasmine.createSpy('getCasesForRun'),
      getSchemaForCases: jasmine.createSpy('getSchemaForCases'),
    };

    readonly mockExtendRunDialog = new class {
      result = false;
      readonly testdata = {
        ProlongateUntil: new Date(),
        Reason: 'some reason'
      };

      open(dialogType, config: { data: { ProlongateUntil: Date, reason: ColumnDependentReference } }) {
        return {
          afterClosed: () => {
            if (this.result) {
              config.data.ProlongateUntil = this.testdata.ProlongateUntil;
              config.data.reason.column.PutValue(this.testdata.Reason);
            }

            return of(this.result);
          }
        }
      }

      reset() {
        this.result = false;
      }
    }();

    reset() {
      this.mockExtendRunDialog.reset();
      this.runServiceStub.extendRun.calls.reset();
    }
  }();

  const attestationAction = {
    applied: new Subject()
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        MockEntityColumnEditorComponent,
        MockLdsReplacePipe,
        MockPendingApproversComponent,
        MockAttestationComponent,
        MockProgressComponent,
        MockChart,
        RunSidesheetComponent
      ],
      imports: [
        MatCardModule,
        MatExpansionModule,
        MatTabsModule,
        MatTooltipModule,
        NoopAnimationsModule,
        EuiCoreModule
      ],
      providers: [
        {
          provide: MatSnackBar,
          useValue: {}
        },
        {
          provide: EuiSidesheetService,
          useValue: testHelper.mockExtendRunDialog
        },
        {
          provide: RunsService,
          useValue: testHelper.runServiceStub
        },
        {
          provide: EuiLoadingService,
          useValue: {
            show: jasmine.createSpy('show'),
            hide: jasmine.createSpy('hide')
          }
        },
        {
          provide: EuiSidesheetRef,
          useValue: {
            close: jasmine.createSpy('close')
          }
        },
        {
          provide: SnackBarService,
          useValue: {
            open: jasmine.createSpy('open')
          }
        },
        {
          provide: EUI_SIDESHEET_DATA,
          useValue: testHelper.data
        },
        {
          provide: AttestationActionService,
          useValue: {
            createCdrReason: __ => ({
              column: new class {
                value;
                GetValue = () => this.value;
                PutValue = v => this.value = v;
              }()
            })
          }
        },
        {
          provide: AttestationHistoryActionService,
          useValue: attestationAction
        },
        {
          provide: AttestationHistoryService,
          useValue: { }
        }
        ,
        { provide: AuthenticationService,  useValue: {} }
      ]
    });
  });

  beforeEach(() => {
    testHelper.reset();
    fixture = TestBed.createComponent(RunSidesheetComponent);
    component = fixture.componentInstance;
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  [
    { dialogResult: true },
    { dialogResult: false }
  ].forEach(testcase =>
    it('provides the possibility to extend the attestation run', async () => {
      testHelper.mockExtendRunDialog.result = testcase.dialogResult;

      fixture.detectChanges();

      await component.extendAttestationRun();

      if (testcase.dialogResult) {
        expect(testHelper.runServiceStub.extendRun).toHaveBeenCalledWith(
          testHelper.data.run,
          testHelper.mockExtendRunDialog.testdata
        );
      } else {
        expect(testHelper.runServiceStub.extendRun).not.toHaveBeenCalled();
      }
    }));
});
