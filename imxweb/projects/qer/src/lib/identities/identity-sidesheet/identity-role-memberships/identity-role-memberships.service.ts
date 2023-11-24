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
 * Copyright 2021 One Identity LLC.
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
  PortalPersonRolemembershipsAerole,
  PortalPersonRolemembershipsDepartment,
  PortalPersonRolemembershipsItshoporg,
  PortalPersonRolemembershipsLocality,
  PortalPersonRolemembershipsProfitcenter
} from 'imx-api-qer';
import { CollectionLoadParameters, EntitySchema, TypedEntity, TypedEntityBuilder, TypedEntityCollectionData } from 'imx-qbm-dbts';
import { QerApiService } from '../../../qer-api-client.service';
import { IdentityRoleMembershipsParameter, MembershipContolInfo } from './identity-role-memberships-parameter.interface';

@Injectable({
  providedIn: 'root'
})
export class IdentityRoleMembershipsService {

  public readonly targetMap: Map<string, IdentityRoleMembershipsParameter> = new Map();
  public targets = [];

  protected readonly localityTag = 'Locality';
  protected readonly profitCenterTag = 'ProfitCenter';
  protected readonly departmentTag = 'Department';
  protected readonly aeRoleTag = 'AERole';
  protected readonly itShopOrg = 'ITShopOrg';

  constructor(private readonly qerApiClient: QerApiService) {
    this.addPredefinedTargets();
  }

  public async get(target: string, navigationState?: CollectionLoadParameters)
    : Promise<TypedEntityCollectionData<TypedEntity>> {
    const targetObject = this.targetMap.get(target);

    if (!targetObject) {
      throw new Error(`No target object registered for this target name '${target}'`);
    }

    const builder = new TypedEntityBuilder(targetObject.type);
    const data = await targetObject.get(navigationState);

    return builder.buildReadWriteEntities(data, targetObject.entitySchema);
  }

  public getSchema(target: string): EntitySchema {
    return this.targetMap.get(target)?.entitySchema;
  }

  public canAnalyseAssignment(target: string): boolean {
    return this.targetMap.get(target)?.withAnalysis === true;
  }

  public getTabData(target: string): MembershipContolInfo {
    return this.targetMap.get(target)?.controlInfo;
  }

  public addTarget(parameter: IdentityRoleMembershipsParameter): void {
    this.targets.push(parameter.table);
    this.targetMap.set(parameter.table, parameter);
  }

  private addPredefinedTargets(): void {
    this.addTarget({
      table: this.localityTag,
      type: PortalPersonRolemembershipsLocality,
      entitySchema: this.qerApiClient.typedClient.PortalPersonRolemembershipsLocality.GetSchema(),
      controlInfo: {
        label: '#LDS#Menu Entry Locations',
        index: 40,
      },
      get: async (parameter: CollectionLoadParameters) => this.qerApiClient.client.portal_person_rolememberships_Locality_get(
          parameter?.uidPerson,
          parameter?.OrderBy,
          parameter?.StartIndex,
          parameter?.PageSize,
          parameter?.filter,
          parameter?.withProperties,
          parameter?.search
        )
      ,
      withAnalysis: true
    });

    this.addTarget({
      table: this.profitCenterTag,
      type: PortalPersonRolemembershipsProfitcenter,
      entitySchema: this.qerApiClient.typedClient.PortalPersonRolemembershipsProfitcenter.GetSchema(),
      controlInfo: {
        label: '#LDS#Menu Entry Cost centers',
        index: 50,
      },
      get: async (parameter: CollectionLoadParameters) => this.qerApiClient.client.portal_person_rolememberships_ProfitCenter_get(
          parameter?.uidPerson,
          parameter?.OrderBy,
          parameter?.StartIndex,
          parameter?.PageSize,
          parameter?.filter,
          parameter?.withProperties,
          parameter?.search
        ),
      withAnalysis: true
    });

    this.addTarget({
      table: this.departmentTag,
      type: PortalPersonRolemembershipsDepartment,
      entitySchema: this.qerApiClient.typedClient.PortalPersonRolemembershipsDepartment.GetSchema(),
      controlInfo: {
        label: '#LDS#Menu Entry Departments',
        index: 30,
      },
      get: async (parameter: CollectionLoadParameters) => this.qerApiClient.client.portal_person_rolememberships_Department_get(
          parameter?.uidPerson,
          parameter?.OrderBy,
          parameter?.StartIndex,
          parameter?.PageSize,
          parameter?.filter,
          parameter?.withProperties,
          parameter?.search
        ),
      withAnalysis: true
    });

    this.addTarget({
      table: this.aeRoleTag,
      type: PortalPersonRolemembershipsAerole,
      entitySchema: this.qerApiClient.typedClient.PortalPersonRolemembershipsAerole.GetSchema(),
      controlInfo: {
        label: '#LDS#Heading Application Roles',
        index: 60,
      },
      get: async (parameter: CollectionLoadParameters) => this.qerApiClient.client.portal_person_rolememberships_AERole_get(
          parameter?.uidPerson,
          parameter?.OrderBy,
          parameter?.StartIndex,
          parameter?.PageSize,
          parameter?.filter,
          parameter?.withProperties,
          parameter?.search
        ),
      withAnalysis: true
    });

    this.addTarget({
      table: this.itShopOrg,
      type: PortalPersonRolemembershipsItshoporg,
      entitySchema: this.qerApiClient.typedClient.PortalPersonRolemembershipsItshoporg.GetSchema(),
      controlInfo: {
        label: '#LDS#Heading Shops',
        index: 90,
      },
      get: async (parameter: CollectionLoadParameters) => this.qerApiClient.client.portal_person_rolememberships_ITShopOrg_get(
          parameter?.uidPerson,
          parameter?.OrderBy,
          parameter?.StartIndex,
          parameter?.PageSize,
          undefined,
          parameter?.withProperties,
          parameter?.search,
          'CU'
        ),
      withAnalysis: false
    });
  }
}
