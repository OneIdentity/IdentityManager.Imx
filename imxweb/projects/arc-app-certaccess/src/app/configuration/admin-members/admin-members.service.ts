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
 * Copyright 2022 One Identity LLC.
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
import { EuiLoadingService } from '@elemental-ui/core';
import {
  CollectionLoadParameters,
  CompareOperator,
  EntityCollectionData,
  EntitySchema,
  FilterType,
  TypedEntityCollectionData,
} from 'imx-qbm-dbts';
import { PortalAdminApplicationrole, PortalAdminApplicationroleMembers } from 'imx-api-qer';
import { ISessionState } from 'qbm';
import { ArcApiService } from '../../services/arc-api-client.service';

@Injectable({
  providedIn: 'root'
})
export class AdminMembersService {
  constructor(private readonly apiClient: ArcApiService, private readonly loader: EuiLoadingService) { }

  public get adminApplicationRoleMembersSchema(): EntitySchema {
    return this.apiClient.typedClient.PortalAdminApplicationroleMembers.GetSchema();
  }
  public get adminApplicationRoleSchema(): EntitySchema {
    return this.apiClient.typedClient.PortalAdminApplicationrole.GetSchema();
  }

  public async userIsMember(uidAeRole: string, sessionState: ISessionState): Promise<boolean> {
    const userUid = sessionState?.IsLoggedIn ? sessionState.UserUid : undefined;
    return userUid && (await this.get(
      uidAeRole,
      {
        filter: [{
          ColumnName: PortalAdminApplicationroleMembers.GetEntitySchema().Columns.UID_Person.ColumnName,
          Type: FilterType.Compare,
          CompareOp: CompareOperator.Equal,
          Value1: userUid
        }]
      }
    ))?.Data?.length > 0;
  }

  public async getGroupInfo(
    uidAeRoles: string[], parameters: CollectionLoadParameters = {}
  ): Promise<TypedEntityCollectionData<PortalAdminApplicationrole>> {
    const groupInfo = {
      tableName: undefined,
      totalCount: 0,
      Data: []
    };

    const loaderRef = this.loader.show();
    try {
      for (const uidAeRole of uidAeRoles) {
        const collection = await this.apiClient.typedClient.PortalAdminApplicationrole.Get(uidAeRole, parameters);
        groupInfo.tableName = collection.tableName;
        groupInfo.totalCount += collection.totalCount;
        groupInfo.Data = groupInfo.Data.concat(collection.Data);
      }
    } finally {
      this.loader.hide(loaderRef);
    }

    return groupInfo;
  }

  public async get(
    uidAeRole: string, parameters: CollectionLoadParameters = {}
  ): Promise<TypedEntityCollectionData<PortalAdminApplicationroleMembers>> {
    return this.handlePromiseLoader(this.apiClient.typedClient.PortalAdminApplicationroleMembers.Get(uidAeRole, parameters));
  }

  public async add(uidAeRole: string, uidPersons: string[]): Promise<TypedEntityCollectionData<PortalAdminApplicationroleMembers>[]> {
    return this.handlePromiseLoader(
      Promise.all(uidPersons.map(async uidPerson => {
        const member = this.createNew(uidAeRole);
        await member.UID_Person.Column.PutValue(uidPerson);
        return this.apiClient.typedClient.PortalAdminApplicationroleMembers.Post(uidAeRole, member);
      }))
    );
  }

  public async delete(uidAeRole: string, members: PortalAdminApplicationroleMembers[]): Promise<EntityCollectionData[]> {
    return this.handlePromiseLoader(
      Promise.all(
        members.map(member => this.apiClient.client.portal_admin_applicationrole_members_delete(uidAeRole, member.UID_Person.value))
      )
    );
  }

  public createNew(uidAeRole: string): PortalAdminApplicationroleMembers {
    return this.apiClient.typedClient.PortalAdminApplicationroleMembers.createEntity({
      Columns: {
        UID_AERole: {
          Value: uidAeRole
        }
      }
    });
  }

  private async handlePromiseLoader<T>(promise: Promise<T>): Promise<T> {
    const loaderRef = this.loader.show();
    return promise.finally(() => this.loader.hide(loaderRef));
  }
}
