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
 * Copyright 2021 One Identity LLC.
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

import { clearStylesFromDOM } from 'qbm';
import { AttestationExtComponent } from './attestation-ext.component';

@Component({
  selector: 'imx-attestation',
  template: '<p>MockAttestationComponent</p>',
})
export class MockAttestationComponent {
  @Input() public parameters: any;
  @Input() public pendingAttestations: any;
}

describe('AttestationExtComponent', () => {
  let component: AttestationExtComponent;
  let fixture: ComponentFixture<AttestationExtComponent>;

  configureTestSuite(() =>
    TestBed.configureTestingModule({
      declarations: [
        AttestationExtComponent,
        MockAttestationComponent
      ]
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(AttestationExtComponent);
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
