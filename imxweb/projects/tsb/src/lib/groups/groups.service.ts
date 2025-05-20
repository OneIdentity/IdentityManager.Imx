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

import { Injectable } from '@angular/core';
import {
  EntityWriteDataBulk,
  PortalRespUnsgroup,
  PortalTargetsystemUnsDirectmembers,
  PortalTargetsystemUnsGroup,
  PortalTargetsystemUnsGroupServiceitem,
  PortalTargetsystemUnsGroupmembers,
  PortalTargetsystemUnsNestedmembers,
  V2ApiClientMethodFactory,
} from '@imx-modules/imx-api-tsb';
import {
  CollectionLoadParameters,
  CompareOperator,
  DataModel,
  DataModelFilter,
  EntityCollectionData,
  EntitySchema,
  FilterData,
  FilterTreeData,
  FilterType,
  MethodDefinition,
  MethodDescriptor,
  TypedEntityCollectionData,
} from '@imx-modules/imx-qbm-dbts';
import { ClassloggerService, DataSourceToolbarExportMethod } from 'qbm';
import { DbObjectKeyBase } from '../target-system/db-object-key-wrapper.interface';
import { TargetSystemDynamicMethodService } from '../target-system/target-system-dynamic-method.service';
import { TsbApiService } from '../tsb-api-client.service';
import { GroupTypedEntity } from './group-typed-entity';
import { GetGroupsOptionalParameters, GroupsFilterTreeParameters } from './groups.models';

@Injectable({ providedIn: 'root' })
export class GroupsService {
  constructor(
    private readonly tsbClient: TsbApiService,
    private readonly logger: ClassloggerService,
    private readonly dynamicMethod: TargetSystemDynamicMethodService,
  ) {}

  public unsGroupsSchema(isAdmin: boolean): EntitySchema {
    return isAdmin
      ? this.tsbClient.typedClient.PortalTargetsystemUnsGroup.GetSchema()
      : this.tsbClient.typedClient.PortalRespUnsgroup.GetSchema();
  }

  public get UnsGroupMembersSchema(): EntitySchema {
    return this.tsbClient.typedClient.PortalTargetsystemUnsGroupmembers.GetSchema();
  }

  public get UnsGroupDirectMembersSchema(): EntitySchema {
    return this.tsbClient.typedClient.PortalTargetsystemUnsDirectmembers.GetSchema();
  }

  public get UnsGroupNestedMembersSchema(): EntitySchema {
    return this.tsbClient.typedClient.PortalTargetsystemUnsNestedmembers.GetSchema();
  }

  public async getFilterTree(options: GroupsFilterTreeParameters): Promise<FilterTreeData> {
    return this.tsbClient.client.portal_targetsystem_uns_group_filtertree_get(options);
  }

  public async getGroups(
    navigationState: GetGroupsOptionalParameters,
    signal: AbortSignal,
  ): Promise<TypedEntityCollectionData<PortalTargetsystemUnsGroup>> {
    return this.tsbClient.typedClient.PortalTargetsystemUnsGroup.Get(navigationState, { signal });
  }

  public exportGroups(): DataSourceToolbarExportMethod {
    const factory = new V2ApiClientMethodFactory();
    return {
      getMethod: (withProperties: string, navigationState: GetGroupsOptionalParameters, PageSize?: number) => {
        let method: MethodDescriptor<EntityCollectionData>;
        if (PageSize) {
          method = factory.portal_targetsystem_uns_group_get({ ...navigationState, withProperties, PageSize, StartIndex: 0 });
        } else {
          method = factory.portal_targetsystem_uns_group_get({ ...navigationState, withProperties });
        }
        return new MethodDefinition(method);
      },
    };
  }

  public async getGroupsResp(
    navigationState: GetGroupsOptionalParameters,
    signal: AbortSignal,
  ): Promise<TypedEntityCollectionData<PortalRespUnsgroup>> {
    return this.tsbClient.typedClient.PortalRespUnsgroup.Get(navigationState, { signal });
  }

  public exportGroupsResp(): DataSourceToolbarExportMethod {
    const factory = new V2ApiClientMethodFactory();
    return {
      getMethod: (withProperties: string, navigationState: GetGroupsOptionalParameters, PageSize?: number) => {
        let method: MethodDescriptor<EntityCollectionData>;
        if (PageSize) {
          method = factory.portal_resp_unsgroup_get({ ...navigationState, withProperties, PageSize, StartIndex: 0 });
        } else {
          method = factory.portal_resp_unsgroup_get({ ...navigationState, withProperties });
        }
        return new MethodDefinition(method);
      },
    };
  }

  public async getGroupDetails(dbObjectKey: DbObjectKeyBase): Promise<GroupTypedEntity> {
    return this.dynamicMethod.get(GroupTypedEntity, { dbObjectKey });
  }

