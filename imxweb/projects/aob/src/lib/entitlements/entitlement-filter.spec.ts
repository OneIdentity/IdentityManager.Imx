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
 * Copyright 2023 One Identity LLC.
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

import { EntitlementFilter } from './entitlement-filter';
import { PortalEntitlement } from 'imx-api-aob';
import { DbVal } from 'imx-qbm-dbts';

describe('EntitlementFilter', () => {
  const entitlementNotPublished = {
    IsInActive: { value: true },
    ActivationDate: { value: null }
  };

  const dateLaterThanMinDate = DbVal.MinDate;
  dateLaterThanMinDate.setDate(dateLaterThanMinDate.getDate() + 1);

  const entitlementWillPublish = {
    IsInActive: { value: true },
    ActivationDate: { value: dateLaterThanMinDate }
  };

  const entitlementPublished = {
    IsInActive: { value: false },
    ActivationDate: { value: null }
  };

  const mockEntitlementData = [
    entitlementNotPublished,
    entitlementWillPublish,
    entitlementPublished
  ];

  it('notPublished', () => {
    const filter = new EntitlementFilter();
    expect(filter.notPublished(entitlementNotPublished as PortalEntitlement)).toBeTruthy();
    expect(mockEntitlementData.filter(filter.notPublished)).toEqual([entitlementNotPublished]);
  });

  it('willPublish', () => {
    const filter = new EntitlementFilter();
    expect(filter.willPublish(entitlementWillPublish as PortalEntitlement)).toBeTruthy();
    expect(mockEntitlementData.filter(filter.willPublish)).toEqual([entitlementWillPublish]);
  });

  it('published', () => {
    const filter = new EntitlementFilter();
    expect(filter.published(entitlementPublished as PortalEntitlement)).toBeTruthy();
    expect(mockEntitlementData.filter(filter.published)).toEqual([entitlementPublished]);
  });
});
