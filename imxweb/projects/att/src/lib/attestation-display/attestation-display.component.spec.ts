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
import { configureTestSuite } from 'ng-bullet';

import { IEntity, IReadValue } from 'imx-qbm-dbts';
import { clearStylesFromDOM } from 'qbm';
import { AttestationDisplayComponent } from './attestation-display.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('AttestationDisplayComponent', () => {
  let component: AttestationDisplayComponent;
  let fixture: ComponentFixture<AttestationDisplayComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        AttestationDisplayComponent
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AttestationDisplayComponent);
    component = fixture.componentInstance;
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    component.attestation = {
      UiText: { } as IReadValue<string>,
      GetEntity: () => ({ GetDisplay: () => undefined }) as IEntity
    };

    fixture.detectChanges();

    expect(component).toBeTruthy();
  });
});
