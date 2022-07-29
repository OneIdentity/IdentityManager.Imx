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
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';
import { Subject } from 'rxjs';
import { Component, Input } from '@angular/core';

import { clearStylesFromDOM, UserMessageService } from 'qbm';
import { AttestationHistoryComponent } from './attestation-history.component';
import { AttestationHistoryActionService } from './attestation-history-action.service';
import { AttestationHistoryService } from './attestation-history.service';
import { AttestationCasesService } from '../decision/attestation-cases.service';
import { PortalAttestationCase } from 'imx-api-att';

@Component({
  selector: 'imx-data-source-toolbar',
  template: '<p>MockDataSourceToolbarComponent</p>'
})
class MockDataSourceToolbarComponent {
  @Input() public entitySchema: any;
  @Input() public settings: any;
  @Input() public hiddenElements: any;
  @Input() public itemStatus: any;
}

@Component({
  selector: 'imx-data-table',
  template: '<p>MockDataTableComponent</p>'
})
export class MockDataTableComponent {
  @Input() public dst: any;
  @Input() detailViewVisible: any;
  @Input() selectable: any;
  @Input() groupData: any;
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
  @Input() public columnName: any;
  @Input() public columnLabel: any;
}

@Component({
  selector: 'imx-data-source-paginator',
  template: '<p>MockDataSourcePaginatorComponent</p>',
})
export class MockDataSourcePaginatorComponent {
  @Input() public dst: any;
}

describe('AttestationHistoryComponent', () => {
  let component: AttestationHistoryComponent;
  let fixture: ComponentFixture<AttestationHistoryComponent>;

  const attestationHistory = {
    getAttestations: jasmine.createSpy('getAttestations').and.returnValue(Promise.resolve({})),
    getDataModel: jasmine.createSpy('getDataModel').and.returnValue(Promise.resolve({
      Filters: [],
      Properties: [],
      GroupInfo: []
    }))
  };

  const attestationAction = {
    applied: new Subject()
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        AttestationHistoryComponent,
        MockDataTableColumnComponent,
        MockDataTableComponent,
        MockDataSourceToolbarComponent,
        MockDataTableGenericColumnComponent,
        MockDataSourcePaginatorComponent
      ],
      providers: [
        {
          provide: AttestationHistoryActionService,
          useValue: attestationAction
        },
        {
          provide: AttestationCasesService,
          useValue: {
            attestationCaseSchema: PortalAttestationCase.GetEntitySchema(),
            createGroupData: (__1, __2) => undefined
          }
        },
        {
          provide: AttestationHistoryService,
          useValue: attestationHistory
        },
        {
          provide: EuiLoadingService,
          useValue: {
            hide: jasmine.createSpy('hide'),
            show: jasmine.createSpy('show')
          }
        },
        {
          provide: EuiSidesheetService,
          useValue: {}
        },
        {
          provide: UserMessageService,
          useValue: {
            subject: new Subject()
          }
        }
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AttestationHistoryComponent);
    component = fixture.componentInstance;

    attestationHistory.getAttestations.calls.reset();
    attestationHistory.getDataModel.calls.reset();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('inits the attestation cases table', async () => {
    await component.ngOnInit();

    expect(component.dstSettings).toBeDefined();
  });

  it('updates data on applied action', (() => {
    attestationAction.applied.next();

    expect(attestationHistory.getAttestations).toHaveBeenCalled();
  }));
});
