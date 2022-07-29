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

import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { BehaviorSubject } from 'rxjs';

import { clearStylesFromDOM } from 'qbm';
import { SelectecObjectsInfo } from './selected-objects-info.interface';
import { PolicyService } from '../policy.service';
import { SelectedObjectsComponent } from './selected-objects.component';

describe('SelectedObjectsComponent', () => {
  let component: SelectedObjectsComponent;
  let fixture: ComponentFixture<SelectedObjectsComponent>;

  const mockPolicyService = {
    getObjectsForFilter: jasmine.createSpy('getObjectsForFilter').and.returnValue(Promise.resolve({ totalCount: 2 }))
  }

  const euiLoadingServiceStub = {
    hide: jasmine.createSpy('hide'),
    show: jasmine.createSpy('show')
  };

  const matSidesheetStub = {
    open: jasmine.createSpy('open')
  }

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [
        MatButtonModule,
        LoggerTestingModule
      ],
      declarations: [
        SelectedObjectsComponent
      ],
      providers: [
        {
          provide: PolicyService,
          useValue: mockPolicyService
        },
        {
          provide: EuiSidesheetService,
          useValue: matSidesheetStub
        },
        {
          provide: EuiLoadingService,
          useValue: euiLoadingServiceStub
        }
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectedObjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    mockPolicyService.getObjectsForFilter.calls.reset();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  for (const testcase of [
    { filter: { Elements: []  }, result: -1 },
    { filter: {Elements: [{ AttestationSubType: '' }] }, result: -1 },
    { filter: {Elements: [{ ParameterName:'NAME' }] }, result: -1 },
    { filter: {Elements: [{ AttestationSubType:'subType' }] }, result: 2 },
  ]) {
    it('calculates match count', fakeAsync(() => {

      component.filterSubject = new BehaviorSubject<SelectecObjectsInfo>(undefined);
      component.ngOnInit();

      component.filterSubject.next({ policyFilter: testcase.filter, uidPickCategory: '', uidAttestationObject: 'uid' });
      tick(1000);

      expect(component.countMatching).toEqual(testcase.result);
    }));
  }

  it('can show objects', () => {

    component.filterSubject = new BehaviorSubject<SelectecObjectsInfo>(undefined);
    component.ngOnInit();

    component.filterSubject.next({ policyFilter: { Elements: [] }, uidPickCategory: '', uidAttestationObject: 'uid' });

    component.showMatchingObjects({ stopPropagation: () => { } } as Event);
    expect(matSidesheetStub.open).toHaveBeenCalled();

    component.showMatchingObjects();
    expect(matSidesheetStub.open).toHaveBeenCalled();

    component.filter = { Elements: [], ConcatenationType: 'AND' };
    component.showMatchingObjects();
    expect(matSidesheetStub.open).toHaveBeenCalled();
  })
});
