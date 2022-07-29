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
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { EuiCoreModule } from '@elemental-ui/core';
import { TranslateFakeLoader } from '@ngx-translate/core';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { configureTestSuite } from 'ng-bullet';

import { clearStylesFromDOM, AuthenticationService, StorageService } from 'qbm';
import { AttestationComponent } from './attestation.component';
import { Subject } from 'rxjs';
import { AttestationHistoryActionService } from '../../attestation-history/attestation-history-action.service';
import { AttestationHistoryCase } from '../../attestation-history/attestation-history-case';

@Component({
  selector: 'imx-attestation-history',
  template: '<p>MockAttestationHistory</p>'
})
export class MockAttestationHistory {
  @Input() parameters: any;
  @Input() itemStatus: any;
}

describe('AttestationComponent', () => {
  let component: AttestationComponent;
  let fixture: ComponentFixture<AttestationComponent>;

  const attestationAction = {
    canDecide: jasmine.createSpy('canDecide').and.returnValue(true)
  };

  configureTestSuite(() =>
    TestBed.configureTestingModule({
      declarations: [
        AttestationComponent,
        MockAttestationHistory
      ],
      imports: [
        EuiCoreModule,
        MatCardModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateFakeLoader
          }
        })
      ],
      providers: [
        {
          provide: AttestationHistoryActionService,
          useValue: attestationAction
        },
        {
          provide: AuthenticationService,
          useValue: {
            onSessionResponse: new Subject()
          }
        },
        {
          provide: StorageService,
          useClass: class {
            private readonly storage = {};
            readonly isHelperAlertDismissed = key => this.storage[key];
            readonly storeHelperAlertDismissal = key => this.storage[key] = true;
          }
        }
      ]
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(AttestationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    attestationAction.canDecide.calls.reset();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  [
    { cases: [], expectedCanDecide: false, callCanDecide: 0 },
    { cases: [{}], expectedCanDecide: false, callCanDecide: 0 },
    { cases: [{ isPending: true }], expectedCanDecide: true, callCanDecide: 1 },
    { cases: [{ isPending: true }, {}], expectedCanDecide: false, callCanDecide: 1 },
    { cases: [{ isPending: true }, { isPending: true }], expectedCanDecide: true, callCanDecide: 2 }
  ].forEach(testcase =>
  it('checks if the user is allowed to decide for the selected items', () => {
    component.selectedCases = testcase.cases as AttestationHistoryCase[];

    expect(component.canDecide).toEqual(testcase.expectedCanDecide);
    expect(attestationAction.canDecide).toHaveBeenCalledTimes(testcase.callCanDecide);
  }));

  it('dismisses helper alert', () => {
    expect(component.showHelperAlert).toEqual(true);
    component.onHelperDismissed();
    expect(component.showHelperAlert).toEqual(false);
  });
});
