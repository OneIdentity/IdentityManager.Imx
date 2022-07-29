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

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { EuiSidesheetRef, EuiSidesheetService, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';
import { Observable, of, Subject } from 'rxjs';
import { MatTabsModule } from '@angular/material/tabs';

import { AuthenticationService, clearStylesFromDOM } from 'qbm';
import { AttestationHistoryDetailsComponent } from './attestation-history-details.component';
import { AttestationHistoryActionService } from '../attestation-history-action.service';
import { AttestationHistoryService } from '../attestation-history.service';
import { AttestationCasesService } from '../../decision/attestation-cases.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'imx-approvers',
  template: '<p>MockApproversComponent</p>'
})
export class MockApproversComponent {
  @Input() approvers: any;
}

@Component({
  selector: 'imx-decision-history-item',
  template: '<p>MockDecisionHistoryComponent</p>'
})
export class MockDecisionHistoryComponent {
  @Input() workflowHistoryEntity: any;
}

describe('AttestationHistoryDetailsComponent', () => {
  let component: AttestationHistoryDetailsComponent;
  let fixture: ComponentFixture<AttestationHistoryDetailsComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        AttestationHistoryDetailsComponent,
        MockApproversComponent,
        MockDecisionHistoryComponent
      ],
      imports: [
        TranslateModule,
        MatCardModule,
        MatTabsModule,
        BrowserAnimationsModule
      ],
      providers: [
        {
          provide: EUI_SIDESHEET_DATA,
          useValue: {
            case: {
              canWithdrawDelegation: __ => false,
              attestationParameters: [],
              propertyInfo: [],
              ReportType: {},
              data: { WorkflowHistory: {} }
            }
          }
        },
        {
          provide: AttestationCasesService,
          useValue: {
            applied: new Subject(),
            createParameterColumns: jasmine.createSpy('createParameterColumns').and.returnValue([]),
            createHistoryTypedEntities: data => ({}),
            getReportDownloadOptions: data => ({})
          }
        },
        {
          provide: EuiSidesheetService,
          useValue: {
            open: jasmine.createSpy('open')
          }
        },
        {
          provide: AttestationHistoryActionService,
          useValue: {
            applied: new Subject()
          }
        },
        {
          provide: EuiSidesheetRef,
          useValue: {}
        },
        {
          provide: AuthenticationService,
          useValue: {
            onSessionResponse: new Subject()
          }
        },
        {
          provide: AttestationHistoryService,
          useValue: {

          }
        }
      ]
    })
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AttestationHistoryDetailsComponent);
    component = fixture.componentInstance;
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
