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

import { TypedEntity, CollectionLoadParameters, ExtendedTypedEntityCollection, EntitySchema, EntityData } from "imx-qbm-dbts";
import { IRequestableEntitlementType } from "./irequestable-entitlement-type";

export class ResourceEntitlementType implements IRequestableEntitlementType {

  constructor(private readonly resourceType: string,
    private type: {
      GetSchema(): EntitySchema;
      createEntity(initialData?: EntityData): TypedEntity;
      Get(shelfUid: string, navigationState: CollectionLoadParameters): Promise<ExtendedTypedEntityCollection<any, unknown>>;
      Post(shelfId: string, entitlement: TypedEntity): Promise<any>;
    }) { }

  getFkColumnName(): string {
    return "UID_" + this.getTableName();
  }

  public addEntitlementSelections(shelfId: string, values: string[]): Promise<any> {
    const promises = [];
    values.forEach((value) => {
      const entitlement = this.type.createEntity();
      entitlement.GetEntity().GetColumn("UID_" + this.resourceType).PutValue(value);
      promises.push(this.type.Post(shelfId, entitlement));
    });
    return Promise.all(promises);
  }

  public getTableName(): string { return this.resourceType };

  public createAssignmentEntity(shelfId: string): TypedEntity {
    const e = this.type.createEntity({
      Columns: {
        "UID_ITShopOrg": { Value: shelfId }
      }
    });
    return e;
  }

  getSchema(): EntitySchema {
    return this.type.GetSchema();
  }

}