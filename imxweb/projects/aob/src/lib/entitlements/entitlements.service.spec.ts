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

import { ErrorHandler } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { configureTestSuite } from 'ng-bullet';
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';
import { LoggerTestingModule } from 'ngx-logger/testing';

import { EntitlementsService } from './entitlements.service';
import { DbVal } from 'imx-qbm-dbts';
import { PortalEntitlementcandidatesEset, PortalEntitlement, PortalApplication } from 'imx-api-aob';
import { AobApiService } from '../aob-api-client.service';
import { EntitlementsType } from './entitlements.model';

describe('EntitlementsService', () => {

  const mockEntitlementData = [
    { UID_AOBApplication: { value: 'uid' } },
    { UID_AOBApplication: { value: 'uid' } },
    { UID_AOBApplication: { value: 'uid' } }];

  function getDateWithOffset(date: Date, days: number): Date {
    let dateWithOffset = date;
    dateWithOffset.setDate(dateWithOffset.getDate() + days);
    return dateWithOffset;
  }

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateFakeLoader
          }
        })
      ],
      providers: [
        {
          provide: AobApiService,
          useValue: {
            typedClient: {
              PortalEntitlement: jasmine.createSpyObj('PortalEntitlement', {
                Get: Promise.resolve({
                  totalCount: mockEntitlementData.length,
                  Data: mockEntitlementData
                })
              }),
              PortalEntitlementInteractive: jasmine.createSpyObj('PortalEntitlementInteractive', {
                Get: Promise.resolve({
                  Data: [{
                    ObjectKeyElement: {},
                    UID_AOBApplication: {},
                    IsInActive: {},
                    GetEntity: () => ({
                      Commit: () => undefined
                    })
                  }]
                }),
                Get_byid: Promise.resolve({
                  Data: [{
                    ObjectKeyElement: {Column : {PutValue: ()=> undefined}},
                    UID_AOBApplication: {Column : {PutValue: ()=> undefined}},
                    IsInActive: {Column : {PutValue: ()=> undefined}},
                    GetEntity: () => ({
                      Commit: () => undefined
                    })
                  }]
                }),
              }),
              PortalEntitlementcandidatesUnsgroup: jasmine.createSpyObj('PortalEntitlementcandidatesUnsgroup', {
                Get: Promise.resolve({
                  totalCount: mockEntitlementData.length,
                  Data: mockEntitlementData
                })
              }),
              PortalEntitlementcandidatesEset: jasmine.createSpyObj('PortalEntitlementcandidatesEset', {
                Get: Promise.resolve({
                  totalCount: mockEntitlementData.length,
                  Data: mockEntitlementData
                })
              })
            },
          }
        },
        {
          provide: ErrorHandler,
          useValue: { handleError: _ => {} } // Don't litter the test log with error messages
        }
      ]
    });
  });

  it('should be created', () => {
    const service: EntitlementsService = TestBed.get(EntitlementsService);
    expect(service).toBeDefined();
  });

  [
    (service, parameters) => service.get(parameters),
    (service, parameters) => service.getCandidates(EntitlementsType.UnsGroup, parameters),
    (service, parameters) => service.getEntitlementsForApplication({ UID_AOBApplication: { value: 'uid' } }, parameters)
  ].forEach(method => {
    [
      { parameters: undefined },
      { parameters: {} },
      { parameters: { filter: '[]' } }
    ].forEach(testcase => it('provides entitlements', async () => {
      const service: EntitlementsService = TestBed.get(EntitlementsService);
      const entitlements = await method(service, testcase.parameters);
      expect(entitlements.totalCount).toEqual(mockEntitlementData.length);
    }));
  });

  it('has an assign method', async () => {
    const candidates = [
      { 
        XObjectKey: { } ,
        GetEntity: () => ({
          GetColumn: (__) => ({
            GetValue: () => ({})
          })
        })
     } as PortalEntitlementcandidatesEset];
    const service: EntitlementsService = TestBed.get(EntitlementsService);
    expect(await service.assign({ UID_AOBApplication: { } } as PortalApplication, candidates)).toEqual(candidates.length);
  });

  [
    {
      entitlements: [],
      expectedPublishCount: 0
    },
    {
      entitlements: [
        {
          IsInActive: {},
          ActivationDate: {},
          GetEntity: () => ({ Commit: () => {}, GetKeys: ()=> ['key1'] })
        }
      ],
      expectedPublishCount: 1
    }
  ].forEach(testcase =>
  it('has a publish method', async () => {
    const service: EntitlementsService = TestBed.get(EntitlementsService);
    const publishCount = await service.publish(testcase.entitlements as PortalEntitlement[], { publishFuture: false, date: new Date() });
    expect(publishCount).toEqual(testcase.expectedPublishCount);
  }));

  [
    {
      entitlement: { IsInActive: { value: false } },
      expectedBadge: { content: 'published', color: '#618f3e' }
    },
    {
      entitlement: { IsInActive: { value: true }, ActivationDate: { value: getDateWithOffset(DbVal.MinDate, 1) } },
      expectedBadge: { content: 'will be published', color: '#f4770b' }
    }
  ].forEach(testcase =>
    it('has a getEntitlementBadges method', () => {
      const service: EntitlementsService = TestBed.get(EntitlementsService);
      const badges = service.getEntitlementBadges(testcase.entitlement as PortalEntitlement);
      expect(badges.length).toBeGreaterThan(0);
      expect(badges[0].color).toEqual(testcase.expectedBadge.color);
    })
  );

  it('has a getEntitlementBadges method - undefined when state is not published', () => {
    const service: EntitlementsService = TestBed.get(EntitlementsService);

    const entitlement = { IsInActive: { value: true }, ActivationDate: { value: null } };

    const badges = service.getEntitlementBadges(entitlement as PortalEntitlement);
    expect(badges.length).toBe(0);
  })
});
