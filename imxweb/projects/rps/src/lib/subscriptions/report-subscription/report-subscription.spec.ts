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

import { PortalSubscriptionInteractive } from "imx-api-rps";
import { IClientProperty, IEntityColumn } from "imx-qbm-dbts";
import { ClassloggerService } from "qbm";
import { ParameterDataService } from "qer";
import { ReportSubscription } from "./report-subscription";

describe('ReportSubscription', () => {
  let subscription: ReportSubscription;
  const parameterDataService = new ParameterDataService(<any>{
    createLocalEntityColumn: () => ({} as IEntityColumn),
  }, <ClassloggerService>{});

  beforeEach(() => {
    subscription = new ReportSubscription(
      {} as PortalSubscriptionInteractive,
      () => [],
      parameterDataService)
  });


  it('can build a subscription', () => {
    expect(subscription).toBeDefined();
  });

  for (const testcase of [
    {
      subscription: null, properties: [], expect: 0
    },
    {
      subscription: {
        GetEntity: () => ({
          GetColumn: (name) => ({ ColumnName: name })
        })
      } as unknown, properties: [{ ColumnName: 'column 1' }, { ColumnName: 'column 2' }], expect: 2
    },
    {
      subscription: {
        Ident_RPSSubscription: {
          Column: {}
        },
        UID_RPSReport: {
          Column: {}
        },
        UID_DialogSchedule: {
          Column: {}
        },
        ExportFormat: {
          Column: {
            GetMetadata: () => {
              return {
                GetLimitedValues: () => {
                  return null;
                }
              };
            }
          }
        },
        AddtlSubscribers: {
          Column: {}
        }
      }, properties: [], expect: 5
    }
  ]) {
    it('can get cdrs', () => {
      subscription = new ReportSubscription(
        testcase.subscription as PortalSubscriptionInteractive,
        () => [],
        parameterDataService);

      expect(subscription.getCdrs(testcase.properties as IClientProperty[]).length).toEqual(testcase.expect);
    })
  }

  for (const testcase of [
    { description: 'without parameter', parameter: [], count: 5 },
    { description: 'with parameter', parameter: [[{ Property: 'test', Value: 'test' }]], count: 6 }
  ]) {
    it(`can get all columns ${testcase.description}`, () => {
      subscription = new ReportSubscription(
        {
          Ident_RPSSubscription: {
            Column: {}
          },
          UID_RPSReport: {
            Column: {}
          },
          UID_DialogSchedule: {
            Column: {}
          },
          ExportFormat: {
            Column: {
              GetMetadata: () => {
                return {
                  GetLimitedValues: () => {
                    return null;
                  }
                };
              }
            }
          },
          AddtlSubscribers: {
            Column: {}
          },
          extendedDataRead: testcase.parameter,
          onChangeExtendedDataRead: _ => { }
        } as unknown as PortalSubscriptionInteractive,
        () => [],
        parameterDataService);

      subscription.getParameterCdr();
      expect(subscription.getDisplayableColums().length).toEqual(testcase.count);
    })
  }

  for (const testcase of [
    { description: 'without parameter', parameter: [], count: 0 },
    { description: 'with parameter', parameter: [[{ Property: 'test', Value: 'test' }]], count: 1 }
  ]) {
    it(`can get parameter cdrs ${testcase.description}`, () => {
      subscription = new ReportSubscription(
        {
          extendedDataRead: testcase.parameter,
          onChangeExtendedDataRead: _ => { },
        } as PortalSubscriptionInteractive,
        () => [],
        parameterDataService);

      expect(subscription.getParameterCdr().length).toEqual(testcase.count);
    })
  }

  for (const testcase of [
    { description: 'without parameter', parameter: [], count: 0 },
    { description: 'with parameter', parameter: [[{ Property: 'test', Value: 'test' }]], count: 1 }
  ]) {
    it(`can init parameter columns ${testcase.description}`, () => {
      subscription = new ReportSubscription(
        {
          extendedDataRead: testcase.parameter,
          onChangeExtendedDataRead: _ => { },
        } as PortalSubscriptionInteractive,
        () => [],
        parameterDataService);

      expect(subscription.getParameterCdr().length).toEqual(testcase.count);

    })
  }

  for (const testcase of [
    { description: 'without parameter', parameter: [], count: 0 },
    { description: 'with parameter', parameter: [[{ Property: 'test', Value: 'test' }]], count: 1 }
  ]) {
    it(`can submit values ${testcase.description}`, async () => {
      let commit = false;
      subscription = new ReportSubscription(
        {
          GetEntity: () => ({
            Commit: () => commit = true
          }),
          extendedDataRead: testcase.parameter
        } as unknown as PortalSubscriptionInteractive,
        () => [],
        // () => ({ GetValue: () => 'test' } as IEntityColumn));
        parameterDataService);

      await subscription.submit();

      expect(commit).toBeTruthy();

    })
  }
});
