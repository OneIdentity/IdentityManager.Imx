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

import { OverlayRef } from '@angular/cdk/overlay';
import { Injectable } from '@angular/core';
import { EuiLoadingService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';

import { PortalRolesExclusions, PortalShopConfigMembers, PortalShopConfigStructure } from 'imx-api-qer';
import {
  CollectionLoadParameters,
  CompareOperator,
  EntityCollectionData,
  EntitySchema,
  FilterType,
  TypedEntityCollectionData,
} from 'imx-qbm-dbts';
import { ClassloggerService, SnackBarService } from 'qbm';
import { QerApiService } from '../qer-api-client.service';
import { IRequestableEntitlementType } from './irequestable-entitlement-type';

export const ACTION_DISMISS = '#LDS#Close';

export interface SelectedShopStructureData {
  selectedShop?: PortalShopConfigStructure;
  hasMembers?: boolean;
  hasShelves?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class RequestsService {
  public shelvesBlockedDeleteStatus: { [shelfId: string]: boolean } = {};
  private busyIndicator: OverlayRef;

  constructor(
    private readonly qerApiClient: QerApiService,
    private readonly logger: ClassloggerService,
    private readonly snackbar: SnackBarService,
    private readonly translate: TranslateService,
    private readonly busyService: EuiLoadingService
  ) {}

  public selectedEntitlementType: IRequestableEntitlementType;

  public get shopStructureSchema(): EntitySchema {
    return this.qerApiClient.typedClient.PortalShopConfigStructure.GetSchema();
  }

  public get shopConfigMembersSchema(): EntitySchema {
    return this.qerApiClient.typedClient.PortalShopConfigMembers.GetSchema();
  }

  public get shopConfigExcludedMembersSchema(): EntitySchema {
    return this.qerApiClient.typedClient.PortalRolesExclusions.GetSchema();
  }

  public async getShopStructures(
    navigationState: CollectionLoadParameters,
    parentId: string = ''
  ): Promise<TypedEntityCollectionData<PortalShopConfigStructure>> {
    let params: any = navigationState;
    if (!params) {
      params = {};
    }
    if (parentId == '') {
      params.filter = [
        {
          ColumnName: 'ITShopInfo',
          CompareOp: CompareOperator.Equal,
          Type: FilterType.Compare,
          Value1: 'SH',
        },
      ];
    }
    params.ParentKey = parentId;
    this.logger.debug(this, `Retrieving shop config structures`);
    this.logger.trace('Navigation state', navigationState);
    return this.qerApiClient.typedClient.PortalShopConfigStructure.Get(params);
  }

  public createRequestConfigEntity(): PortalShopConfigStructure {
    return this.qerApiClient.typedClient.PortalShopConfigStructure.createEntity();
  }

  public createNewRequestConfig(newRequest: PortalShopConfigStructure): Promise<TypedEntityCollectionData<PortalShopConfigStructure>> {
    return this.qerApiClient.typedClient.PortalShopConfigStructure.Post(newRequest);
  }

  public deleteRequestConfiguration(id: string): Promise<EntityCollectionData> {
    return this.qerApiClient.client.portal_shop_config_structure_delete(id);
  }

  public getRequestConfigMembers(
    customerNodeId: string,
    navigationState: CollectionLoadParameters
  ): Promise<TypedEntityCollectionData<PortalShopConfigMembers>> {
    return this.qerApiClient.typedClient.PortalShopConfigMembers.Get(customerNodeId, navigationState);
  }

  public generateRequestConfigMemberEntity(customerNodeId: string): PortalShopConfigMembers {
    return this.qerApiClient.typedClient.PortalShopConfigMembers.createEntity({
      Columns: {
        UID_ITShopOrg: {
          Value: customerNodeId,
        },
      },
    });
  }

  public createRequestConfigMember(
    customerNodeId: string,
    newMember: PortalShopConfigMembers
  ): Promise<TypedEntityCollectionData<PortalShopConfigMembers>> {
    return this.qerApiClient.typedClient.PortalShopConfigMembers.Post(customerNodeId, newMember);
  }

  public addMultipleRequestConfigMembers(values: string[], customerNodeId: string): Promise<any> {
    const promises = [];
    values.forEach((value) => {
      const entity = this.qerApiClient.typedClient.PortalShopConfigMembers.createEntity();
      entity.UID_Person.value = value;
      promises.push(this.createRequestConfigMember(customerNodeId, entity));
    });
    return Promise.all(promises);
  }

  public removeRequestConfigMembers(
    customerNodeId: string,
    uidDynamicGroup: string,
    members: PortalShopConfigMembers[],
    description?: string
  ): Promise<any> {
    const promises = [];
    members.forEach((member) => {
      // If the member is managed by a dynamic group, add an exclusion
      // tslint:disable-next-line:no-bitwise
      if ((member.XOrigin?.value & 4) > 0) {
        const exclusionData = this.qerApiClient.typedClient.PortalRolesExclusions.createEntity();
        exclusionData.UID_Person.value = member.UID_Person.value;
        exclusionData.Description.value = description || '';
        promises.push(this.addDynamicRoleExclusion(uidDynamicGroup, exclusionData));
      } else {
        // Otherwise just a regular delete
        promises.push(this.qerApiClient.client.portal_shop_config_members_delete(customerNodeId, member.UID_Person.value));
      }
    });
    return Promise.all(promises);
  }

  public removeRequestConfigMemberExclusions(uidDynamicGroup: string, exclusions: PortalRolesExclusions[]): Promise<any> {
    const promises = [];
    exclusions.forEach((exclusion) => {
      const memberUid = exclusion.UID_Person?.value;
      promises.push(this.removeDynamicRoleExclusion(uidDynamicGroup, memberUid));
    });
    return Promise.all(promises);
  }

  public getExcludedRequestConfigMembers(uidDynamicGroup: string, navigationState: CollectionLoadParameters): Promise<any> {
    return this.qerApiClient.typedClient.PortalRolesExclusions.Get(uidDynamicGroup, navigationState);
  }

  public async addDynamicRoleExclusion(uidDynamicGroup: string, exclusionData: PortalRolesExclusions): Promise<any> {
    this.qerApiClient.typedClient.PortalRolesExclusions.Post(uidDynamicGroup, exclusionData);
  }

  public async removeDynamicRoleExclusion(uidDynamicGroup: string, uidPerson: string): Promise<any> {
    this.qerApiClient.client.portal_roles_exclusions_delete(uidDynamicGroup, uidPerson);
  }

  /**
   * Tracks a timeout of 1.5 minutes where the given shelf is blocked from being deleted
   * to allow enough time for the API to process the removal of system entitlements from the shelf
   */
  public manageShelfDeleteStatus(shelfId: string): void {
    this.shelvesBlockedDeleteStatus[shelfId] = true;
    setTimeout(() => {
      this.shelvesBlockedDeleteStatus[shelfId] = false;
    }, 90000);
  }

  public openSnackbar(message: string, action: string): void {
    this.snackbar.open({ key: message }, action);
  }

  public handleOpenLoader(): void {
    if (!this.busyIndicator) {
      this.busyIndicator = this.busyService.show();
    }
  }

  public handleCloseLoader(): void {
    if (this.busyIndicator) {
      setTimeout(() => {
        this.busyService.hide(this.busyIndicator);
        this.busyIndicator = undefined;
      });
    }
  }

  public LdsSpecifyMembers = '#LDS#Here you can specify who can request the products assigned to the shop.';

  public LdsMembersByDynamicRole =
    '#LDS#Here you can see the members that are originally assigned to the shop by a dynamic role but have been excluded. Additionally, you can add these excluded members back to the shop by removing the exclusion.';

  public LdsMembersRemoved =
    '#LDS#The members have been successfully removed from the shop. It may take some time for the changes to take effect.';

  public LdsMembersAdded =
    '#LDS#The members have been successfully added to the shop. It may take some time for the changes to take effect.';

  public LdsMembersUpdated = '#LDS#The shop members have been successfully updated.';

  public LdsDeleteShop = '#LDS#Delete shop';

  public LdsShopHasBeenDeleted = '#LDS#The shop has been successfully deleted.';

  public LdsShopHasBeenCreated = '#LDS#The shop has been successfully created.';

  public LdsShopHasBeenSaved = '#LDS#The shop has been successfully saved.';

  public LdsNoShops = '#LDS#There are currently no shops.';

  public LdsNoMatchingShops = '#LDS#There are no shops matching your search.';

  public LdsHeadingCreateShop = '#LDS#Heading Create Shop';

  public LdsHeadingEditShop = '#LDS#Heading Edit Shop';

  public LdsHeadingShops = '#LDS#Heading Shops';

  public LdsShopExplanation =
    '#LDS#A shop is the top element in the hierarchical structure required for requesting products. Here you can setup and manage shops. For each shop you can specify which products can be requested (through shelves) and who can request them.';

  public LdsCreateShop = '#LDS#Create shop';
}
