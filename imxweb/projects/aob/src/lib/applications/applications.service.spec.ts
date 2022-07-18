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

import { TestBed } from '@angular/core/testing';
import { ErrorHandler } from '@angular/core';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';
import { TranslateService } from '@ngx-translate/core';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { of } from 'rxjs';

import { ApplicationsService } from './applications.service';
import { PortalApplication } from 'imx-api-aob';
import { AobApiService } from '../aob-api-client.service';
import { SnackBarService } from 'qbm';

describe('ApplicationsService', () => {
  function createApplication(onCommit?): PortalApplication {
    return {
      IsInActive: {Column: {PutValue:jasmine.createSpy('PutValue')}},
      ActivationDate: {Column: {PutValue:jasmine.createSpy('PutValue')}},
      AuthenticationRoot: {},
      GetEntity: () => ({ Commit: () => { if (onCommit) { onCommit(); } } })
    } as unknown as PortalApplication;
  }

  const mockApplications = {
    totalCount: 0,
    Data: []
  };
  const mockApplicationsInshop = {
    totalCount: 1,
    Data: []
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerTestingModule
      ],
      providers: [
        {
          provide: AobApiService,
          useValue: {
            typedClient: {
              PortalApplication: jasmine.createSpyObj('PortalApplication', {
                Get: Promise.resolve(mockApplications)
              }),
              PortalApplicationinshop: jasmine.createSpyObj('PortalApplicationinshop', {
                Get: Promise.resolve(mockApplicationsInshop)
              }),
              PortalApplicationNew: jasmine.createSpyObj('PortalApplicationNew', {
                createEntity: {}
              })
            },
          }
        },
        {
          provide: ErrorHandler,
          useValue: { handleError: _ => { } } // Don't litter the test log with error messages
        },
        {
          provide: TranslateService,
          useValue: {
            get: jasmine.createSpy('get').and.callFake(key => of(key.replace('#LDS#', '')))
          }
        },
        {
          provide: EuiSidesheetService,
          useValue: { }
        },
        {
          provide: SnackBarService,
          useValue: { }
        },
        {
          provide: EuiLoadingService,
          useValue: { }
        }
      ]
    });
  });

  it('should be created', () => {
    const service: ApplicationsService = TestBed.get(ApplicationsService);
    expect(service).toBeDefined();
  });

  [
    { parameters: undefined },
    { parameters: {} },
    { parameters: { filter: [] } }
  ].forEach(testcase => it('provides applications', async () => {
    const service: ApplicationsService = TestBed.get(ApplicationsService);
    const applications = await service.get(testcase.parameters);
    expect(applications.totalCount).toEqual(mockApplications.totalCount);
  }));

  it('has a createNew method', () => {
    const service: ApplicationsService = TestBed.get(ApplicationsService);
    const applicationNew = service.createNew();
    expect(applicationNew).toBeTruthy();
  });

  [
    {
      application: createApplication(),
      expectedPublish: true
    },
    {
      application: createApplication(() => { throw new Error(); }),
      expectedPublish: false
    }
  ].forEach(testcase =>
    it('has a publish and an unpublish method', async () => {
      const service: ApplicationsService = TestBed.get(ApplicationsService);
      const isPublished = await service.publish(testcase.application, { publishFuture: false, date: new Date() });
      expect(isPublished).toEqual(testcase.expectedPublish);

      const isUnpublished = await service.unpublish(testcase.application);
      expect(isUnpublished).toEqual(testcase.expectedPublish);
    }));

  [
    {
      description: 'has kpi errors and is published',
      expected: {
        badges: [
          {
            color: '#f4770b',
            content: 'KPI issues'
          },
          {
            color: '#618f3e',
            content: 'Published'
          }
        ]
      },
      application:
      {
        IsInActive: {
          value: false
        },
        HasKpiIssues: {
          value: true
        }
      }
    },
    {
      description: 'is published',
      expected: {
        badges: [{
          color: '#618f3e',
          content: 'Published'
        }]
      },
      application:
      {
        IsInActive: {
          value: false
        },
        HasKpiIssues: {
          value: false
        }
      }
    },
    {
      description: 'has kpi errors',
      expected: {
        badges: [{
          color: '#f4770b',
          content: 'KPI issues'
        }]
      },
      application:
      {
        IsInActive: {
          value: true
        },
        HasKpiIssues: {
          value: true
        }
      }
    },
    {
      description: 'has no kpi errors and is not published',
      expected: {
        badges: []
      },
      application:
      {
        IsInActive: {
          value: true
        },
        HasKpiIssues: {
          value: false
        }
      }
    }
  ].forEach(testcase =>
    it(`should show ${testcase.expected.badges.length} badge(s) because the application ${testcase.description}`, () => {
      // Arrange & Act
      const badges = TestBed.get(ApplicationsService).getApplicationBadges(testcase.application as PortalApplication);

      // Assert
      expect(badges.length).toBe(testcase.expected.badges.length);

      for (let i = 0; i < badges.length; i++) {
        expect(badges[i].color).toBe(testcase.expected.badges[i].color);
        expect(badges[i].content).toBe(testcase.expected.badges[i].content);
      }
    }));
});
