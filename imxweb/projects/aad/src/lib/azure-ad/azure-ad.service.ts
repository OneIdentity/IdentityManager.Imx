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
import {
  PortalTargetsystemAadgroupDeniedserviceplans,
  PortalTargetsystemAadgroupSubsku,
  PortalTargetsystemAaduserDeniedserviceplans,
  PortalTargetsystemAaduserSubsku,
} from 'imx-api-aad';
import { CollectionLoadParameters, EntitySchema, TypedEntityCollectionData } from 'imx-qbm-dbts';
import { ApiService } from '../api.service';

@Injectable({
  providedIn: 'root',
})
export class AzureAdService {
  private busyIndicator: OverlayRef;

  constructor(private readonly aadApiClient: ApiService, private readonly busyService: EuiLoadingService) { }

  public get aadUserSchema(): EntitySchema {
    return this.aadApiClient.typedClient.PortalTargetsystemAaduserSubsku.GetSchema();
  }

  public get aadUserDeniedPlansSchema(): EntitySchema {
    return this.aadApiClient.typedClient.PortalTargetsystemAaduserDeniedserviceplans.GetSchema();
  }

  public get aadGroupSubSchema(): EntitySchema {
    return this.aadApiClient.typedClient.PortalTargetsystemAadgroupSubsku.GetSchema();
  }

  public get aadGroupDeniedPlansSchema(): EntitySchema {
    return this.aadApiClient.typedClient.PortalTargetsystemAadgroupDeniedserviceplans.GetSchema();
  }

  public async getAadUserSubscriptions(
    uidAadUser: string,
    navigationState: CollectionLoadParameters
  ): Promise<TypedEntityCollectionData<PortalTargetsystemAaduserSubsku>> {
    return this.aadApiClient.typedClient.PortalTargetsystemAaduserSubsku.Get(uidAadUser, navigationState);
  }

  public async getAadUserDeniedPlans(
    uidAadUser: string,
    navigationState: CollectionLoadParameters
  ): Promise<TypedEntityCollectionData<PortalTargetsystemAaduserDeniedserviceplans>> {
    return this.aadApiClient.typedClient.PortalTargetsystemAaduserDeniedserviceplans.Get(uidAadUser, navigationState);
  }

  public async getAadGroupDeniedPlans(
    uidAadGroup: string,
    navigationState: CollectionLoadParameters
  ): Promise<TypedEntityCollectionData<PortalTargetsystemAadgroupDeniedserviceplans>> {
    return this.aadApiClient.typedClient.PortalTargetsystemAadgroupDeniedserviceplans.Get(uidAadGroup, navigationState);
  }

  public async getAadGroupSubscriptions(
    uidAadGroup: string,
    navigationState: CollectionLoadParameters
  ): Promise<TypedEntityCollectionData<PortalTargetsystemAadgroupSubsku>> {
    return this.aadApiClient.typedClient.PortalTargetsystemAadgroupSubsku.Get(uidAadGroup, navigationState);
  }

  public generateAadUserSubscriptionEntity(uidAaduser: string): PortalTargetsystemAaduserSubsku {
    return this.aadApiClient.typedClient.PortalTargetsystemAaduserSubsku.createEntity({
      Columns: {
        UID_AADUser: {
          Value: uidAaduser
        }
      }
    });
  }
  public generateAadUserDeniedPlanEntity(uidAaduser: string): PortalTargetsystemAaduserDeniedserviceplans {
    return this.aadApiClient.typedClient.PortalTargetsystemAaduserDeniedserviceplans.createEntity({
      Columns: {
        UID_AADUser: {
          Value: uidAaduser
        }
      }
    });
  }

  public createAadUserSubscription(
    uidAadUser: string,
    aadUserSubscription: PortalTargetsystemAaduserSubsku
  ): Promise<TypedEntityCollectionData<PortalTargetsystemAaduserSubsku>> {
    return this.aadApiClient.typedClient.PortalTargetsystemAaduserSubsku.Post(uidAadUser, aadUserSubscription);
  }

  public createAadUserDeniedPlan(
    uidAadUser: string,
    aadUserDeniedPlan: PortalTargetsystemAaduserDeniedserviceplans
  ): Promise<TypedEntityCollectionData<PortalTargetsystemAaduserDeniedserviceplans>> {
    return this.aadApiClient.typedClient.PortalTargetsystemAaduserDeniedserviceplans.Post(uidAadUser, aadUserDeniedPlan);
  }

  public async removeAadUserSubscriptions(uidAadUser: string, userSubscriptions: PortalTargetsystemAaduserSubsku[]): Promise<any> {
    const promises = [];
    userSubscriptions.forEach((userSub) => {
      const key = userSub.GetEntity().GetKeys().join();
      promises.push(this.aadApiClient.client.portal_targetsystem_aaduser_subsku_delete(uidAadUser, key));
    });
    return Promise.all(promises);
  }

  public async removeAadUserDeniedPlans(uidAadUser: string, userDeniedPlans: PortalTargetsystemAaduserDeniedserviceplans[]): Promise<any> {
    const promises = [];
    userDeniedPlans.forEach((deniedPlan) => {
      const deniedPlanValue = deniedPlan.UID_AADDeniedServicePlan.value;
      promises.push(this.aadApiClient.client.portal_targetsystem_aaduser_deniedserviceplans_delete(uidAadUser, deniedPlanValue));
    });
    return Promise.all(promises);
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
}
