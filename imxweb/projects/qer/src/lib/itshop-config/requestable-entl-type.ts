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

import { ApiClient, EntitySchema, TypedEntity } from "imx-qbm-dbts";
import { DynamicMethodService, GenericTypedEntity } from "qbm";
import { IRequestableEntitlementType } from "./irequestable-entitlement-type";

export class RequestableEntitlementType implements IRequestableEntitlementType {

  constructor(private readonly tableName: string,
    private readonly apiClient: ApiClient,
    private readonly fkColumnName: string,
    private readonly dynamicMethodService: DynamicMethodService
  ) {
    this.schema = this.createAssignmentEntity('dummy').GetEntity().GetSchema();
  }

  getTableName() {
    return this.tableName;
  }

  getFkColumnName() {
    return this.fkColumnName;
  }

  private schema: EntitySchema;

  getSchema() {
    return this.schema;
  }

  public addEntitlementSelections(shelfId: string, values: string[]): Promise<any> {
    const promises = [];
    values.forEach(value => {
      const e = this.createAssignmentEntity(shelfId).GetEntity();
      promises.push(e.GetColumn(this.fkColumnName).PutValue(value)
        .then(() => e.Commit()));
    });
    return Promise.all(promises);
  }

  public createAssignmentEntity(shelfId: string): TypedEntity {
    const entityColl = this.dynamicMethodService.createEntity(this.apiClient, {
      path: '/portal/shop/config/entitlements/' + shelfId + '/' + this.tableName,
      type: GenericTypedEntity,
      schemaPath: 'portal/shop/config/entitlements/{UID_ITShopOrg}/' + this.tableName,
    }, {
      Columns: {
        "UID_ITShopOrg": {
          Value: shelfId
        }
      }
    });
    return entityColl.Data[0];
  }
}