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
import { configureTestSuite } from 'ng-bullet';

import { ParameterData, InteractiveEntityWriteData } from 'imx-qbm-dbts';
import { CartItemFkService } from './cart-item-fk.service';
import { QerApiService } from '../../qer-api-client.service';

describe('CartItemFkService', () => {
  let service: CartItemFkService;

  const qerApiStub = {
    client: {
      portal_cartitem_interactive_parameter_candidates_post: jasmine.createSpy('portal_cartitem_interactive_parameter_candidates_post')
    }
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: QerApiService,
          useValue: qerApiStub
        }
      ]
    });
    service = TestBed.inject(CartItemFkService);
  });

  beforeEach(() =>
    qerApiStub.client.portal_cartitem_interactive_parameter_candidates_post.calls.reset()
  );

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  for(const testcase of [
    { description: '', property: { ColumnName: 'testcolumn', FkRelation: { ParentTableName: 'parentTable' } } },
    { description: '', property: { ColumnName: 'testcolumnWithoutFK' } }
  ]) {
    it(testcase.description, async () => {
      const providers = service.getFkProviderItemsInteractive(
        {
          InteractiveEntityWriteData: {} as InteractiveEntityWriteData
        },
        { Property: testcase.property } as ParameterData
      );
      for (const provider of providers) {
        if (testcase.property.FkRelation == null) {
          expect(provider).toBeUndefined();
        } else {
          expect(provider.columnName).toEqual('testcolumn');
          expect(provider.fkTableName).toEqual('parentTable');

          await provider.load(undefined, { OrderBy: '', StartIndex: 0, PageSize: 5, filter: null });
          expect(qerApiStub.client.portal_cartitem_interactive_parameter_candidates_post).toHaveBeenCalled();
        }
      }
    });
  }
});
