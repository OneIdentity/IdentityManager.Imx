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

import { DbObjectKey, FkCandidateBuilder, FkCandidateRouteDto, ValType } from 'imx-qbm-dbts';
import { MergeActionList, MergeActions, RoleCompareItems, UiActionResultData } from 'imx-api-qer';
import { BaseCdr, ColumnDependentReference, EntityService } from 'qbm';
import { QerApiService } from '../../qer-api-client.service';

@Injectable({
  providedIn: 'root',
})
export class CompareService {
  constructor(private readonly apiService: QerApiService, private readonly entityService: EntityService) {}

  public async mergeRoles(roleType: string, uidRole: string, key: DbObjectKey, actions: MergeActionList): Promise<UiActionResultData[]> {
    return this.apiService.v2Client.portal_roles_merge_post(roleType, uidRole, key.TableName, key.Keys[0], actions);
  }

  public async getCompares(roleType: string, uidRole: string, key: DbObjectKey): Promise<RoleCompareItems> {
    return this.apiService.v2Client.portal_roles_compare_get(roleType, uidRole, key.TableName, key.Keys[0]);
  }

  public async getMergeActions(roleType: string, uidRole: string, key: DbObjectKey): Promise<MergeActions> {
    return this.apiService.v2Client.portal_roles_merge_get(roleType, uidRole, key.TableName, key.Keys[0]);
  }

  public createCdrRole(candidateRoutes: FkCandidateRouteDto[]): ColumnDependentReference {
    const fkProviderItems = new FkCandidateBuilder(candidateRoutes, this.apiService.apiClient).build();

    return new BaseCdr(
      this.entityService.createLocalEntityColumn(
        {
          ColumnName: 'uidcomparerole',
          Type: ValType.String,
          ValidReferencedTables: candidateRoutes.map((r) => {
            return { TableName: r.FkParentTableName };
          }),
          MinLen: 1,
        },
        fkProviderItems
      ),
      '#LDS#Comparison object'
    );
  }
}
