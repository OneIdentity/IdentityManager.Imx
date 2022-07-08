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
 * Copyright 2021 One Identity LLC.
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

import { ComponentFixture, TestBed, fakeAsync, tick, getTestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EuiCoreModule, EuiLoadingService, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

import { QueueTreeService } from './queue-tree.service';
import { SingleFrozenJobComponent } from './single-frozen-job.component';
import {
  imx_SessionService,
  ImxTranslationProviderService,
  SnackBarService,
  OpsupportDbObjectService,
  clearStylesFromDOM
} from 'qbm';
import { OpsupportQueueTree } from 'imx-api-qbm';
import { IReadValue } from 'imx-qbm-dbts';

@Component({
  selector: 'imx-tree-table',
  template: '<p>MockTreeTableComponent</p>'
})
class MockTreeTableComponent {
  @Input() dataSource: any;
  @Input() startExpanded: any;
  @Input() rootText: any;
  @Input() rootType: any;
}

@Component({
  selector: 'imx-column',
  template: '<p>MockColumnComponent</p>'
})
class MockColumnComponent {
  @Input() field: any;
  @Input() sortable: any;
  @Input() title: any;
  @Input() dataAccessor: any;
  @Input() align: any;
  @Input() class: any;
  @Input() isFirstColumn: any;
}

@Component({
  selector: 'imx-progressbar',
  template: '<p>MockProgressbarComponent</p>'
})
class MockProgressbarComponent {
  @Input() Caption: any;
  @Input() MaxValue: any;
  @Input() Value: any;
  @Input() InPercent: any;
}

describe('SingleFrozenJobComponent', () => {
  let component: SingleFrozenJobComponent;
  let fixture: ComponentFixture<SingleFrozenJobComponent>;

  function createProperty<T>(value: T): IReadValue<T> {
    return {
      value,
      GetMetadata: () => {
        return {
          GetDisplay: () => ""
        };
      },
      Column: {
        GetDisplayValue: () => value as any
      }
    } as IReadValue<T>;
  }

  const mockRouter = {
    navigate: jasmine.createSpy('navigate')
  };
  const mockMatDialog = { open: jasmine.createSpy('open') };
  const mockLocation = { back: jasmine.createSpy('back') };

  const mockRootItem = {
    JobChainName: createProperty('testChain'),
    UID_Job: createProperty('uid1'),
    TaskName: createProperty('TestTask1'),
    UID_JobError: createProperty('uid3'),
    UID_JobSuccess: createProperty('uid2'),
    IsRootJob: createProperty(true)
  } as OpsupportQueueTree;

  const mockQueueTreeService = {
    QueueTreeEntitySchema: OpsupportQueueTree.GetEntitySchema(),
    Reactivate: jasmine.createSpy('Reactivate').and.returnValue(Promise.resolve({})),
    LoadItems: jasmine.createSpy('LoadItems').and.returnValue(Promise.resolve([
      mockRootItem,
      {
        JobChainName: createProperty('testChain'),
        UID_Job: createProperty('uid2'),
        TaskName: createProperty('TestTask2'),
        UID_JobSuccess: createProperty('uid4'),
        Ready2EXE: createProperty('OVERLIMIT')
      },
      {
        JobChainName: createProperty('testChain'),
        UID_Job: createProperty('uid3'),
        TaskName: createProperty('TestTask3'),
        UID_JobError: createProperty('uid5')
      },
      {
        JobChainName: createProperty('testChain'),
        UID_Job: createProperty('uid4'),
        TaskName: createProperty('TestTask4'),
        Ready2EXE: createProperty('FINISHED')
      },
      {
        JobChainName: createProperty('testChain'),
        UID_Job: createProperty('uid5'),
        TaskName: createProperty('TestTask5'),
        UID_JobSuccess: createProperty('uid4'),
        Ready2EXE: createProperty('FROZEN')
      }
    ])),
    CanBeReactivated: jasmine.createSpy('CanBeReactivated').and.returnValue(false),
    SetRoot: jasmine.createSpy('SetRoot'),
    GetTotalSteps: jasmine.createSpy('GetTotalSteps').and.returnValue(10),
    GetCompleteSteps: jasmine.createSpy('GetCompleteSteps').and.returnValue(4),
    items: [],
    itemsProvider: () => [],
    ExpandAll: jasmine.createSpy('ExpandAll')
  };

  const errorHandlerSpy = jasmine.createSpy('handleError');

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [
        EuiCoreModule,
        MatProgressBarModule,
        MatTooltipModule
      ],
      declarations: [
        MockColumnComponent,
        MockProgressbarComponent,
        MockTreeTableComponent,
        SingleFrozenJobComponent
      ],
      providers: [
        {
          provide: imx_SessionService,
          useValue: {}
        },
        {
          provide: ImxTranslationProviderService,
          useValue: {
            Translate: jasmine.createSpy('Translate').and.returnValue(of('')),
            GetColumnDisplay: jasmine.createSpy('GetColumnDisplay')
          }
        },
        {
          provide: EuiLoadingService,
          useValue: {
            hide: jasmine.createSpy('hide'),
            show: jasmine.createSpy('show')
          }
        },
        {
          provide: SnackBarService,
          useClass: class {
            open = jasmine.createSpy('open');
            dismiss = jasmine.createSpy('dismiss');
          }
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: jasmine.createSpy('get')
              }
            }
          }
        },
        {
          provide: QueueTreeService,
          useValue: mockQueueTreeService
        },
        {
          provide: MatDialog,
          useValue: mockMatDialog
        },
        {
          provide: EUI_SIDESHEET_DATA,
          useValue: {
            data: "x"
          }
        },
        {
          provide: OpsupportDbObjectService,
          useClass: class {
            Get = jasmine.createSpy('Get').and.returnValue(Promise.resolve({ Display: 'Display' }));
          }
        }
      ]
    });
  });

  beforeEach(waitForAsync(() => {
    mockRouter.navigate.calls.reset();
    mockMatDialog.open.calls.reset();
    mockLocation.back.calls.reset();
    mockQueueTreeService.Reactivate.calls.reset();
    mockQueueTreeService.LoadItems.calls.reset();
    mockQueueTreeService.CanBeReactivated.calls.reset();
    mockQueueTreeService.SetRoot.calls.reset();
    mockQueueTreeService.GetTotalSteps.calls.reset();
    mockQueueTreeService.GetCompleteSteps.calls.reset();
    errorHandlerSpy.calls.reset();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SingleFrozenJobComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('could be initialized by angular', fakeAsync(() => {
    component.ngOnInit();
    tick();
    expect(component.Display).toEqual(mockRootItem.JobChainName.value);
  }));

  it('should reactivate a job', async () => {
    await component.reactivate();
    expect(mockQueueTreeService.Reactivate).toHaveBeenCalled();
  });

  [
    { value: 'FROZEN', expect: true },
    { value: 'OVERLIMIT', expect: true },
    { value: 'TRUE', expect: false },
  ].forEach(testcase => {
    it(`IsFrozen() works as expected for item status '${testcase.value}'`, () => {
      expect(component.isFrozen({ Ready2EXE: createProperty(testcase.value) } as OpsupportQueueTree)).toBe(testcase.expect);
    });
  });

  it('shows error message', () => {
    component.showMessage({ ErrorMessages: createProperty('ErrorMessage') } as OpsupportQueueTree);
    expect(mockMatDialog.open).toHaveBeenCalled();
  });

  it('calls service LoadItems when user clicks Refresh', () => {
    component.loadView();
    expect(mockQueueTreeService.LoadItems).toHaveBeenCalled();
  });

  it('gets total steps', () => {
    const steps = component.getTotalSteps();
    expect(mockQueueTreeService.GetTotalSteps).toHaveBeenCalled();
    expect(steps).toBe(10);
  });

  it('gets completes steps', () => {
    const steps = component.getCompletedSteps();
    expect(mockQueueTreeService.GetCompleteSteps).toHaveBeenCalled();
    expect(steps).toBe(4);
  });

  [
    true,
    false,
  ].forEach(isRootJob => {
    it('HasProgress() is true, if the parameter is a rootjob', () => {
      expect(component.hasProgress({ IsRootJob: createProperty(isRootJob) } as OpsupportQueueTree)).toEqual(isRootJob);
    });
  });

  it('calls service LoadItems when user clicks Refresh', () => {
    component.loadView();
    expect(mockQueueTreeService.LoadItems).toHaveBeenCalled();
  });

  [
    0,
    1
  ].forEach(row => {
    xit('gets right time text', () => {
      const translate = getTestBed().get(TranslateService);
      translate.use('en-us');
      const date = new Date(2019, 0, 1);
      // We use the same Intl.DateTimeFormater since ES5 and ES2017 were causing an issue with angular changes
      // const expected = row > 0 ? 'January 01, 12:00:00 AM' : '';
      const opt: any = { month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };
      const expected = row > 0 ? new Intl.DateTimeFormat(translate.currentLang, opt).format(date) : '';
      expect(component.timeAccessor({ XDateUpdated: { value: date } } as OpsupportQueueTree, row)).toEqual(expected);
    });
  });

  it('displayAccessor returns root title when index === 0', () => {
    const value = 'sometitle';
    spyOnProperty(component, 'Display', 'get').and.returnValue(value);
    expect(component.displayAccessor(null, 0)).toEqual(value);
  });

  it('displayAccessor returns UID_JobOrigin DisplayValue when index !== 0', () => {
    const value = 'sometitle';
    expect(component.displayAccessor({ UID_JobOrigin: createProperty(value) } as OpsupportQueueTree, 1)).toEqual(value);
  });
});
