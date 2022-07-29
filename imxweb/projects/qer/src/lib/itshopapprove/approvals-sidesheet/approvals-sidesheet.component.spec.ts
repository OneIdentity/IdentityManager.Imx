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

import { Component, Input } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { EUI_SIDESHEET_DATA, EuiSidesheetRef } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';
import { of, Subject } from 'rxjs';

import { AuthenticationService, clearStylesFromDOM } from 'qbm';
import { WorkflowActionService } from '../workflow-action/workflow-action.service';
import { ApprovalsSidesheetComponent } from './approvals-sidesheet.component';
import { ItshopService } from '../../itshop/itshop.service';

@Component({
  selector: 'imx-requestinfo',
  template: '<p>MockRequestInfo</p>'
})
class MockRequestInfo {
  @Input() request: any;
}

describe('ApprovalsSidesheetComponent', () => {
  let historyTypedEntities = [];

  const sideSheetDataStub = new class {
    readonly pwo = {
      canWithdrawAdditionalApprover: __ => false,
      canDenyApproval: ()=> false,
      canRerouteDecision: __ => false,
      canAddApprover: __ => false,
      canDelegateDecision: __ => false,
      pwoData: {
        CanRevokeDelegation: true,
        WorkflowHistory: {}
      }
    };
    readonly itShopConfig = {};
  }();

  const mockAuthService = {
    onSessionResponse: of({UserUid: 'userIdWithMail'})
  }

  configureTestSuite(() =>
    TestBed.configureTestingModule({
      declarations: [
        ApprovalsSidesheetComponent,
        MockRequestInfo
      ],
      imports: [
        MatButtonModule,
        MatCardModule
      ],
      providers: [
        {
          provide: EUI_SIDESHEET_DATA,
          useValue: sideSheetDataStub
        },
        {
          provide: EuiSidesheetRef,
          useValue: {
            close: jasmine.createSpy('close')
          }
        },
        {
          provide: WorkflowActionService,
          useValue: {
            applied: new Subject()
          }
        },
        {
          provide: AuthenticationService,
          useValue: mockAuthService
        },
        {
          provide: ItshopService,
          useValue: {
            createTypedHistory: __ => historyTypedEntities
          }
        }
      ]
    })
  );

  afterAll(() => {
    clearStylesFromDOM();
  });

  [
    { hasPeerGroupAnalysis: true },
    { hasPeerGroupAnalysis: false }
  ].forEach(testcase => {
   it('should check if a request has peer group Analysis', () => {
      historyTypedEntities = [{
        Ident_PWODecisionStep: { value: testcase.hasPeerGroupAnalysis ? 'EXWithPeerGroupAnalysis' : undefined }
      }];

      const component = TestBed.createComponent(ApprovalsSidesheetComponent).componentInstance;
      expect(component.hasPeerGroupAnalysis).toEqual(testcase.hasPeerGroupAnalysis);
    });
  })
});
