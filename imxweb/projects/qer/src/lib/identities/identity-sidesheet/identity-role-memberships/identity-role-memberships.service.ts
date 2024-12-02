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
  PortalPersonRolemembershipsAerole,
  PortalPersonRolemembershipsDepartment,
  PortalPersonRolemembershipsItshoporg,
  PortalPersonRolemembershipsLocality,
  PortalPersonRolemembershipsProfitcenter,
} from '@imx-modules/imx-api-qer';
import {
  CollectionLoadParameters,
  EntitySchema,
  TypedEntity,
  TypedEntityBuilder,
  TypedEntityCollectionData,
} from '@imx-modules/imx-qbm-dbts';
import { QerApiService } from '../../../qer-api-client.service';
import { IdentityRoleMembershipsParameter, MembershipContolInfo } from './identity-role-memberships-parameter.interface';

@Injectable({
  providedIn: 'root',
})
export class IdentityRoleMembershipsService {
  public readonly targetMap: Map<string, IdentityRoleMembershipsParameter> = new Map();
  public targets: string[] = [];

  protected readonly localityTag = 'Locality';
  protected readonly profitCenterTag = 'ProfitCenter';
  protected readonly departmentTag = 'Department';
  protected readonly aeRoleTag = 'AERole';
  protected readonly itShopOrg = 'ITShopOrg';

  constructor(private readonly qerApiClient: QerApiService) {
    this.addPredefinedTargets();
  }

  public async get(
    target: string,
    uidPerson: string,
    navigationState?: CollectionLoadParameters,
  ): Promise<TypedEntityCollectionData<TypedEntity> | undefined> {
    const targetObject = this.targetMap.get(target);

    if (!targetObject || !targetObject.get) {
      // throw new Error(`No target object registered for this target name '${target}'`);
      return undefined;
    }

    const entitySchema = targetObject.entitySchema;
    if (!entitySchema) {
      return undefined;
    }
    const data = await targetObject?.get(uidPerson, navigationState);
    if (!data) {
      return undefined;
    }

    const builder = new TypedEntityBuilder(targetObject?.type);
    return builder.buildReadWriteEntities(data, entitySchema);
  }

  public getSchema(target: string): EntitySchema | undefined {
    if (!this.targetMap.has(target)) {
      return undefined;
    }
    const targetObject = this.targetMap.get(target);

    if (!targetObject) {
      return undefined;
    }
    return targetObject.entitySchema;
  }

  public canAnalyseAssignment(target: string): boolean {
    return this.targetMap.get(target)?.withAnalysis === true;
  }

  public getTabData(target: string): MembershipContolInfo | undefined {
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
      get: async (uidPerson: string, parameter: CollectionLoadParameters) => {
        return this.qerApiClient.client.portal_person_rolememberships_Locality_get(uidPerson, parameter);
      },
      withAnalysis: true,
    });

    this.addTarget({
      table: this.profitCenterTag,
      type: PortalPersonRolemembershipsProfitcenter,
      entitySchema: this.qerApiClient.typedClient.PortalPersonRolemembershipsProfitcenter.GetSchema(),
      controlInfo: {
        label: '#LDS#Menu Entry Cost centers',
        index: 50,
      },
      get: async (uidPerson: string, parameter: CollectionLoadParameters) =>
        this.qerApiClient.client.portal_person_rolememberships_ProfitCenter_get(uidPerson, parameter),
      withAnalysis: true,
    });

    this.addTarget({
      table: this.departmentTag,
      type: PortalPersonRolemembershipsDepartment,
      entitySchema: this.qerApiClient.typedClient.PortalPersonRolemembershipsDepartment.GetSchema(),
      controlInfo: {
        label: '#LDS#Menu Entry Departments',
        index: 30,
      },
      get: async (uidPerson: string, parameter: CollectionLoadParameters) =>
        this.qerApiClient.client.portal_person_rolememberships_Department_get(uidPerson, parameter),
      withAnalysis: true,
    });

    this.addTarget({
      table: this.aeRoleTag,
      type: PortalPersonRolemembershipsAerole,
      entitySchema: this.qerApiClient.typedClient.PortalPersonRolemembershipsAerole.GetSchema(),
      controlInfo: {
        label: '#LDS#Menu Entry Application roles',
        index: 60,
      },
      get: async (uidPerson: string, parameter: CollectionLoadParameters) =>
        this.qerApiClient.client.portal_person_rolememberships_AERole_get(uidPerson, parameter),
      withAnalysis: true,
    });

    this.addTarget({
      table: this.itShopOrg,
      type: PortalPersonRolemembershipsItshoporg,
      entitySchema: this.qerApiClient.typedClient.PortalPersonRolemembershipsItshoporg.GetSchema(),
      controlInfo: {
        label: '#LDS#Heading Shops',
        index: 90,
      },
      get: async (uidPerson: string, parameter: CollectionLoadParameters) =>
        this.qerApiClient.client.portal_person_rolememberships_ITShopOrg_get(uidPerson, {
          ...parameter,
          type: 'CU',
        }),
      withAnalysis: false,
    });
  }
}
