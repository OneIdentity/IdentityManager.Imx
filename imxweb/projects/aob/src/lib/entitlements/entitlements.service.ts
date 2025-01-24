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

import { Injectable, ErrorHandler } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { CollectionLoadParameters, TypedEntityCollectionData, IWriteValue, FilterType, CompareOperator, EntitySchema, TypedEntity, DataModel, ExtendedTypedEntityCollection, FilterData, FilterTreeData } from 'imx-qbm-dbts';
import { DataTileBadge, ApiClientService, ClassloggerService } from 'qbm';
import {
  PortalEntitlement,
  PortalApplication,
  EntitlementSystemRoleInput,
  portal_entitlementcandidates_UNSGroup_filtertree_get_args,
} from 'imx-api-aob';
import { EntitlementFilter } from './entitlement-filter';
import { AobApiService } from '../aob-api-client.service';
import { EntitlementsType } from './entitlements.model';

@Injectable({
  providedIn: 'root'
})
export class EntitlementsService {
  private readonly filter = new EntitlementFilter();
  private badgePublished: DataTileBadge;
  private badgeWillPublish: DataTileBadge;

  constructor(
    private readonly aobClient: AobApiService,
    private readonly apiProvider: ApiClientService,
    private readonly logger: ClassloggerService,
    private readonly errorHandler: ErrorHandler,
    translate: TranslateService) {
    translate.get('#LDS#Published').subscribe((value: string) => this.badgePublished = {
      content: value,
      color: '#618f3e'
    });

    translate.get('#LDS#Will be published').subscribe((value: string) => this.badgeWillPublish = {
      content: value,
      color: '#f4770b'
    });
  }

  public get entitlementSchema(): EntitySchema {
    return this.aobClient.typedClient.PortalEntitlement.GetSchema();
  }

  public async get(parameters: CollectionLoadParameters = {}): Promise<TypedEntityCollectionData<PortalEntitlement>> {
    return this.apiProvider.request(() => this.aobClient.typedClient.PortalEntitlement.Get(parameters));
  }

  public async getInteractive(uid: string): Promise<TypedEntityCollectionData<PortalEntitlement>> {
    return this.apiProvider.request(() => this.aobClient.typedClient.PortalEntitlementInteractive.Get_byid(uid));
  }

  public async addElementsToRole(entitlementSystemRoleInput: EntitlementSystemRoleInput): Promise<void> {
    return this.apiProvider.request(() => this.aobClient.client.portal_entitlement_systemrole_post(entitlementSystemRoleInput));
  }

  public candidateSchema(type: EntitlementsType): EntitySchema {
    switch (type) {
      case EntitlementsType.Eset:
        return this.aobClient.typedClient.PortalEntitlementcandidatesEset.GetSchema();
      case EntitlementsType.Qerresource:
        return this.aobClient.typedClient.PortalEntitlementcandidatesQerresource.GetSchema();
      case EntitlementsType.Rpsreport:
        return this.aobClient.typedClient.PortalEntitlementcandidatesRpsreport.GetSchema();
      case EntitlementsType.Tsbaccountdef:
        return this.aobClient.typedClient.PortalEntitlementcandidatesTsbaccountdef.GetSchema();
      case EntitlementsType.UnsGroup:
        return this.aobClient.typedClient.PortalEntitlementcandidatesUnsgroup.GetSchema();
      default:
        throw new Error(`Type ${0} not supported`);
    }
  }


  public async getCandidates(type: EntitlementsType, parameters: CollectionLoadParameters = {}):
    Promise<TypedEntityCollectionData<TypedEntity>> {
    switch (type) {
      case EntitlementsType.Eset:
        return this.apiProvider.request(() => this.aobClient.typedClient.PortalEntitlementcandidatesEset.Get(parameters));
      case EntitlementsType.Qerresource:
        return this.apiProvider.request(() => this.aobClient.typedClient.PortalEntitlementcandidatesQerresource.Get(parameters));
      case EntitlementsType.Rpsreport:
        return this.apiProvider.request(() => this.aobClient.typedClient.PortalEntitlementcandidatesRpsreport.Get(parameters));
      case EntitlementsType.Tsbaccountdef:
        return this.apiProvider.request(() => this.aobClient.typedClient.PortalEntitlementcandidatesTsbaccountdef.Get(parameters));
      case EntitlementsType.UnsGroup:
        return this.apiProvider.request(() => this.aobClient.typedClient.PortalEntitlementcandidatesUnsgroup.Get(parameters));
      default:
        throw new Error(`Type ${0} not supported`);
    }
  }

