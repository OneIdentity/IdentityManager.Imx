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
import { PortalAttestationCaseHistory } from 'imx-api-att';
import { configureTestSuite } from 'ng-bullet';

import { clearStylesFromDOM } from 'qbm';
import { DecisionHistoryItemComponent } from './decision-history-item.component';

@Component({
  selector: 'imx-entity-property-editor',
  template: '<p>MockEntityPropertyEditorComponent</p>',
})
export class MockEntityPropertyEditorComponent {
  @Input() public property: any;
}

describe('DecisionHistoryItemComponent', () => {
  let component: DecisionHistoryItemComponent;
  let fixture: ComponentFixture<DecisionHistoryItemComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        DecisionHistoryItemComponent,
        MockEntityPropertyEditorComponent
      ],
      imports: [
        MatCardModule
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DecisionHistoryItemComponent);
    component = fixture.componentInstance;
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    component.workflowHistoryEntity = {
      GetEntity: () => ({
        GetColumn: name => ({})
      })
    } as PortalAttestationCaseHistory;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
