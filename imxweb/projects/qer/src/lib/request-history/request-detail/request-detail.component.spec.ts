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

import { ComponentFixture, TestBed, } from '@angular/core/testing';
import { configureTestSuite } from 'ng-bullet';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { Input, Component } from '@angular/core';
import { EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { Subject } from 'rxjs';

import { clearStylesFromDOM } from 'qbm';
import { RequestDetailComponent } from './request-detail.component';
import { RequestActionService } from '../request-action/request-action.service';
import { RequestHistoryService } from '../request-history.service';

@Component({
  selector: 'imx-requestinfo',
  template: '<p>MockRequestInfo</p>'
})
class MockRequestInfo {
  @Input() public isReadOnly: boolean;
  @Input() public personWantsOrg: any;
  @Input() public pwoDecisionHistory: any;
  @Input() public pwoData: any;
}

@Component({
  selector: 'eui-icon',
  template: '<p>MockEuiIcon</p>',
})
export class MockEuiIcon {
  @Input() public icon: any;
}

function buildPwo(canResend = false, canWithdraw = false, isreserved = false, uidpersonHead?: string, key?: string) {
  return {
    GetEntity: () => ({ GetKeys: () => [key] }),
    ResendRequestAllowed: { value: canResend },
    CancelRequestAllowed: { value: canWithdraw },
    IsReserved: { value: isreserved },
    UID_PersonHead: { value: uidpersonHead },
    getHistory: () => undefined
  }
}

describe('RequestDetailComponent', () => {
  const userUid = 'testUser';

  let component: RequestDetailComponent;
  let fixture: ComponentFixture<RequestDetailComponent>;
  const data: any = {
    itShopConfig: {},
    userUid
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        RequestDetailComponent,
        MockEuiIcon,
        MockRequestInfo,
      ],
      imports: [
        MatCardModule,
        MatDialogModule,
        LoggerTestingModule,
      ],
      providers: [
        {
          provide: EuiSidesheetRef,
          useValue: {
            close: jasmine.createSpy('close')
          }
        },
        {
          provide: EUI_SIDESHEET_DATA,
          useValue: data
        },
        {
          provide: RequestActionService,
          useValue: {
            applied: new Subject()
          }
        },
        {
          provide: RequestHistoryService,
          useValue: {}
        }
      ]
    });
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('initializes data', () => {
    data.isReadOnly = true;
    data.personWantsOrg = buildPwo();
    fixture = TestBed.createComponent(RequestDetailComponent);
    component = fixture.componentInstance;
    expect(component).toBeTruthy();
    expect(component.data).toBeDefined();
    expect(component.allowedActionCount).toEqual(0);
  });
});
