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

import { RoleComplianceViolation } from 'imx-api-cpl';
import { EntityColumnData, EntityData, TypedEntityBuilder, TypedEntityCollectionData } from 'imx-qbm-dbts';
import { RoleComplianceViolationTypedEntity } from './role-compliance-violation-typed-entity';

@Injectable({
  providedIn: 'root'
})
export class RoleComplianceViolationsWrapperService {

  public readonly roleComplianceEntitySchema = RoleComplianceViolationTypedEntity.GetEntitySchema();
  private readonly builder = new TypedEntityBuilder(RoleComplianceViolationTypedEntity);

  public build(data: RoleComplianceViolation[]): TypedEntityCollectionData<RoleComplianceViolationTypedEntity> {
    const violations = {
      TotalCount: data.length,
      Entities: data.map(elem => this.buildEntityData(elem))
    };
    return this.builder.buildReadWriteEntities(violations, this.roleComplianceEntitySchema);
  }

  private buildEntityData(data: RoleComplianceViolation): EntityData {
    const ret: { [key: string]: EntityColumnData } = {};
    ret.UID_ComplianceRule = { Value: data.UID_ComplianceRule, IsReadOnly: true };
    ret.RuleName = { Value: data.RuleName, IsReadOnly: true };
    ret.DbObjectKey = { Value: data.DbObjectKey, IsReadOnly: true };
    ret.ObjectDisplay = { Value: data.ObjectDisplay, IsReadOnly: true };
    ret.ObjectKeyElement = { Value: data.ObjectKeyElement, IsReadOnly: true };

    return { Columns: ret };
  }
}

