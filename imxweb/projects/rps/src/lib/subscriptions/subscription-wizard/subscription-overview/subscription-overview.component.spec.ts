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
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { EuiLoadingService } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';
import { BehaviorSubject, of } from 'rxjs';

import { AuthenticationService, clearStylesFromDOM, MultiValueService } from 'qbm';
import { ReportSubscription } from '../../report-subscription/report-subscription';
import { SubscriptionOverviewComponent } from './subscription-overview.component';
import { PersonService } from 'qer';

@Component({
  selector: 'imx-property-viewer',
  template: '<div>PropertyViewer</div>'
})
export class MockPropertyViewerComponent {
  @Input() public properties: any;
}

describe('SubscriptionOverviewComponent', () => {
  let component: SubscriptionOverviewComponent;
  let fixture: ComponentFixture<SubscriptionOverviewComponent>;

  const mockPersonService = {
    get: jasmine.createSpy('getPersonNameAndAddress').and.callFake((str: string) => {
      return {
        Data:[{
          GetEntity: () => ({
            GetDisplay: () => str
          }),
          DefaultEmailAddress: {
            value:str === 'userIdWithMail' ? 'person@test.com' :
            str === 'userIdWithNullMail' ? null : ''
          }
        }]
      };
    })
  };

  const mockMultiService = {
    getValues: jasmine.createSpy('getValues').and.callFake((str: string) => str.split(','))
  }

  const euiLoadingServiceStub = {
    hide: jasmine.createSpy('hide'),
    show: jasmine.createSpy('show')
  };

  const mockAuthService = {
    onSessionResponse: of({UserUid: 'userIdWithMail'})
  }

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        SubscriptionOverviewComponent,
        MockPropertyViewerComponent],
      providers: [
        {
          provide: PersonService,
          useValue: mockPersonService
        },
        {
          provide: EuiLoadingService,
          useValue: euiLoadingServiceStub
        },
        {
          provide: MultiValueService,
          useValue: mockMultiService
        },
        {
          provide: AuthenticationService,
          useValue: mockAuthService
        }
      ]
    })
      .compileComponents();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubscriptionOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('has a valid life cycle', () => {
    component.subscribersChanged = new BehaviorSubject(undefined);
    component.ngOnInit();
    expect(component.subscribersChanged.observers.length).toEqual(1);
    component.ngOnDestroy();
    expect(component.subscribersChanged.observers).toBeNull();
  });

  for (const testcase of [
    { uid: 'userIdWithMail', expected: [] },
    { uid: 'userIdWithoutMail', expected: ['userIdWithoutMail'] },
    { uid: 'userIdWithNullMail', expected: ['userIdWithNullMail'] },
  ]) {
    it('updates its columns and checks Mails', fakeAsync(() => {
      component.subscribersChanged = new BehaviorSubject(undefined);
      const spy = jasmine.createSpy('getDisplayableColums')
      component.subscription = {
        getDisplayableColums: spy,
        subscription: { AddtlSubscribers: { value: testcase.uid } }
      } as unknown as ReportSubscription
      component.ngOnInit();

      component.subscribersChanged.next();

      tick(1000);

      expect(spy).toHaveBeenCalled();
      expect(component.additionalRecipientWithoutEmail).toEqual(testcase.expected);
    }));
  }

});
