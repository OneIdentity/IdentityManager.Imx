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
import { PortalSubscriptionInteractive } from 'imx-api-rps';
import { configureTestSuite } from 'ng-bullet';

import { ParameterDataService } from 'qer';
import { RpsApiService } from '../../rps-api-client.service';
import { ReportSubscriptionService } from './report-subscription.service';

function buildEmptySubscription(): PortalSubscriptionInteractive {
  let uidReport: string;
  let ident: string;
  let format: string;
  const sub = {
    UID_RPSReport: {
      Column: {
        GetValue: () => uidReport,
        PutValue: (value: string) => uidReport = value,
        GetDisplayValue: () => `display of ${uidReport}`
      }
    },
    Ident_RPSSubscription: {
      Column: {
        GetValue: () => ident,
        PutValue: (value: string) => ident = value
      }
    },
    ExportFormat: {
      Column: {
        GetValue: () => format,
        GetMetadata: () => {
          return {
            GetLimitedValues: () => {
              return [{
                Value: 'PDF'
              }];
            }
          };
        },
        PutValue: (value: string) => format = value
      }
    }
  } as unknown;
  return sub as PortalSubscriptionInteractive;
}

describe('ReportSubscriptionService', () => {
  let service: ReportSubscriptionService;

  const apiServiceStub = {
    client: {
      portal_subscription_interactive_parameter_candidates_post: jasmine.createSpy('portal_subscription_interactive_parameter_candidates_post')
    },
    typedClient: {
      PortalReports: {
        Get: jasmine.createSpy('Get').and.returnValue(Promise.resolve({ totalCount: 1, Data: [] }))
      },
      PortalSubscriptionInteractive: {
        Get: jasmine.createSpy('Get').and.returnValue(Promise.resolve({ totalCount: 1, Data: [buildEmptySubscription()], extendedData: [] }))
      }
    }
  }

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: RpsApiService,
          useValue: apiServiceStub
        },
        {
          provide: ParameterDataService,
          useValue: {
            createInteractiveParameterColumns: (parameters) => parameters.map(p => { })
          }
        }
      ]
    });
    service = TestBed.inject(ReportSubscriptionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('can get report candidates', async () => {
    const reporCandidates = await service.getReportCandidates({ PageSize: 1, StartIndex: 0 });
    expect(reporCandidates.totalCount).toEqual(1);
  });

  it('can create new Subscription', async () => {
    const newSub = await service.createNewSubscription('UID_of_chosen_report');
    expect(apiServiceStub.typedClient.PortalSubscriptionInteractive.Get).toHaveBeenCalled();
    expect(newSub.subscription.UID_RPSReport.Column.GetValue()).toEqual('UID_of_chosen_report');
    expect(newSub.subscription.Ident_RPSSubscription.Column.GetValue()).toEqual('display of UID_of_chosen_report');
    expect(newSub.subscription.ExportFormat.Column.GetValue()).toEqual('PDF');
  });

  for (const extendedData of [
    {
      Property: {
        ColumnName: 'test',
        FkRelation: {
          ParentTableName: 'parentTable'
        },
        ValidReferencedTables: []
      }
    }, {
      Property: {
        ColumnName: 'test',
        ValidReferencedTables: ['something']
      }
    }, {
      Property: {
        ColumnName: 'test',
      }
    }
  ]) {
    it('can use subscription', async () => {
      const empty = buildEmptySubscription()
      const extended = {
        extendedDataRead: [[extendedData]]
      }
      const sub = service.buildRpsSubscription({
        ...empty,
        ...extended
      } as PortalSubscriptionInteractive)

      expect(sub.getParameterCdr().length).toEqual(1);
    });
  }

});
