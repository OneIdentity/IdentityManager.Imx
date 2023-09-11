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
 * Copyright 2023 One Identity LLC.
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

import { ChangeDetectorRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { UntypedFormBuilder } from '@angular/forms';
import { MockBuilder, MockRender } from 'ng-mocks';

import { clearStylesFromDOM } from 'qbm';
import { QerApiService } from '../../qer-api-client.service';
import { RequestHistoryFilterComponent } from './request-history-filter.component';

describe('RequestHistoryFilterComponent', () => {
  let component: RequestHistoryFilterComponent;
  let fixture: ComponentFixture<RequestHistoryFilterComponent>;

  beforeEach(() => {
    return MockBuilder([RequestHistoryFilterComponent, UntypedFormBuilder, ChangeDetectorRef])
      .mock(QerApiService)
      .beforeCompileComponents(testBed => {
        testBed.configureTestingModule({
          schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });
      });
  });

  beforeEach(() => {
    fixture = MockRender(RequestHistoryFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  })

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

