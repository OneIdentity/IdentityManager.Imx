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
  DbObjectKey,
  ExtendedTypedEntityCollection,
  FilterType,
  IEntity,
  TypedEntity,
} from '@imx-modules/imx-qbm-dbts';
import { DynamicMethodService, GenericTypedEntity, ImxTranslationProviderService, imx_SessionService } from 'qbm';
import { QerApiService } from '../../qer-api-client.service';

export interface IRoleEntitlements {
  getCollection(
    id: string,
    navigationState?: CollectionLoadParameters,
    objectKeyForFiltering?: string,
  ): Promise<ExtendedTypedEntityCollection<TypedEntity, unknown>>;

  getEntitlementTypes(role?: IEntity): Promise<RoleAssignmentData[]>;

  createEntitlementAssignmentEntity(role: IEntity, entlType?: RoleAssignmentData): IEntity | undefined;

  entitlementFkName: string;

  /** Removes a single entitlement assignment from the role. */
  delete(roleId: string, entity: IEntity): Promise<void>;
}

export class BaseTreeEntitlement implements IRoleEntitlements {
  public entitlementFkName = 'ObjectKeyElement'; // column name in QERVBaseTreeHasElement
  private basePath = 'portal/roles/config/entitlements'; // hard coded as there is no delete/creation method in the client

  constructor(
    protected readonly api: QerApiService,
    protected readonly session: imx_SessionService,
    private readonly dynamicMethodSvc: DynamicMethodService,
    protected readonly translator: ImxTranslationProviderService,
    private readonly roletype: string,
    public uidOrgRoot: (e: IEntity) => string,
  ) {}

  public getEntitlementTypes(role: IEntity) {
    return this.api.client.portal_roles_config_classes_get(this.uidOrgRoot(role));
  }

  public async delete(id: string, entity: IEntity): Promise<void> {
    const key = DbObjectKey.FromXml(entity.GetColumn(this.entitlementFkName).GetValue());
    const entlType = key.TableName;
    const uidEntitlement = key.Keys[0];
    await this.dynamicMethodSvc.delete(this.api.apiClient, `/${this.basePath}/${this.roletype}/${id}/${entlType}/${uidEntitlement}`, {});
  }

  public async getCollection(
    id: string,
    navigationState?: CollectionLoadParameters,
    objectKeyForFiltering?: string,
  ): Promise<ExtendedTypedEntityCollection<TypedEntity, unknown>> {
    return this.api.typedClient.PortalRolesEntitlements.Get(this.roletype, id, {
      ...navigationState,
      filter: objectKeyForFiltering
        ? [
            {
              ColumnName: this.entitlementFkName,
              CompareOp: CompareOperator.Equal,
              Type: FilterType.Compare,
              Value1: objectKeyForFiltering,
            },
          ]
        : undefined,
    });
  }

  public createEntitlementAssignmentEntity(role: IEntity, entlType: RoleAssignmentData): IEntity | undefined {
    if (entlType == null) {
      return undefined;
    }
    const uidRole = role.GetKeys()[0];
    const initialData = {
      [entlType.RoleFk || 'dummy']: { Value: uidRole },
    };
    const entityColl = this.dynamicMethodSvc.createEntity(
      this.api.apiClient,
      {
        path: `/${this.basePath}/${entlType.RoleTable}/${uidRole}/${entlType.TableName}`,
        type: GenericTypedEntity,
        schemaPath: `${this.basePath}/${entlType.RoleTable}/{${entlType.RoleFk}}/${entlType.TableName}`,
      },
      {
        Columns: initialData,
      },
    );
    return entityColl.Data[0].GetEntity();
  }
}
