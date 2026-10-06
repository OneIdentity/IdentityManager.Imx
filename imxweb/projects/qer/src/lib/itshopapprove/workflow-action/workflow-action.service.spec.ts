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
 * Copyright 2026 One Identity LLC.
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

import moment from 'moment';
import { of } from 'rxjs';

import { WorkflowActionService } from './workflow-action.service';

interface ColumnWrite {
  column: string;
  value: any;
}

function createRequest(validFrom: Date | null, validUntil: Date | null) {
  const writes: ColumnWrite[] = [];
  const createProperty = (name: string, initial: Date | null) => {
    let current = initial;
    return {
      get value() {
        return current;
      },
      set value(value: any) {
        current = value;
        writes.push({ column: name, value });
      },
      Column: {
        PutValue: async (value: any) => {
          current = value;
          writes.push({ column: name, value });
        },
      },
    };
  };

  return {
    writes,
    ValidFrom: createProperty('ValidFrom', validFrom),
    ValidUntil: createProperty('ValidUntil', validUntil),
    ApproveReasonType: { value: 0 },
    IsApproveRequiresMfa: { value: false },
    UID_QERTermsOfUse: { value: '' },
    pwoData: undefined,
    canSetValidFrom: () => true,
    canSetValidUntil: () => true,
    commit: jasmine.createSpy('commit').and.resolveTo(),
    GetEntity: () => ({
      GetDisplay: () => 'Request',
      GetKeys: () => ['uid'],
      DiscardChanges: async () => {},
    }),
  };
}

describe('WorkflowActionService.approve (validity dates)', () => {
  let service: WorkflowActionService;
  let formGroup: { controls: { [key: string]: { value: any } } };
  let makeDecision: jasmine.Spy;

  const pastDate = moment().startOf('day').subtract(3, 'days');

  beforeEach(() => {
    formGroup = { controls: {} };
    makeDecision = jasmine.createSpy('makeDecision').and.resolveTo();

    const schema = { Columns: { ValidFrom: { ColumnName: 'ValidFrom' }, ValidUntil: { ColumnName: 'ValidUntil' } } };
    // The general (bulk) columns: only their existence matters here, apply() reads the form controls.
    const localColumn = { GetValue: () => undefined };

    service = new WorkflowActionService(
      { typedClient: { PortalItshopApproveRequests: { GetSchema: () => schema } } } as any,
      { open: () => ({ afterClosed: () => of(formGroup) }) } as any,
      { instant: (key: string) => key } as any,
      { createLocalEntityColumn: () => localColumn } as any,
      { overlayRefs: [], show: () => {}, hide: () => {} } as any,
      { open: () => {} } as any,
      { debug: () => {} } as any,
      {} as any,
      {
        getConfig: async () => ({
          ITShopConfig: {
            VI_ITShop_ApproverCanSetValidFrom: true,
            VI_ITShop_ApproverCanSetValidUntil: true,
            StepUpAuthenticationProvider: 'NoAuth',
          },
        }),
      } as any,
      { makeDecision } as any,
      { createCdr: async () => undefined } as any,
      {} as any,
      { reloadPendingItems: async () => {} } as any,
      { actionThreshold: 100 } as any,
    );
    spyOn<any>(service, 'checkTermsOfUse').and.resolveTo({ isChecked: true, isAuthenticated: true });
  });

  it('does not resubmit an untouched past ValidFrom for a single request (738689)', async () => {
    const request = createRequest(pastDate.toDate(), null);
    formGroup.controls.ValidFrom = { value: pastDate.clone() };

    await service.approve([request as any], 'uidUser', false);

    expect(request.writes.filter((w) => w.column === 'ValidFrom')).toEqual([]);
    expect(request.ValidFrom.value).toEqual(pastDate.toDate());
    expect(request.commit).toHaveBeenCalled();
    expect(makeDecision).toHaveBeenCalled();
  });

  it('writes null when ValidFrom was cleared for a single request (702471)', async () => {
    const request = createRequest(pastDate.toDate(), null);
    formGroup.controls.ValidFrom = { value: null };

    await service.approve([request as any], 'uidUser', false);

    expect(request.writes.filter((w) => w.column === 'ValidFrom')).toEqual([{ column: 'ValidFrom', value: null }]);
  });

  it('does not overwrite a valid ValidUntil for a single request (709042)', async () => {
    const validUntil = moment().startOf('day').add(10, 'days');
    const request = createRequest(null, validUntil.toDate());
    formGroup.controls.ValidUntil = { value: validUntil.clone() };

    await service.approve([request as any], 'uidUser', false);

    expect(request.writes.filter((w) => w.column === 'ValidUntil')).toEqual([]);
    expect(request.ValidUntil.value).toEqual(validUntil.toDate());
  });

  it('applies the general ValidFrom to every request in a bulk approval', async () => {
    const general = moment().startOf('day').add(2, 'days');
    const requests = [createRequest(null, null), createRequest(pastDate.toDate(), null)];
    formGroup.controls.ValidFrom = { value: general.clone() };

    await service.approve(requests as any[], 'uidUser', false);

    for (const request of requests) {
      const writes = request.writes.filter((w) => w.column === 'ValidFrom');
      expect(writes.length).toBe(1);
      expect(moment(writes[0].value).isSame(general, 'day')).toBeTrue();
    }
  });

  it('keeps the individual ValidFrom values when the general ValidFrom is empty in a bulk approval', async () => {
    const requests = [createRequest(null, null), createRequest(pastDate.toDate(), null)];
    formGroup.controls.ValidFrom = { value: null };

    await service.approve(requests as any[], 'uidUser', false);

    for (const request of requests) {
      expect(request.writes.filter((w) => w.column === 'ValidFrom')).toEqual([]);
    }
    expect(requests[1].ValidFrom.value).toEqual(pastDate.toDate());
  });
});
