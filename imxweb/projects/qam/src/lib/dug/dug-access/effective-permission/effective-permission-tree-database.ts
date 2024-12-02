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

import { TreeDatabase, TreeNodeResultParameter } from 'qbm';
import { TrusteeEntityHierarchy } from './trustee-entity-hierarchy';
import { CollectionLoadParameters, IEntity } from '@imx-modules/imx-qbm-dbts';

export class EffectivePermissionTreeDatabase extends TreeDatabase {
  public constructor(private entities: TrusteeEntityHierarchy[]) {
    super();
    this.entities.forEach((entity) => (entity.HasChildren.value = this.entities.some((ent) => ent.Parent.value === entity.Display.value)));
  }

  public async getData(showLoading: boolean, parameters: CollectionLoadParameters = {}): Promise<TreeNodeResultParameter> {

    const entities = this.entities.filter(element => element.Parent.value === parameters.ParentKey)
    return {
      entities: entities.map((element) => element.GetEntity()),
      canLoadMore: false,
      totalCount: entities.length,
    };
  }

  public getId(entity: IEntity): string {
    return entity.GetColumn('Display')?.GetValue() ?? '';
  }


}