  public async getGroupDetailsInteractive(dbObjectKey: DbObjectKeyBase, columnName: string): Promise<GroupTypedEntity> {
    return (await this.dynamicMethod.getById(GroupTypedEntity, { dbObjectKey, columnName })) as GroupTypedEntity;
  }

  public async getGroupServiceItem(key: string): Promise<PortalTargetsystemUnsGroupServiceitem> {
    const filter: FilterData[] = [];
    filter.push({
      ColumnName: 'UID_AccProduct',
      Type: FilterType.Compare,
      CompareOp: CompareOperator.Equal,
      Value1: key,
    });
    return (await this.tsbClient.typedClient.PortalTargetsystemUnsGroupServiceitem.Get({ filter })).Data[0];
  }

  public async bulkUpdateGroupServiceItems(updateData: EntityWriteDataBulk): Promise<void> {
    return this.tsbClient.client.portal_targetsystem_uns_group_serviceitem_bulk_put(updateData);
  }

  public async getGroupDirectMembers(
    groupId: string,
    navigationState: CollectionLoadParameters,
    signal?: AbortSignal,
  ): Promise<TypedEntityCollectionData<PortalTargetsystemUnsDirectmembers>> {
    this.logger.debug(this, `Retrieving group direct memberships`);
    this.logger.trace('GroupId', groupId);
    return this.tsbClient.typedClient.PortalTargetsystemUnsDirectmembers.Get(groupId, navigationState, { signal });
  }

  public async getGroupNestedMembers(
    groupId: string,
    navigationState: CollectionLoadParameters,
    signal?: AbortSignal,
  ): Promise<TypedEntityCollectionData<PortalTargetsystemUnsNestedmembers>> {
    this.logger.debug(this, `Retrieving group nested memberships`);
    this.logger.trace('GroupId', groupId);
    return this.tsbClient.typedClient.PortalTargetsystemUnsNestedmembers.Get(groupId, navigationState, { signal });
  }

  public async deleteGroupMembers(dbObjectKey: DbObjectKeyBase, uidAccountList: string[]): Promise<any[]> {
    this.logger.debug(this, `Deleting group memberships`);
    this.logger.trace(this, 'AccountId', JSON.stringify(uidAccountList));

    // TODO: change to bulk when API supports it

    const groupId = dbObjectKey.Keys[0];

    return Promise.all(
      uidAccountList.map((accountId) =>
        this.dynamicMethod.delete(dbObjectKey.TableName, {
          path: '{groupId}/memberships/{accountId}',
          parameters: { groupId, accountId },
        }),
      ),
    );
  }

  public async getGroupsGroupMembers(
    groupId: string,
    navigationState: CollectionLoadParameters,
  ): Promise<TypedEntityCollectionData<PortalTargetsystemUnsGroupmembers>> {
    this.logger.debug(this, `Retrieving groups group memberships`);
    this.logger.trace('GroupId', groupId);
    return this.tsbClient.typedClient.PortalTargetsystemUnsGroupmembers.Get(groupId, navigationState);
  }

  /** @deprecated Will be removed. Please load the data model first.*/
  public async getFilterOptions(forAdmin: boolean): Promise<DataModelFilter[]> {
    const filters = forAdmin
      ? (await this.tsbClient.client.portal_targetsystem_uns_group_datamodel_get(undefined)).Filters
      : (await this.tsbClient.client.portal_resp_unsgroup_datamodel_get(undefined)).Filters;
    return filters ?? [];
  }

  public async getDataModel(forAdmin: boolean): Promise<DataModel> {
    return forAdmin
      ? this.tsbClient.client.portal_targetsystem_uns_group_datamodel_get(undefined)
      : this.tsbClient.client.portal_resp_unsgroup_datamodel_get(undefined);
  }

  public async updateMultipleOwner(uidAccProducts: string[], uidPerson: { uidPerson?: string; uidRole?: string }): Promise<string> {
    let confirmMessage = '#LDS#The product owner has been successfully assigned.';
    try {
      for (const data of uidAccProducts) {
        const product = await this.getGroupServiceItem(data);
        if (uidPerson.uidPerson) {
          product.extendedData = {
            UidPerson: uidPerson.uidPerson,
            CopyAllMembers: true,
          };
          confirmMessage = '#LDS#The product owner has been successfully assigned. It may take some time for the changes to take effect.';
        }
        if (uidPerson.uidRole) {
          product.UID_OrgRuler.value = uidPerson.uidRole;
        }
        await product.GetEntity().Commit(true);
      }
    } catch (exception) {
      confirmMessage = '';
      throw exception;
    }
    return confirmMessage;
  }
}
