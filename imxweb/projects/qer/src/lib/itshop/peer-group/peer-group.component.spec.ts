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

import { IReadValue } from 'imx-qbm-dbts';
import { clearStylesFromDOM } from 'qbm';
import { PeerGroupComponent } from './peer-group.component';

describe('PeerGroupComponent', () => {
  let component: PeerGroupComponent;
  let fixture: ComponentFixture<PeerGroupComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [ PeerGroupComponent ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PeerGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  [
    { expected: 0 },
    { numOfMembersOrdered: 0, peerGroupSize: 0, expected: 0 },
    { numOfMembersOrdered: 1, peerGroupSize: 0, expected: 0 },
    { numOfMembersOrdered: 0, peerGroupSize: 1, expected: 0 },
    { numOfMembersOrdered: 1, peerGroupSize: 1, expected: 100 },
    { numOfMembersOrdered: 2, peerGroupSize: 1, expected: 100 },
    { numOfMembersOrdered: 1, peerGroupSize: 2, expected: 50 }
  ].forEach(testcase =>
  it('should calculate peer group percentage', () => {
    component.peerGroupSize = testcase.peerGroupSize;
    component.item = { CountInPeerGroup: { value: testcase.numOfMembersOrdered } as IReadValue<number> };

    expect(component.getPeerGroupPercentage()).toEqual(testcase.expected);
  }));
});
