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

import { Component, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { EuiLoadingService, EuiSidesheetRef, EuiSidesheetService, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';
import { of, Subject } from 'rxjs';

import { AuthenticationService, clearStylesFromDOM, SnackBarService } from 'qbm';
import { AttestationActionService } from '../attestation-action/attestation-action.service';
import { AttestationCaseComponent } from './attestation-case.component';
import { AttestationCasesService } from './attestation-cases.service';
import { TranslateService } from '@ngx-translate/core';
import { LossPreview } from './loss-preview.interface';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'imx-approvers',
  template: '<p>MockApproversComponent</p>'
})
export class MockApproversComponent {
  @Input() approvers: any;
}

describe('AttestationCaseComponent', () => {
  let historyTypedEntities = [];
  const lossPreview: LossPreview = {
    LossPreviewItems: [],
    LossPreviewHeaders: [],
    LossPreviewDisplayKeys: {}
  }

  const sidesheetData = new class {
    testinput = {
      approvalThreshold: undefined,
      peerGroupFactor: undefined,
    };

    get case() {
      return {
        PeerGroupFactor: { value: this.testinput.peerGroupFactor },
        attestationParameters: [],
        propertyInfo: [],
        ReportType: {},
        data: { WorkflowHistory: {} },
        canDenyApproval: __ => true,
        canRerouteDecision: __ => true,
        canAddApprover: __ => true,
        canDelegateDecision: __ => true,
        canWithdrawAddApprover: __ => true
      };
    }
    get approvalThreshold() { return this.testinput.approvalThreshold; }
    get autoRemovalScope() { return true; }
    get lossPreview() {return lossPreview };
  }();

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        AttestationCaseComponent,
        MockApproversComponent
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ],
      imports: [
        MatCardModule
      ],
      providers: [
        {
          provide: EUI_SIDESHEET_DATA,
          useValue: sidesheetData
        },
        {
          provide: AttestationActionService,
          useValue: {
            applied: new Subject()
          }
        },
        {
          provide: EuiSidesheetService,
          useValue: {
            open: _ => { }
          }
        },
        {
          provide: TranslateService,
          useValue: {
            get: jasmine.createSpy('get').and.returnValue(of())
          }
        },
        {
          provide: EuiSidesheetRef,
          useValue: {}
        },
        {
          provide: AttestationCasesService,
          useValue: {
            createParameterColumns: jasmine.createSpy('createParameterColumns').and.returnValue([]),
            createHistoryTypedEntities: __ => ({ Data: historyTypedEntities }),
            getReportDownloadOptions: __ => ({})
          }
        },
        {
          provide: AuthenticationService,
          useValue: {
            onSessionResponse: new Subject()
          }
        },
        {
          provide: EuiLoadingService,
          useValue: {
            hide: jasmine.createSpy('hide'),
            show: jasmine.createSpy('show')
          }
        },
        {
          provide: SnackBarService,
          useValue: {
            open: jasmine.createSpy('open')
          }
        },
        {
          provide: MatDialog,
          useValue: {
            open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of(true) }),
          }
        }

      ]
    })
  });

  beforeEach(() => {
    historyTypedEntities = [];
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  [
    { hasPeerGroupAnalysis: true, approvalThreshold: 0, peerGroupFactor: 0, expected: true },
    { hasPeerGroupAnalysis: true, approvalThreshold: 0, peerGroupFactor: -1, expected: false },
    { hasPeerGroupAnalysis: true, approvalThreshold: 0, expected: false },
    { hasPeerGroupAnalysis: true, peerGroupFactor: 0, expected: false },
    { hasPeerGroupAnalysis: false, expected: false }
  ].forEach(testcase => {
   it('should show recommendation if attestation case has peer group Analysis, approvalThreshold != null and peerGroupFactor !== -1', () => {
      historyTypedEntities = [{
        Ident_PWODecisionStep: { value: testcase.hasPeerGroupAnalysis ? 'EXWithPeerGroupAnalysis' : undefined }
      }];

      sidesheetData.testinput.approvalThreshold = testcase.approvalThreshold;
      sidesheetData.testinput.peerGroupFactor = testcase.peerGroupFactor;

      const component = TestBed.createComponent(AttestationCaseComponent).componentInstance;
      expect(component.showRecommendation).toEqual(testcase.expected);
    });
  })
});
