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

import { EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { MockBuilder, MockedComponentFixture, MockRender } from 'ng-mocks';

import { clearStylesFromDOM } from 'qbm';
import { DecisionStepSevice } from 'qer';
import { AttestationDecisionModule } from '../decision/attestation-decision.module';
import { AttestationActionComponent } from './attestation-action.component';

describe('AttestationActionComponent', () => {
  let component: AttestationActionComponent;
  let fixture: MockedComponentFixture<AttestationActionComponent>;

  const mockSideSheetData = {
    description: 'some description',
    actionParameters: { reason: { column: {} } },
    attestationCases: [
      {
        typedEntity: undefined,
        display: 'the attestation case',
        propertiesForAction: [],
        attestationParameters: [],
        key: 'uid',
      },
    ],
  };

  beforeEach(() => {
    return MockBuilder(AttestationActionComponent, AttestationDecisionModule)
      .mock(EUI_SIDESHEET_DATA, mockSideSheetData,{export:true})
      .mock(EuiSidesheetRef,{},{export:true})
      .mock(DecisionStepSevice, {});
  });

  beforeEach(() => {
    fixture = MockRender(AttestationActionComponent);
    component = fixture.point.componentInstance;
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component.data.description).toEqual(mockSideSheetData.description);
    expect(component.attestationCases.length).toEqual(mockSideSheetData.attestationCases.length);
  });
});
