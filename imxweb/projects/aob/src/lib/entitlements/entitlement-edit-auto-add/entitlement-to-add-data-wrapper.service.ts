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

import { Injectable } from '@angular/core';

import { EntitlementData, EntitlementToAddData } from 'imx-api-aob';
import {
  EntityColumnData,
  EntityData,
  TypedEntityBuilder,
  TypedEntityCollectionData
} from 'imx-qbm-dbts';
import { EntitlementToAddTyped } from './entitlement-to-add-typed';

@Injectable({
  providedIn: 'root'
})
export class EntitlementToAddDataWrapperService {

  public readonly entitySchema = EntitlementToAddTyped.GetEntitySchema();
  private readonly builder = new TypedEntityBuilder(EntitlementToAddTyped);

  public buildTypedEntities(data: EntitlementToAddData): TypedEntityCollectionData<EntitlementToAddTyped> {
    const entities = data.Data.map((element, index) => this.buildEntityData(element, `${index}`));
    return this.builder.buildReadWriteEntities(
      {
        TotalCount: entities.length,
        Entities: entities.sort((a, b) => this.compareElement(a, b))
      },
      this.entitySchema);
  }

  private buildEntityData(data: EntitlementData, key: string): EntityData {
    const ret: { [key: string]: EntityColumnData } = {};

    ret.IsAssignedToMe = { Value: data.IsAssignedToMe, IsReadOnly: true };
    ret.IsAssignedToOther = { Value: data.IsAssignedToOther, IsReadOnly: true };
    ret.DisplayName = { Value: data.DisplayName, IsReadOnly: true };
    ret.CanonicalName = { Value: data.CanonicalName, IsReadOnly: true };
    ret.UID_AOBApplicationConflicted =
    {
      Value: data.UID_AOBApplicationConflicted,
      IsReadOnly: true,
      DisplayValue: data.DisplayApplicationConflicted
    };
    return { Columns: ret, Keys: [key] };
  }

  private compareElement(a: EntityData, b: EntityData): number {
    const val1 = `${(a.Columns.IsAssignedToMe.Value ? 1 : a.Columns.IsAssignedToOther.Value ? 0 : 2)} ${a.Columns.DisplayName.Value}`;
    const val2 = `${(b.Columns.IsAssignedToMe.Value ? 1 : b.Columns.IsAssignedToOther.Value ? 0 : 2)} ${b.Columns.DisplayName.Value}`;
    return val1.localeCompare(val2);
  }
}
