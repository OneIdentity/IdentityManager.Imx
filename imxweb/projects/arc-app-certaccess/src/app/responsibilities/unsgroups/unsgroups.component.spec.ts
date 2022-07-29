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
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { EuiCoreModule, EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { PortalRespUnsgroup } from 'imx-api-tsb';
import { configureTestSuite } from 'ng-bullet';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { of } from 'rxjs';

import { clearStylesFromDOM } from 'qbm';
import { ArcApiService } from '../../services/arc-api-client.service';
import { GroupsService } from 'tsb';
import { UnsgroupsComponent } from './unsgroups.component';
import { UnsgroupsService } from './unsgroups.service';

@Component({
  selector: 'imx-data-source-toolbar',
  template: '<p>MockDataSourceToolbarComponent</p>'
})
class MockDataSourceToolbarComponent {
  @Input() public settings: any;
  @Input() public hiddenElements: any;
  @Input() public filterTreeDatabase: any;

  @Output() public navigationStateChanged = new EventEmitter<any>();
  @Output() public search = new EventEmitter<any>();
}

@Component({
  selector: 'imx-data-table',
  template: '<p>MockDataTableComponent</p>'
})
class MockDataTableComponent {
  @Input() public dst: any;
  @Input() detailViewVisible: any;
}

@Component({
  selector: 'imx-data-source-paginator',
  template: '<p>MockDataSourcePaginatorComponent</p>'
})
class MockDataSourcePaginatorComponent {
  @Input() public dst: any;
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
  @Input() public columnName: any;
  @Input() public columnLabel: any;
}

describe('UnsgroupsComponent', () => {
  let component: UnsgroupsComponent;
  let fixture: ComponentFixture<UnsgroupsComponent>;

  const euiLoadingServiceStub = {
    hide: jasmine.createSpy('hide'),
    show: jasmine.createSpy('show')
  };

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

  const mockArcApiService = {
    typedClient: {
      PortalTargetsystemUnsContainer: {
        Get: jasmine.createSpy('Get').and.returnValue(Promise.resolve({}))
      }
    }
  }

  let getUnsgroupsResult = { totalCount: 0, Data: [] };

  const unsgroupsServiceStub = {
    get: jasmine.createSpy('get').and.callFake(() => {
      return Promise.resolve(getUnsgroupsResult)
    }),
    respUnsGroupSchema: {
      Columns: {
        __Display: { ColumnName: '__Display' },
        Description: { ColumnName: 'Description' },
        UID_OrgAttestator: { ColumnName: 'Requestable' }
      }
    }
  }

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        UnsgroupsComponent,
        MockDataSourceToolbarComponent,
        MockDataSourcePaginatorComponent,
        MockDataTableComponent,
        MockDataTableColumnComponent,
        MockDataTableGenericColumnComponent
      ],
      imports: [
        EuiCoreModule,
        LoggerTestingModule,
        MatButtonModule,
        NoopAnimationsModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateFakeLoader
          }
        })
      ],
      providers: [
        {
          provide: GroupsService,
          useValue: {
            getGroupDetails: jasmine.createSpy('getGroupDetails').and.returnValue(Promise.resolve({
              GetEntity: () => ({
                GetColumn: __ => ({
                  GetValue: () => undefined
                })
              })
            })),
            getGroupServiceItem: jasmine.createSpy('getGroupServiceItem').and.returnValue(Promise.resolve({
              Ident_AccProduct: { value: 'ServiceItem-1' }
            })),
            getFilterOptions: jasmine.createSpy('getFilterOptions').and.returnValue(Promise.resolve({ totalCount: 0, Data: [] }))
          }
        },
        {
          provide: UnsgroupsService,
          useValue: unsgroupsServiceStub
        },
        {
          provide: ArcApiService,
          useValue: mockArcApiService
        },
        {
          provide: EuiLoadingService,
          useValue: euiLoadingServiceStub
        },
        {
          provide: EuiSidesheetService,
          useValue: sideSheetTestHelper.servicestub
        }
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UnsgroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    sideSheetTestHelper.reset();

  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should searching', async () => {
    getUnsgroupsResult = { totalCount: 0, Data: [] };

    await component.onSearch('test');

    const mostRecentArgs = unsgroupsServiceStub.get.calls.mostRecent().args[0];
    expect(mostRecentArgs.search).toEqual('test');
  });

  it('should edit the unsgroup', async () => {
    const unsgroup = {
      GetEntity: function () {
        return {
          GetDisplay: function () { return ""; }
        };
      },
      XObjectKey: { value: '<Key><T>ADSGroup</T><P>uid-123</P></Key>' },
      UID_AccProduct: { value: 'uid-123' }
    } as PortalRespUnsgroup;
    await component.editUnsgroup(unsgroup);
  });
});
