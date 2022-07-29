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

import { TypedEntity } from 'imx-qbm-dbts';
import { ParameterDataService } from '../../parameter-data/parameter-data.service';
import { CartItemFkService } from './cart-item-fk.service';
import { CartItemInteractiveService } from './cart-item-interactive.service';
import { RequestParametersService } from './request-parameters.service';
import { QerApiService } from '../../qer-api-client.service';
import { ParameterCategoryColumn } from '../../parameter-data/parameter-category-column.interface';
import { PortalCartitemInteractive } from 'imx-api-qer';

describe('CartItemInteractiveService', () => {
  let service: CartItemInteractiveService;

  function createItem(key: string, parent?: string) {
    return {
      GetEntity: () => ({
        GetKeys: () => [key],
        GetDisplay: () => undefined,
        Commit: _ => Promise.resolve()
      }),
      UID_PersonOrdered: {},
      UID_ITShopOrg: {},
      OrderReason: {},
      PWOPriority: {},
      RequestType: {},
      UID_ShoppingCartItemParent: { value: parent },
      UID_AccProduct: { value: key }
    } as PortalCartitemInteractive;
  }

  const portalCartitemInteractiveMethod = new class {
    readonly typedEntityKey = 'some key';
    readonly parameters = { someParameterCategory: [[]] };

    readonly parameterCategoryColumns = [{
      parameterCategoryName: 'someParameterCategory',
      column: {}
    }] as ParameterCategoryColumn[];

    private readonly data = [createItem(this.typedEntityKey)];

    Get_byid = jasmine.createSpy('Get_byid').and.returnValue(Promise.resolve({
      totalCount: this.data.length,
      Data: this.data,
      extendedData: { Parameters: this.parameters }
    }))
  }();

  const apiService = {
    typedClient: {
      PortalCartitemInteractive: portalCartitemInteractiveMethod,
      PortalCartiteminteractive:  portalCartitemInteractiveMethod}
  };

  const parameterDataService = new class {
    readonly parameterCategoryColumns = [
      { parameterCategoryName: 'aaa', column: {} },
      { parameterCategoryName: 'StructureParameter', column: {} },
      { parameterCategoryName: 'a0', column: {} }
    ];

    readonly createParameterCategoryColumns = (__parameters, __getFk) => this.parameterCategoryColumns;

    readonly getEntityWriteDataColumns = jasmine.createSpy('getEntityWriteDataColumns');
  }();

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: QerApiService,
          useValue: apiService
        },
        {
          provide: ParameterDataService,
          useValue: parameterDataService
        },
        {
          provide: CartItemFkService,
          useValue: {
            getFkProviderItemsInteractive: jasmine.createSpy('getFkProviderItemsInteractive')
          }
        },
        {
          provide: RequestParametersService,
          useValue: {
            createInteractiveParameterCategoryColumns: jasmine.createSpy('createInteractiveParameterCategoryColumns')
              .and.returnValue(portalCartitemInteractiveMethod.parameterCategoryColumns)
          }
        }
      ]
    });
    service = TestBed.inject(CartItemInteractiveService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('provides an interactive cart item entity with corresponding extended data', async () => {
    const uid = portalCartitemInteractiveMethod.typedEntityKey;

    const entityWrapper = await service.getExtendedEntity(uid);

    expect(apiService.typedClient.PortalCartitemInteractive.Get_byid).toHaveBeenCalledWith(uid);

    expect(entityWrapper.typedEntity.GetEntity().GetKeys().join('')).toEqual(uid);
    expect(entityWrapper.parameterCategoryColumns).toEqual(portalCartitemInteractiveMethod.parameterCategoryColumns);
  });
});
