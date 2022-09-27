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
import { Component, Input, NO_ERRORS_SCHEMA } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { configureTestSuite } from 'ng-bullet';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { EuiLoadingService } from '@elemental-ui/core';

import { FeatureConfigService } from 'qer';
import { imx_SessionService, OpsupportDbObjectService, MetadataService, ImxTranslationProviderService, clearStylesFromDOM, AuthenticationService, ISessionState } from 'qbm';
import { ObjectOverviewComponent } from './object-overview.component';
import { QueueJobsService } from '../processes/jobs/queue-jobs.service';
import { TranslationProviderServiceSpy } from '../test-utilities/imx-translation-provider.service.spy.spec';
import { RoutingMock } from '../test-utilities/router-mock.spec';
import { SessionServiceSpy } from '../test-utilities/imx-session.service.spy.spec';
import { ObjectOverviewService } from './object-overview.service';
import { PersonJobQueueInfo } from './person-job-queue-Info';
import { Subject } from 'rxjs';

@Component({
  selector: 'imx-ext',
  template: '<p>MockBulkPropertyEditorComponent</p>'
})
class MockExtComponent {
  @Input() public id: any;
  @Input() public referrer: any;
}

describe('ObjectOverviewComponent', () => {
  let component: ObjectOverviewComponent;
  let fixture: ComponentFixture<ObjectOverviewComponent>;

  const dummyJobQueueInfo = {
    Ready2EXE: { value: 'Frozen' },
    ErrorMessages: { value: 'ErrorMessages', Column: { GetDisplayValue: () => 'ErrorMessages' } },
    UID_Job: { value: 'UID_Test' }
  } as PersonJobQueueInfo;
  let routerSpy: RoutingMock = new RoutingMock();
  const dbObjectGetSpy = jasmine.createSpy('Get').and.returnValue(Promise.resolve({ Display: 'Display' }));

  const tableDisplaySingularDummy = 'person';
  const openDialogSpy = jasmine.createSpy('open');

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        MockExtComponent,
        ObjectOverviewComponent
      ],
      imports: [
        LoggerTestingModule
      ],
      schemas: [
        NO_ERRORS_SCHEMA
      ],
      providers: [
        {
          provide: Router,
          useValue: routerSpy
        },
        {
          provide: EuiLoadingService,
          useValue: {
            hide: jasmine.createSpy('hide'),
            show: jasmine.createSpy('show')
          }
        },
        {
          provide: imx_SessionService,
          useValue: new SessionServiceSpy()
        },
        {
          provide: ActivatedRoute,
          useValue: RoutingMock.GetActiveRouteMock(tableDisplaySingularDummy)
        },
        {
          provide: MatDialog,
          useClass: class {
            public open = openDialogSpy;
          }
        },
        {
          provide: OpsupportDbObjectService,
          useClass: class {
            public Get = dbObjectGetSpy;
          }
        },
        {
          provide: QueueJobsService,
          useClass: class {
            public Post = jasmine.createSpy('Post').and.returnValue(Promise.resolve({ Display: 'Display' }));
            public PostUntyped = jasmine.createSpy('PostUntyped').and.returnValue(Promise.resolve({ Display: 'Display' }));
          }
        },
        {
          provide: ObjectOverviewService,
          useValue: {
            get: jasmine.createSpy('get').and.returnValue(Promise.resolve({ DbQueue: [], JobQueue: [], Unsupported: false }))
          }
        },
        {
          provide: MetadataService,
          useClass: class {
            public GetTableMetadata = jasmine.createSpy('GetTableMetadata').and.returnValue(
              Promise.resolve({
                Columns: {},
                Display: 'tableDisplayDummy',
                DisplaySingular: tableDisplaySingularDummy,
                ImageId: '',
                IsDeactivated: false,
                IsMAllTable: false,
                IsMNTable: false
              })
            );
          }
        },
        {
          provide: ImxTranslationProviderService,
          useValue: new TranslationProviderServiceSpy()
        },
        {
          provide: FeatureConfigService,
          useValue: {
            getFeatureConfig: jasmine.createSpy('getFeatureConfig').and.returnValue(Promise.resolve({
              EnableSetPasswords: true
            }))
          }
        },
        {
          provide: AuthenticationService,
          useValue:{
            onSessionResponse: new Subject<ISessionState>(),
          }
        }
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ObjectOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('could be initialized by angular', async () => {
    await component.ngOnInit();

    expect(dbObjectGetSpy).toHaveBeenCalled();
    expect(component.tableDisplay).toBe(tableDisplaySingularDummy);
    expect(component.display).toBe('Display');
  });

  it('should check, if the item has an ErrorMessage or not', () => {
    expect(component.hasContent(dummyJobQueueInfo)).toBeTruthy();
  });

  it('should check, if a job is frozen', () => {
    expect(component.isFrozen(dummyJobQueueInfo)).toBeTruthy();
  });

  it('should reactivate a job', () => {
    expect(() => {
      component.reactivate(dummyJobQueueInfo);
    }).not.toThrowError();
  });

  it('should show the error message for a JobQueueInfo object', () => {
    expect(() => {
      component.showMessage(dummyJobQueueInfo);
    }).not.toThrowError();
  });

  it('could navigate to start', () => {
    component.goToStart();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['start']);
  });

  it('should check if the passcode have to be hide', async() => {
    await component.ngOnInit();
    expect(component.objectKey.TableName).toEqual('person');
    expect(component.showPassCodeTab).toEqual(component.objectKey.TableName === 'person');
  });
});
