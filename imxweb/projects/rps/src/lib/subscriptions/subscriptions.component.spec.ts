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
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

import { CollectionLoadParameters } from 'imx-qbm-dbts';
import { PortalSubscription } from 'imx-api-rps';
import { clearStylesFromDOM, ConfirmationService, SnackBarService } from 'qbm';
import { SubscriptionsComponent } from './subscriptions.component';
import { SubscriptionsService } from './subscriptions.service';
import { ReportSubscriptionService } from './report-subscription/report-subscription.service';
import { ReportSubscription } from './report-subscription/report-subscription';

@Component({
  selector: 'imx-data-table',
  template: '<p>MockDataTableComponent</p>'
})
class MockDataTableComponent {
  @Input() public dst: any;
  @Input() public dataSource: any;
  @Input() public navigationState: any;
  @Input() public displayedColumns: any;
  @Input() public entitySchema: any;
  @Input() public mode: 'auto' | 'manual' = 'auto';
  @Input() public selectable = false;
  @Input() public detailViewTitle: string;

  @Output() public tableStateChanged: any;
}

@Component({
  selector: 'imx-data-table-column',
  template: '<p>MockDataTableColumnComponent</p>'
})
class MockDataTableColumnComponent {
  @Input() public entityColumn: any;
  @Input() public entitySchema: any;
  @Input() public columnLabel: any;
}

@Component({
  selector: 'imx-data-table-generic-column',
  template: '<p>MockDataTableGenericColumnComponent</p>'
})
class MockDataTableGenericColumnComponent {
  @Input() public columnLabel: any;
  @Input() public columnName: any;
}

@Component({
  selector: 'imx-data-source-paginator',
  template: '<p>MockDataSourcePaginatorComponent</p>'
})
class MockDataSourcePaginatorComponent {
  @Input() public dst: any;
}

@Component({
  selector: 'imx-data-source-toolbar',
  template: '<p>MockDataSourceToolbarComponent</p>'
})
class MockDataSourceToolbarComponent {
  @Input() public dst: any;
  @Input() public hiddenElements: any;
  @Input() public settings: any;
}

