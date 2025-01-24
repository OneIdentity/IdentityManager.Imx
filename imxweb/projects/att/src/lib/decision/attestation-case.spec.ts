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

import { AttCaseDataRead, PortalAttestationApprove } from 'imx-api-att';
import { IClientProperty, IEntity, IEntityColumn } from 'imx-qbm-dbts';
import { AttestationCase } from './attestation-case';

describe('AttestationCase', () => {
  function createColumn(value?) {
    return {
      GetMetadata: () => ({ CanEdit: () => true }),
      GetValue: () => value,
      GetDisplayValue: () => '',
    } as IEntityColumn;
  }

  function createEntitySchema(columnNames) {
    const clientProperties = {};
    columnNames.forEach((name) => (clientProperties[name] = {} as IClientProperty));
    return { Columns: clientProperties };
  }

  function createEntity(columns: { [name: string]: IEntityColumn } = {}, key?) {
    return {
      GetDisplay: () => '',
      GetColumn: (name) => columns[name] || createColumn(),
      GetKeys: () => [key],
      GetSchema: () => createEntitySchema(Object.keys(columns ?? {})),
    } as IEntity;
  }

  [
    { value: true, expected: 1 },
    { value: false, expected: 0 },
    { value: undefined, expected: 0 },
  ].forEach((testcase) =>
    it('adds IsCrossFunctional to propertyInfo only if it is "true"', () => {
      const entity = createEntity({
        IsCrossFunctional: createColumn(testcase.value),
        UiText: createColumn('some ui text'),
      });

      const approval = new AttestationCase(
        { GetEntity: () => entity } as PortalAttestationApprove,
        undefined,
        {} as { index: number } & AttCaseDataRead
      );

      expect(approval.propertyInfo.length).toEqual(testcase.expected);
    })
  );
});
