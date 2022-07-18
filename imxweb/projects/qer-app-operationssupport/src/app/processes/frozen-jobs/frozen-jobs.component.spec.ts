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

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { NO_ERRORS_SCHEMA, Component, ErrorHandler, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { configureTestSuite } from 'ng-bullet';
import * as TypeMoq from 'typemoq';

import { FrozenJobsComponent } from './frozen-jobs.component';
import { QueueJobsService } from '../jobs/queue-jobs.service';
import { FrozenJobsService } from './frozen-jobs.service';
import { SnackBarService, ImxTranslationProviderService, clearStylesFromDOM } from 'qbm';
import { IReadValue } from 'imx-qbm-dbts';
import { OpsupportQueueFrozenjobs } from 'imx-api-qbm';
import { IFrozenJobsParams } from '../../test-utilities/imx-api-mock.spec';
import { TranslationProviderServiceSpy } from '../../test-utilities/imx-translation-provider.service.spy.spec';
import { RoutingMock } from '../../test-utilities/router-mock.spec';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';

function CreateFrozenJob(params: IFrozenJobsParams): OpsupportQueueFrozenjobs {
  const uidTreeDummy = TypeMoq.Mock.ofType<IReadValue<string>>();
  uidTreeDummy.setup(obj => obj.value).returns(() => (params.UID_Tree != null ? params.UID_Tree : ''));
  const messageDummy = TypeMoq.Mock.ofType<IReadValue<string>>();
  messageDummy.setup(obj => obj.value).returns(() => (params.ErrorMessage != null ? params.ErrorMessage : ''));
  const readyDummy = TypeMoq.Mock.ofType<IReadValue<string>>();
  readyDummy.setup(obj => obj.value).returns(() => (params.Ready2Exe != null ? params.Ready2Exe : 'TRUE'));
  const jobChainDummy = TypeMoq.Mock.ofType<IReadValue<string>>();
  jobChainDummy.setup(obj => obj.value).returns(() => (params.JobChainName != null ? params.JobChainName : ''));
  const taskDummy = TypeMoq.Mock.ofType<IReadValue<string>>();
  taskDummy.setup(obj => obj.value).returns(() => (params.TaskName != null ? params.TaskName : ''));
  const uidDummy = TypeMoq.Mock.ofType<IReadValue<string>>();
  uidDummy.setup(obj => obj.value).returns(() => (params.UID_Job != null ? params.UID_Job : ''));

  const itemMock = TypeMoq.Mock.ofType<OpsupportQueueFrozenjobs>();
  itemMock.setup(obj => obj.UID_Tree).returns(() => uidTreeDummy.object);
  itemMock.setup(im => im.ErrorMessages).returns(() => messageDummy.object);
  itemMock.setup(im => im.Ready2EXE).returns(() => readyDummy.object);
  itemMock.setup(im => im.JobChainName).returns(() => jobChainDummy.object);
  itemMock.setup(im => im.TaskName).returns(() => taskDummy.object);
  itemMock.setup(im => im.UID_Job).returns(() => uidDummy.object);
  return itemMock.object;
}

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
  @Input() public groupData: any;

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


describe('FrozenJobsComponent', () => {
  let component: FrozenJobsComponent;
  let fixture: ComponentFixture<FrozenJobsComponent>;
  const errorHandlerSpy = jasmine.createSpy('handleError');

  const mockRouter = new RoutingMock();
  const mockQueueJobsService = {
    Post: jasmine.createSpy('Post').and.returnValue(Promise.resolve({}))
  };
  const mockMatDialog = {
    open: jasmine.createSpy('open')
  };
  const mockFrozenJobsService = {
    Get: jasmine.createSpy('Get').and.returnValue(
      Promise.resolve({
        Data: [],
        totalCount: 0
      })
    ),
    EntitySchema: OpsupportQueueFrozenjobs.GetEntitySchema(),
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [
        MatMenuModule,
        MatButtonModule
      ],
      declarations: [
        FrozenJobsComponent,
        MockDataTableComponent,
        MockDataTableColumnComponent,
        MockDataTableGenericColumnComponent,
        MockDataSourceToolbarComponent,
        MockDataSourcePaginatorComponent,
      ],
      schemas: [
        NO_ERRORS_SCHEMA
      ],
      providers: [
        {
          provide: EuiSidesheetService,
          useValue: {
            open: jasmine.createSpy('open')
          }
        },
        {
          provide: ActivatedRoute,
          useValue: RoutingMock.GetActiveRouteMock('queueName', {
            dummy: 'x'
          })
        },
        {
          provide: SnackBarService,
          useClass: class {
            public open = jasmine.createSpy('open');
            public dismiss = jasmine.createSpy('dismiss');
          }
        },
        {
          provide: FrozenJobsService,
          useValue: mockFrozenJobsService
        },
        {
          provide: ErrorHandler,
          useClass: class {
            public handleError = errorHandlerSpy;
          }
        },
        {
          provide: MatDialog,
          useValue: mockMatDialog
        },
        {
          provide: EuiLoadingService,
          useValue: {
            hide: jasmine.createSpy('hide'),
            show: jasmine.createSpy('show')
          }
        },
        {
          provide: QueueJobsService,
          useValue: mockQueueJobsService
        },
        {
          provide: ImxTranslationProviderService,
          useValue: new TranslationProviderServiceSpy()
        }
      ]
    });
  });

  beforeEach(async(() => {
    mockRouter.navigate.calls.reset();
    mockFrozenJobsService.Get.calls.reset();
    mockQueueJobsService.Post.calls.reset();
    mockMatDialog.open.calls.reset();
    errorHandlerSpy.calls.reset();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FrozenJobsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('could be initialized by angular', () => {
    expect(() => component.ngOnInit()).not.toThrowError();
  });

  it('should return the current queueName', () => {
    expect(component.queueName).toBe('queueName');
  });

  it('refresh is working', async () => {
    await component.refresh();
    expect(mockFrozenJobsService.Get).toHaveBeenCalled();
  });

  [
    { item: CreateFrozenJob({ Ready2Exe: 'FAlSE' }), expected: false },
    { item: CreateFrozenJob({ Ready2Exe: 'TRUE' }), expected: false },
    { item: CreateFrozenJob({ Ready2Exe: 'FROZEN' }), expected: true },
    { item: CreateFrozenJob({ Ready2Exe: 'OVERLIMIT' }), expected: true }
  ].forEach(testcase => {
    it(`checks if a job is frozen with Ready2Exe = '${testcase.item.Ready2EXE.value}'`, () => {
      expect(component.isFrozen(testcase.item)).toEqual(testcase.expected);
    });
  });

  it('reactivates item', async () => {
    const item = CreateFrozenJob({ Ready2Exe: 'FROZEN', UID_Job: '123', JobChainName: 'testChain' });
    await component.reactivate(item);
    expect(mockQueueJobsService.Post).toHaveBeenCalled();
  });
});
