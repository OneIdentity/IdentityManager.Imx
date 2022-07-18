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

import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatMenuModule } from '@angular/material/menu';
import { EuiCoreModule } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';
import { Subject } from 'rxjs';

import { AuthenticationService, clearStylesFromDOM } from 'qbm';
import { AttestationHistoryWrapperComponent } from './attestation-history-wrapper.component';
import { AttestationHistoryActionService } from './attestation-history-action.service';

@Component({
  selector: 'imx-attestation-history',
  template: '<p>MockAttestationHistoryComponent</p>'
})
export class MockAttestationHistoryComponent { }

describe('AttestationHistoryWrapperComponent', () => {
  let component: AttestationHistoryWrapperComponent;
  let fixture: ComponentFixture<AttestationHistoryWrapperComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        AttestationHistoryWrapperComponent,
        MockAttestationHistoryComponent
      ],
      imports: [
        EuiCoreModule,
        MatMenuModule
      ],
      providers: [
        {
          provide: AttestationHistoryActionService,
          useValue: {}
        },
        {
          provide: AuthenticationService,
          useValue: {
            onSessionResponse: new Subject()
          }
        }
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AttestationHistoryWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  
  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
