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

import { ExtService, TabItem } from 'qbm';
import { LicenceOverviewButtonComponent } from './aad-extension/licence-overview-button/licence-overview-button.component';
import { AadGroupSubscriptionsComponent } from './azure-ad/aad-group/aad-group-subscriptions.component';
import { AadGroupDeniedPlansComponent } from './azure-ad/aad-group/aad-group-denied-plans.component';
import { AadUserSubscriptionsComponent } from './azure-ad/aad-user/aad-user-subscriptions.component';
import { AadUserDeniedPlansComponent } from './azure-ad/aad-user/aad-user-denied-plans.component';
import { AadPermissionsService } from './admin/aad-permissions.service';

@Injectable({ providedIn: 'root' })
export class InitService {
  constructor(
    private readonly extService: ExtService,
    private permission: AadPermissionsService
  ) {
  }

  public onInit(): void {
    this.extService.register('buttonBarExtensionComponent', { instance: LicenceOverviewButtonComponent });
    this.extService.register('groupSidesheet', {
      instance: AadGroupSubscriptionsComponent, inputData: {
        id: 'subscriptions',
        label: '#LDS#Heading Azure Active Directory Subscriptions',
        checkVisibility: async ref => this.isAadAccount(ref) && (this.permission.canReadInAzure())
      },
      sortOrder: 10
    } as TabItem);

    this.extService.register('groupSidesheet', {
      instance: AadGroupDeniedPlansComponent, inputData: {
        id: 'deniedPlans',
        label: '#LDS#Heading Disabled Azure Active Directory Service Plans',
        checkVisibility: async ref => this.isAadAccount(ref) && (this.permission.canReadInAzure())
      },
      sortOrder: 20
    } as TabItem);

    this.extService.register('accountSidesheet', {
      instance: AadUserSubscriptionsComponent, inputData: {
        id: 'subscriptions',
        label: '#LDS#Heading Azure Active Directory Subscriptions',
        checkVisibility: async ref => this.isAadAccount(ref) && (this.permission.canReadInAzure())
      },
      sortOrder: 10
    } as TabItem);

    this.extService.register('accountSidesheet', {
      instance: AadUserDeniedPlansComponent,
      inputData: {
        id: 'deniedPlans',
        label: '#LDS#Heading Disabled Azure Active Directory Service Plans',
        checkVisibility: async ref => this.isAadAccount(ref) && (this.permission.canReadInAzure())
      },
      sortOrder: 20
    } as TabItem);
  }


  private isAadAccount(referrer: any): boolean {
    let isAad = false;
    isAad = referrer ? referrer.objecttable === 'AADGroup' : false;
    return isAad;
  }

}
