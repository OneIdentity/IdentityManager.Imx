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

import { Component, Input, Output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { configureTestSuite } from 'ng-bullet';

import { clearStylesFromDOM, DynamicTabDataProviderDirective, DynamicTabsModule } from 'qbm';
import { Subject } from 'rxjs';
import { IdentityAttestationService } from '../../../identity-attestation.service';
import { AttestationWrapperComponent } from './attestation-wrapper.component';

@Component({
  selector: 'imx-attestation',
  template: '<p>MockAttestationComponent</p>',
})
export class MockAttestationComponent {
  @Input() public parameters: any;
  @Input() public pendingAttestations: any;
}

describe('AttestationWrapperComponent', () => {
  let component: AttestationWrapperComponent;
  let fixture: ComponentFixture<AttestationWrapperComponent>;

  configureTestSuite(() =>
    TestBed.configureTestingModule({
      imports: [
        DynamicTabsModule
      ],
      declarations: [
        AttestationWrapperComponent,
        MockAttestationComponent
      ],
      providers: [
        {
          provide: IdentityAttestationService,
          useValue: {
            getNumberOfPendingForUser: jasmine.createSpy('getNumberOfPendingForUser').and.returnValue(
              Promise.resolve({
                total: 0,
                pendingTotal: 0,
                pendingForUser: 0
              }),
            ),
            applied: new Subject<any>()
          }
        },
        {
          provide: DynamicTabDataProviderDirective,
          useValue:{data: {referrer: {objecttable:'table', objectuid: 'uid' }}}
        }
      ]
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(AttestationWrapperComponent);
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
