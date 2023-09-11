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

import { DbObjectKey, EntityCollectionData, EntityData, TypedEntityBuilder, TypedEntityCollectionData } from 'imx-qbm-dbts';
import { SapComplianceByAbilityEntity } from './sap-compliance-violation-views-by-ability-entity';
import { SAPUserFunctionSrcFLD } from 'imx-api-sac';

export class SapComplianceByAbilityBuilder {
  public readonly entitySchema = SapComplianceByAbilityEntity.GetEntitySchema();

  private readonly builder = new TypedEntityBuilder(SapComplianceByAbilityEntity);

  public build(entityCollectionData: EntityCollectionData): TypedEntityCollectionData<SapComplianceByAbilityEntity> {
    return this.builder.buildReadWriteEntities(entityCollectionData, this.entitySchema);
  }

  public buildEntityCollectionData(items: SAPUserFunctionSrcFLD[]): EntityCollectionData {
    const entities = items.map((elem) => this.buildEntityData(elem));
    return { Entities: entities, TotalCount: items.length };
  }

  public buildEntityData(item: SAPUserFunctionSrcFLD): EntityData {
    return {
      Columns: {
        Ident_SAPProfile: { Value: item.Ident_SAPProfile },
        Ident_SAPAuthObject: { Value: item.Ident_SAPAuthObject },
        Ident_SAPField: { Value: item.Ident_SAPField },
        LowerLimit: { Value: item.LowerLimit },
        UpperLimit: { Value: item.UpperLimit },
        DisplaySapFunctionInstance: { Value: item.DisplaySapFunctionInstance },
        DisplaySapTransaction: { Value: item.DisplaySapTransaction },
        UID_SAPFunctionInstance: { Value: item.UID_SAPFunctionInstance },
      },
      Keys: [
        'Ident_SAPProfile',
        'Ident_SAPAuthObject',
        'Ident_SAPField',
        'LowerLimit',
        'UpperLimit',
        'DisplaySapFunctionInstance',
        'DisplaySapTransaction',
        'UID_SAPFunctionInstance',
      ],
    };
  }
}