  public async getDataModel(type: EntitlementsType): Promise<DataModel> {
    if (type === EntitlementsType.UnsGroup) {
      return this.aobClient.client.portal_entitlementcandidates_UNSGroup_datamodel_get(undefined);
    }
    return undefined;
  }



  public async getEntitlementsForApplication(application: PortalApplication, collectionLoadParameters: CollectionLoadParameters = {}):
    Promise<TypedEntityCollectionData<PortalEntitlement>> {

    const filter =[...collectionLoadParameters.filter ?? [],
    {
      ColumnName: 'UID_AOBApplication',
      Type: FilterType.Compare,
      CompareOp: CompareOperator.Equal,
      Value1: application.UID_AOBApplication.value
    }];

    return this.get({
      ...collectionLoadParameters,
      ...{
        filter
      }
    });
  }

  public async reload(entitlement: PortalEntitlement): Promise<PortalEntitlement> {
    const collection = await this.getInteractive(entitlement.UID_AOBEntitlement.value);

    return collection && collection.Data && collection.Data.length > 0 ? collection.Data[0] : undefined;
  }

  public async assign(
    application: PortalApplication,
    candidates: TypedEntity[]
  ): Promise<number> {
    let assignCount = 0;

    for (const candidate of candidates) {
      this.logger.debug(this, 'try to assign a new entitlement to application', application.UID_AOBApplication);
      const entitlement = await this.createNew(candidate, application.UID_AOBApplication);
      this.logger.info(this, 'try to assign a new entitlement to application', application.UID_AOBApplication);

      if (await this.tryCommit(entitlement)) {
        this.logger.info(this, 'The entitlement was assigned to application', application.UID_AOBApplication);
        assignCount++;
      }
    }

    return assignCount;
  }

  public async unassign(entitlements: PortalEntitlement[]): Promise<any> {
    return this.apiProvider.request(async () => {
      let result = null;
      for (const entitlement of entitlements) {
        result = await this.aobClient.client.portal_entitlement_delete(entitlement.UID_AOBEntitlement.value);
      }
      return result;
    });
  }

  public async publish(entitlements: PortalEntitlement[], publishData: { publishFuture: boolean, date: Date }): Promise<number> {
    let publishCount = 0;

    for (const entitlement of entitlements) {
      const interactive = (await this.aobClient.typedClient.PortalEntitlementInteractive.Get_byid(entitlement.GetEntity().GetKeys()[0])).Data[0];
      if (!publishData.publishFuture) {
       await interactive.IsInActive.Column.PutValue(publishData.publishFuture);
      } else {
       await interactive.ActivationDate.Column.PutValue(publishData.date);
      }

      this.logger.debug(this, 'Commit change: publish entitlement...');
      if (await this.tryCommit(interactive)) {
        publishCount++;
      }
    }

    return publishCount;
  }

  public async unpublish(entitlements: PortalEntitlement[]): Promise<number> {
    let unpublishCount = 0;

    for (const entitlement of entitlements) {
      const interactive = (await this.aobClient.typedClient.PortalEntitlementInteractive.Get_byid(entitlement.GetEntity().GetKeys()[0])).Data[0];

      await interactive.IsInActive.Column.PutValue(true);
      await interactive.ActivationDate.Column.PutValue(null);

      this.logger.debug(this, 'Commit change: unpublish entitlement...');
      if (await this.tryCommit(interactive)) {
        unpublishCount++;
      }
    }

    return unpublishCount;
  }

  public async tryCommit(entitlement: PortalEntitlement, reload?: boolean): Promise<boolean> {
    try {
      await entitlement.GetEntity().Commit(reload);
      return true;
    } catch (error) {
      this.errorHandler.handleError(error);
    }

    return false;
  }

  public getEntitlementBadges(entitlement: PortalEntitlement): DataTileBadge[] {

    if (this.filter.published(entitlement)) {
      return [this.badgePublished];
    }

    if (this.filter.willPublish(entitlement)) {
      return [this.badgeWillPublish];
    }

    return [];
  }

  public async getEntitlementsFilterTree(options: portal_entitlementcandidates_UNSGroup_filtertree_get_args): Promise<FilterTreeData>{
    return this.aobClient.client.portal_entitlementcandidates_UNSGroup_filtertree_get(options);
  }

  private async createNew(
    element: TypedEntity,
    uidAobApplication: IWriteValue<string>
  ): Promise<PortalEntitlement> {
    const entitlement = (await this.aobClient.typedClient.PortalEntitlementInteractive.Get()).Data[0];
    entitlement.ObjectKeyElement.value = element.GetEntity().GetColumn('XObjectKey').GetValue(),
      entitlement.UID_AOBApplication.value = uidAobApplication.value;
    return entitlement;
  }
}