describe('SubscriptionsComponent', () => {
  let component: SubscriptionsComponent;
  let fixture: ComponentFixture<SubscriptionsComponent>;

  const euiLoadingServiceStub = {
    hide: jasmine.createSpy('hide'),
    show: jasmine.createSpy('show')
  };

  const snackBarServiceStub = {
    open: jasmine.createSpy('open')
  };

  let sidesheetResult = null;
  const matSidesheetStub = {
    open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of(sidesheetResult) }),
  }

  let hasReports = false;

  let subscriptionData = {
    Data: [{
      GetEntity: () => ({
        GetKeys: () => ['uid'],
        GetDisplay: () => ''
      })
    }],
    extendedData: []
  }

  let reportSubscription = {} as ReportSubscription;

  const mockSubscriptionService = {
    PortalSubscriptionSchema: PortalSubscription.GetEntitySchema(),
    getSubscriptions: jasmine.createSpy('getSubscriptions'),
    deleteSubscription: jasmine.createSpy('deleteSubscription').and.returnValue(Promise.resolve()),
    getSubscriptionInteractive: jasmine.createSpy('getSubscriptionInteractive').and.callFake(() => Promise.resolve(subscriptionData)),
    sendMail: jasmine.createSpy('sendMail'),
    hasReports: jasmine.createSpy('hasReports').and.callFake(() => hasReports)
  }

  const mockReportSubscriptionService = {
    buildRpsSubscription: jasmine.createSpy('buildRpsSubscription').and.callFake(() => Promise.resolve(reportSubscription))
  }

  let confirm = true;
  const mockConfirmationService = {
    confirm: jasmine.createSpy('confirm')
      .and.callFake(() => Promise.resolve(confirm))
  }

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule
      ],
      declarations: [
        MockDataTableComponent,
        MockDataTableColumnComponent,
        MockDataTableGenericColumnComponent,
        MockDataSourceToolbarComponent,
        MockDataSourcePaginatorComponent,
        SubscriptionsComponent
      ],
      providers: [
        {
          provide: SubscriptionsService,
          useValue: mockSubscriptionService
        },
        {
          provide: ReportSubscriptionService,
          useValue: mockReportSubscriptionService
        },
        {
          provide: EuiLoadingService,
          useValue: euiLoadingServiceStub
        },
        {
          provide: SnackBarService,
          useValue: snackBarServiceStub
        },
        {
          provide: EuiSidesheetService,
          useValue: matSidesheetStub
        },
        {
          provide: ConfirmationService,
          useValue: mockConfirmationService
        }
      ]
    });
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubscriptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    mockSubscriptionService.getSubscriptions.calls.reset();
    mockSubscriptionService.deleteSubscription.calls.reset();
    mockSubscriptionService.sendMail.calls.reset();
    mockSubscriptionService.getSubscriptionInteractive.calls.reset();
    mockSubscriptionService.hasReports.calls.reset();
    mockReportSubscriptionService.buildRpsSubscription.calls.reset();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads subscriptions on init', async () => {
    await component.ngOnInit();
    expect(mockSubscriptionService.getSubscriptions).toHaveBeenCalledWith({ PageSize: 25, StartIndex: 0 });
  });

  it('can navigate', async () => {
    const state: CollectionLoadParameters = { PageSize: 25, StartIndex: 26, OrderBy: 'test' }
    await component.onNavigationStateChanged(state);
    expect(mockSubscriptionService.getSubscriptions).toHaveBeenCalledWith(state);
  });

  it('can search text', async () => {
    await component.onSearch('test');
    expect(mockSubscriptionService.getSubscriptions).toHaveBeenCalledWith({ PageSize: 25, StartIndex: 0, search: 'test' });
  });

  for (const withCC of [true, false]) {
    it('send reminder', async () => {
      await component.sendMail(({
        GetEntity: () => ({
          GetKeys: () => ['test']
        }),
        UID_RPSReport: {
          Column: {
            GetDisplayValue: () => 'someDisplay'
          }
        }
      } as unknown) as PortalSubscription, withCC);
      expect(mockSubscriptionService.sendMail).toHaveBeenCalledWith('test', withCC);
    });
  }

  for (const testcase of [
    { confirm: true, description: 'can delete a report subscription' },
    { confirm: false, description: 'can cancel delete for a report subscription' }
  ]) {
    it(testcase.description, async () => {
      confirm = testcase.confirm

      const subscription = {
        GetEntity: () => ({
          GetKeys: () => ['uid'],
          GetDisplay: () => ''
        })
      } as PortalSubscription;

      await component.delete(subscription);

      if (testcase.confirm) {
        expect(mockSubscriptionService.deleteSubscription).toHaveBeenCalled();
      } else {
        expect(mockSubscriptionService.deleteSubscription).not.toHaveBeenCalled();
      }
    });
  }

  for (const testcase of [
    { result: true, description: 'with reload' },
    { result: false, description: 'without reload' }
  ]) {
    it(`can create a subscription ${testcase.description}`, async () => {

      sidesheetResult = testcase.result

      await component.createSubscription();

      if (sidesheetResult) {
        expect(mockSubscriptionService.getSubscriptions).toHaveBeenCalledTimes(2);
      } else {
        expect(mockSubscriptionService.getSubscriptions).toHaveBeenCalledTimes(1);
      }
    });
  }

  for (const testcase of [
    {
      reportData: {
        Data: [{
          GetEntity: () => ({
            GetKeys: () => ['uid'],
            GetDisplay: () => ''
          })
        }],
        extendedData: []
      },
      report: {} as ReportSubscription,
      result: true,
      description: 'with reload'
    },
    {
      reportData: {
        Data: [{
          GetEntity: () => ({
            GetKeys: () => ['uid'],
            GetDisplay: () => ''
          })
        }],
        extendedData: []
      },
      report: {} as ReportSubscription,
      result: false,
      description: 'without reload'
    },
    {
      reportData: {
        Data: [{
          GetEntity: () => ({
            GetKeys: () => ['uid'],
            GetDisplay: () => ''
          })
        }],
        extendedData: []
      },
      report: undefined,
      result: false,
      description: 'without subsciption'
    },
    {
      reportData: {
        totalCount: 0,
        Data: [],
        extendedData: []
      },
      report: {} as ReportSubscription,
      result: false,
      description: 'without subsciption data'
    },
  ]) {
    it(`can edit a policy ${testcase.description}`, async () => {
      sidesheetResult = testcase.result;

      const subscription = {
        GetEntity: () => ({
          GetKeys: () => ['uid'],
          GetDisplay: () => ''
        })
      } as PortalSubscription

      reportSubscription = testcase.report;
      subscriptionData = testcase.reportData;

      await component.editSubscription(subscription)

      expect(mockSubscriptionService.getSubscriptionInteractive).toHaveBeenCalled();

      if (sidesheetResult) {
        expect(mockSubscriptionService.getSubscriptions).toHaveBeenCalledTimes(2);
      } else {
        expect(mockSubscriptionService.getSubscriptions).toHaveBeenCalledTimes(1);
      }
    });
  }
});
