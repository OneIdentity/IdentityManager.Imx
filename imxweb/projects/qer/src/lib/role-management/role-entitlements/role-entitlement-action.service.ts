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

import { DbObjectKey, IEntity, TypedEntity, XOrigin } from 'imx-qbm-dbts';

import { imx_SessionService } from 'qbm';
import { QerApiService } from '../../qer-api-client.service';
import { DataManagementService } from '../data-management.service';
import { RoleService } from '../role.service';
import { SelectedEntitlement } from './entitlement-selector.component';
import { RoleRecommendationResultItem } from './role-recommendations/role-recommendation-result-item';

@Injectable({
  providedIn: 'root',
})
export class RoleEntitlementActionService {
  constructor(
    private readonly qerApiService: QerApiService,
    private readonly roleService: RoleService,
    private dataManagementService: DataManagementService,
    private readonly session: imx_SessionService
  ) {}

  /**
   * Creates requests for a list of entitlements
   * @param selectedEntities the list of entities including their type
   */
  public async processEntitlementSelections(selectedEntities: SelectedEntitlement[]): Promise<void> {
    const entity = this.dataManagementService.entityInteractive.GetEntity();
    for (const selectedEntity of selectedEntities) {
      await this.putSingleItemInShoppingCart(
        entity,
        selectedEntity.assignmentType.AssignTable,
        selectedEntity.entity.GetColumn('XObjectKey').GetValue()
      );
    }
  }

  /**
   * Deletes a list of entitlements
   * @param selectedEntities the lits of entitie, that should be deleted
   */
  public async deleteEntitlements(selectedEntities: TypedEntity[]): Promise<void> {
    const entity = this.dataManagementService.entityInteractive.GetEntity();
    for (const selectedEntity of selectedEntities) {
      await this.delete(entity, selectedEntity);
    }
  }

  /**
   * Creates requests for a list of recommended entitlements
   * @param entity the entity for the role
   * @param recommendations a list of recommended items, that should be added to the shopping card
   * @returns number of added elements
   */
  public async addRecommendation(entity: IEntity, recommendations: RoleRecommendationResultItem[]): Promise<number> {
    if (recommendations.length === 0) {
      return 0;
    }
    const entitlementTypes = await this.roleService.getEntitlementTypes(entity);
    let countAdd = 0;
    for (const recommendation of recommendations) {
      const assignTable = entitlementTypes.find(
        (elem) => elem.TableName === DbObjectKey.FromXml(recommendation.ObjectKey.value).TableName
      ).AssignTable;
      await this.putSingleItemInShoppingCart(entity, assignTable, recommendation.ObjectKey.value);
      countAdd = countAdd + 1;
    }
    return countAdd;
  }

  /**
   * Deletes a list of recommended entitlements
   * @param entity the entity for the role
   * @param recommendations a list of recommended items, that should be removed
   * @returns number of removed elements
   */
  public async deleteRecommendations(entity: IEntity, recommendations: RoleRecommendationResultItem[]): Promise<number> {
    if (recommendations.length === 0) {
      return 0;
    }
    let countRemove = 0;

    for (const recommendation of recommendations) {
      const items = (
        await this.roleService.getEntitlements({
          id: entity.GetKeys().join(','),
          navigationState: {},
          objectKey: recommendation.ObjectKey.value
        })
      ).Data;
      if (items.length > 0) {
        this.delete(entity, items[0]);
        countRemove = countRemove + 1;
      }
    }
    return countRemove;
  }

  private async delete(entity: IEntity, selectedEntity: TypedEntity): Promise<void> {
    if (this.isDirectAssignment(selectedEntity)) {
      await this.roleService.removeEntitlements(entity.GetKeys().join(','), selectedEntity.GetEntity());
    }

    if (this.isRequestCancellable(selectedEntity)) {
      await this.roleService.unsubscribe(selectedEntity);
    }
  }

  private isDirectAssignment(entity: TypedEntity): boolean {
    const xorigin = entity.GetEntity().GetColumn('XOrigin').GetValue() as XOrigin;
    // tslint:disable-next-line:no-bitwise
    return xorigin && XOrigin.Direct === (XOrigin.Direct & xorigin);
  }

  private isRequestCancellable(entity: TypedEntity): boolean {
    return true === entity.GetEntity().GetColumn('IsRequestCancellable')?.GetValue();
  }

  private async putSingleItemInShoppingCart(role: IEntity, assignTable: string, entitlementObjectKey: string): Promise<void> {
    const newCartItem = this.qerApiService.typedClient.PortalCartitem.createEntity();

    // i.e. "<Key><T>Org</T><P>4ee782c2-a518-42d3-8d38-73b0d287b7e6</P></Key>"
    newCartItem.RoleMembership.value = role.GetColumn('XObjectKey').GetValue();
    // i.e. "OrgHasADSGroup|<Key><T>ADSGroup</T><P>468fa7aa-26d8-4c81-8944-a00146014ece</P></Key>"
    newCartItem.EntitlementData.value = assignTable + '|' + entitlementObjectKey;

    newCartItem.UID_PersonOrdered.value = this.session.SessionState.UserUid;

    await newCartItem.GetEntity().Commit(false);
  }
}
