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
 * Copyright 2024 One Identity LLC.
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

import { RoleAssignmentData } from '@imx-modules/imx-api-qer';
import {
  CollectionLoadParameters,
  CompareOperator,
  ExtendedTypedEntityCollection,
  FilterType,
  IEntity,
  TypedEntity,
} from '@imx-modules/imx-qbm-dbts';
import { ImxTranslationProviderService } from 'qbm';
import { IRoleEntitlements } from 'qer';
import { RmsApiService } from './rms-api-client.service';

export class EsetEntitlements implements IRoleEntitlements {
  public entitlementFkName = 'Entitlement'; // column name in ESetHasEntitlement

  constructor(
    private readonly api: RmsApiService,
    protected readonly translator: ImxTranslationProviderService,
  ) {}

  public async getCollection(
    id: string,
    navigationState?: CollectionLoadParameters,
    objectKeyForFiltering?: string,
  ): Promise<ExtendedTypedEntityCollection<TypedEntity, unknown>> {
    return this.api.typedClient.PortalRolesConfigEntitlementsEset.Get(id, {
      ...navigationState,
      filter: objectKeyForFiltering
        ? [
            {
              ColumnName: 'Entitlement',
              CompareOp: CompareOperator.Equal,
              Type: FilterType.Compare,
              Value1: objectKeyForFiltering,
            },
          ]
        : undefined,
    });
  }

  getEntitlementTypes(role: IEntity): Promise<RoleAssignmentData[]> {
    return this.api.client.portal_roles_config_classes_ESet_get();
  }

  async delete(roleId: string, entity: IEntity): Promise<void> {
    const esethasentl = entity.GetKeys()[0];
    await this.api.client.portal_roles_config_entitlements_ESet_delete(roleId, esethasentl);
  }

  public createEntitlementAssignmentEntity(role: IEntity): IEntity {
    const uidESet = role.GetKeys()[0];
    return this.api.typedClient.PortalRolesConfigEntitlementsEset.createEntity({ Columns: { UID_ESet: { Value: uidESet } } }).GetEntity();
  }
}
