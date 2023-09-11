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

import { TestBed } from '@angular/core/testing';

import { ValType, EntitySchema, IClientProperty } from 'imx-qbm-dbts';
import { imx_SessionService } from 'qbm';

export interface ClientPropertyMock {
  name: string;
  type?: ValType;
  Display?: string;
  sorting?: boolean;
}

export function CreateEntitySchema(properties: ClientPropertyMock[]): EntitySchema {
  const columns: { [id: string]: IClientProperty } = {};
  properties.forEach(
    property =>
      (columns[property.name] = {
        Type: property.type ? property.type : ValType.String,
        Display: property.Display,
      })
  );
  return { Columns: columns };
}

export interface TypedEntityReadOnlyProviderTestConfig<TEntity, TParameters> {
  type: any;
  entityType: any;
  data: TEntity[];
  parameters: TParameters;
  typedClient?: any;
}

export function testTypedEntityReadOnlyProvider<TEntity, TParameters>(testconfig: TypedEntityReadOnlyProviderTestConfig<TEntity, TParameters>): void {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      testconfig.type,
      {
        provide: imx_SessionService,
        useValue: { TypedClient: testconfig.typedClient }
      }
    ]
  }));

  it('should be created', () => {
    expect(TestBed.get(testconfig.type)).toBeTruthy();
  });

  it('provides TypedEntityCollectionData', async () => {
    const entity = await TestBed.get(testconfig.type).Get(testconfig.parameters);
    expect(entity.Data).toEqual(testconfig.data);
    expect(entity.totalCount).toEqual(testconfig.data.length);
  });
}
