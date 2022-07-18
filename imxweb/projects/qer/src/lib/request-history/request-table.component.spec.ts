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

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { ActivatedRoute } from '@angular/router';
import { EuiCoreModule, EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';
import { of, Subject } from 'rxjs';

import { clearStylesFromDOM, imx_SessionService, ImxTranslationProviderService, ExtService } from 'qbm';
import { RequestHistoryService } from './request-history.service';
import { RequestTableComponent } from './request-table.component';
import { ProjectConfigurationService } from '../project-configuration/project-configuration.service';
import { RequestActionService } from './request-action/request-action.service';
import { ItshopRequest } from './itshop-request';
import { PortalItshopRequests } from 'imx-api-qer';

@Component({
  selector: 'imx-data-table',
  template: '<p>MockDataTable</p>'
})
class MockDataTable {
  @Input() dst: any;
  @Input() detailViewVisible: any;
  @Input() selectable: any;
}

@Component({
  selector: 'imx-data-source-paginator',
  template: '<p>MockPaginator</p>'
})
class MockPaginator {
  @Input() dst: any;
  @Input() detailViewVisible: any;
}

@Component({
  selector: 'imx-data-source-toolbar',
  template: '<p>MockDataTable</p>'
})
class MockToolbar {
  @Input() hiddenElements: any;
  @Input() settings: any;
  @Output() navigationStateChanged: any = new EventEmitter();;
  @Output() search: any = new EventEmitter();
}

@Component({
  selector: 'imx-data-table-column',
  template: '<p>MockDataTableColumn</p>'
})
class MockDataTableColumn {
  @Input() entityColumn: any;
  @Input() entitySchema: any;
  @Input() columnLabel: any;
}

@Component({
  selector: 'imx-data-table-generic-column',
  template: '<p>MockDataTableGenericColumn</p>'
})
class MockDataTableGenericColumn {
  @Input() entityColumn: any;
  @Input() entitySchema: any;
  @Input() columnLabel: any;
}

describe('RequestTableComponent', () => {
  let component: RequestTableComponent;
  let fixture: ComponentFixture<RequestTableComponent>;

  function createRequestItem(data: { key?: string, ParentKey?: string } = {}) {
    return {
      UID_PersonWantsOrgParent: { value: data.ParentKey },
      GetEntity: () => ({
        GetKeys: () => [data.key]
      })
    };
  }

  const extServiceStub = {
    Registry: jasmine.createSpy('Registry')
  };

  const euiLoadingServiceStub = {
    hide: jasmine.createSpy('hide'),
    show: jasmine.createSpy('show')
  };

  let getRequestsResult = { totalCount: 0, Data: [], extendedData: [] };

  const requestServiceStub = {
    PortalItshopRequestsSchema: PortalItshopRequests.GetEntitySchema(),
    getRequests: jasmine.createSpy('getRequests').and.callFake(() => {
      return Promise.resolve(getRequestsResult)
    }),
    getFilterOptions: jasmine.createSpy('getFilterOptions').and.callFake(() => {
      return Promise.resolve([])
    })
  }

  const sideSheetTestHelper = new class {
    afterClosedResult = false;
    readonly servicestub = {
      open: jasmine.createSpy('open').and.returnValue({
        afterClosed: () => of(this.afterClosedResult)
      })
    };

    reset() {
      this.afterClosedResult = false;
    }
  }();

  configureTestSuite((): void => {
    TestBed.configureTestingModule({
      declarations: [
        RequestTableComponent,
        MockDataTable,
        MockDataTableColumn,
        MockDataTableGenericColumn,
        MockToolbar,
        MockPaginator
      ],
      imports: [
        EuiCoreModule,
        MatButtonModule,
        MatMenuModule
      ],
      providers: [
        {
          provide: ExtService,
          useValue: extServiceStub
        },
        {
          provide: EuiSidesheetService,
          useValue: sideSheetTestHelper.servicestub
        },
        {
          provide: RequestHistoryService,
          useValue: requestServiceStub
        },
        {
          provide: EuiLoadingService,
          useValue: euiLoadingServiceStub
        },
        {
          provide: ProjectConfigurationService,
          useValue: {
            getConfig: () => ({
              ITShopConfig: {
                VI_ITShop_OrderHistory_CancelOrder: true
              }
            })
          }
        },
        {
          provide: RequestActionService,
          useValue: {
            applied: new Subject()
          }
        },
        {
          provide: imx_SessionService,
          useValue: {
            getSessionState: () => Promise.resolve({ UserUid: 'user' })
          }
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { queryParamMap: { get: _ => undefined } },
            queryParams: {
              subscribe: () => {}
            }
          }
        },
        {
          provide: ImxTranslationProviderService,
          useValue: {}
        }
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    requestServiceStub.getRequests.calls.reset();
    getRequestsResult = { totalCount: 0, Data: [], extendedData: [] };
    sideSheetTestHelper.reset();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  for (const testcase of [
    { description: 'without data collection' },
    { description: 'with empty data collection', indata: [], expectedKeys: [] },
    {
      description: 'with data for sorting',
      indata: [
        createRequestItem({ key: '1', ParentKey: '2' }),
        createRequestItem({ key: '2' })
      ],
      expectedKeys: ['2','1']
    },
    {
      description: 'with data for sorting',
      indata: [
        createRequestItem({ key: '3', ParentKey: '1' }),
        createRequestItem({ key: '1', ParentKey: '2' }),
        createRequestItem({ key: '2' })
      ],
      expectedKeys:  ['2','1','3']
    },
    {
      description: 'with data for sorting and elements with parents not in the result set',
      indata: [
        createRequestItem({ key: '1', ParentKey: '0' }),
        createRequestItem({ key: '2' })
      ],
      expectedKeys: ['1','2']
    },
    {
      description: 'with data for sorting and elements with parents not in the result set',
      indata: [
        createRequestItem({ key: '3', ParentKey: '1' }),
        createRequestItem({ key: '1', ParentKey: '0' }),
        createRequestItem({ key: '2' })
      ],
      expectedKeys: ['1','3','2']
    },
    {
      description: 'with data for sorting and elements with parents not in the result set',
      indata: [
        createRequestItem({ key: '4', ParentKey: '2' }),
        createRequestItem({ key: '5', ParentKey: '2' }),
        createRequestItem({ key: '3', ParentKey: '1' }),
        createRequestItem({ key: '1', ParentKey: '0' }),
        createRequestItem({ key: '2' })
      ],
      expectedKeys: ['2', '5', '4', '1', '3']
    }
  ]) {
    it(`can call getData ${testcase.description}`, async () => {
      getRequestsResult = testcase.indata ? { totalCount: testcase.indata.length, Data: testcase.indata, extendedData: []} : undefined;
      await component.getData();
      if (testcase.expectedKeys != null) {
        testcase.expectedKeys.forEach((key, index) =>
          expect(component.dstSettings.dataSource.Data[index].GetEntity().GetKeys()[0]).toEqual(key)
        );
      } else {
        expect(component.dstSettings).toBeUndefined();
      }
    });
  }

  it('update selectedItems on selection changed', () => {
    const request = {
      OrderReason: { value: '123' }
    } as ItshopRequest;

    expect(component.selectedItems.length).toBe(0);

    component.onSelectionChanged([request]);

    expect(component.selectedItems.length).toBe(1);
    expect(component.selectedItems[0].OrderReason.value).toBe('123');
  });

  it('should have an selected item there only withdrawrequest is allowed', () => {
    const request = {
      CancelRequestAllowed: { value: true },
      canRevokeHoldStatus: false,
      canRecallLastQuestion: false,
      canWithdrawDelegation: false,
      canWithdrawAdditionalApprover: false
    } as ItshopRequest;

    component.selectedItems = [request];

    expect(component.canRevokeHoldStatus).toBeFalsy();
    expect(component.canWithdrawAdditionalApprover).toBeFalsy();
    expect(component.canWithdrawDelegation).toBeFalsy();
    expect(component.canRecallLastQuestion).toBeFalsy();
    expect(component.canWithdrawRequest).toBeTruthy();
    expect(component.canPerformActions).toBeTruthy();
  });

  it('is searching', async () => {
    getRequestsResult = { totalCount: 0, Data: [], extendedData: [] };

    await component.onSearch('test');

    const mostRecentArgs = requestServiceStub.getRequests.calls.mostRecent().args[1];
    expect(mostRecentArgs.PageSize).toEqual(20);
    expect(mostRecentArgs.StartIndex).toEqual(0);
    expect(mostRecentArgs.search).toEqual('test');
  });
});
