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

import { RoleAssignmentData } from 'imx-api-qer';
import { CollectionLoadParameters, CompareOperator, DbObjectKey, ExtendedTypedEntityCollection, FilterType, IEntity, TypedEntity } from 'imx-qbm-dbts';
import { DynamicMethod, DynamicMethodService, GenericTypedEntity, ImxTranslationProviderService, imx_SessionService } from 'qbm';
import { QerApiService } from '../../qer-api-client.service';

export interface IRoleEntitlements {
  getCollection(id: string, navigationState?: CollectionLoadParameters, objectKeyForFiltering?: string): Promise<ExtendedTypedEntityCollection<TypedEntity, unknown>>;

  getEntitlementTypes(role: IEntity): Promise<RoleAssignmentData[]>;

  createEntitlementAssignmentEntity(role: IEntity, entlType: RoleAssignmentData): IEntity;

  getEntitlementFkName(): string;

  /** Removes a single entitlement assignment from the role. */
  delete(roleId: string, entity: IEntity): Promise<void>;
}

export class BaseTreeEntitlement implements IRoleEntitlements {
  public readonly schemaPaths: Map<string, string> = new Map();

  constructor(
    protected readonly api: QerApiService,
    protected readonly session: imx_SessionService,
    private readonly dynamicMethodSvc: DynamicMethodService,
    protected readonly translator: ImxTranslationProviderService,
    private readonly roletype: string,
    public uidOrgRoot: (e: IEntity) => string
  ) {
    this.schemaPaths.set('get', `portal/roles/entitlements/{roletype}/{uidrole}`);
  }

  public getEntitlementTypes(role: IEntity) {
    return this.api.client.portal_roles_config_classes_get(this.uidOrgRoot(role));
  }

  public getEntitlementFkName() {
    return 'ObjectKeyElement'; // column name in QERVBaseTreeHasElement
  }

  public async delete(id: string, entity: IEntity): Promise<void> {
    const key = DbObjectKey.FromXml(entity.GetColumn('ObjectKeyElement').GetValue());
    const entlType = key.TableName;
    const uidEntitlement = key.Keys[0];
    await this.dynamicMethodSvc.delete(
      this.api.apiClient,
      `/portal/roles/config/entitlements/${this.roletype}/${id}/${entlType}/${uidEntitlement}`,
      {}
    );
  }

  public async getCollection(
    id: string,
    navigationState?: CollectionLoadParameters,
    objectKeyForFiltering?: string
  ): Promise<ExtendedTypedEntityCollection<TypedEntity, unknown>> {
    const api = new DynamicMethod(
      this.schemaPaths.get('get'),
      `/portal/roles/entitlements/${this.roletype}/${id}`,
      this.api.apiClient,
      this.session,
      this.translator
    );

    return await api.Get({
      ...navigationState,
      filter: objectKeyForFiltering
        ? [
            {
              ColumnName: 'ObjectKeyElement',
              CompareOp: CompareOperator.Equal,
              Type: FilterType.Compare,
              Value1: objectKeyForFiltering,
            },
          ]
        : undefined,
    });
  }

  public createEntitlementAssignmentEntity(role: IEntity, entlType: RoleAssignmentData): IEntity {
    const initialData = {};
    const uidRole = role.GetKeys()[0];
    initialData[entlType.RoleFk] = { Value: uidRole };
    const entityColl = this.dynamicMethodSvc.createEntity(
      this.api.apiClient,
      {
        path: '/portal/roles/config/entitlements/' + entlType.RoleTable + '/' + uidRole + '/' + entlType.TableName,
        type: GenericTypedEntity,
        schemaPath: 'portal/roles/config/entitlements/' + entlType.RoleTable + '/{' + entlType.RoleFk + '}/' + entlType.TableName,
      },
      {
        Columns: initialData,
      }
    );
    return entityColl.Data[0].GetEntity();
  }
}


