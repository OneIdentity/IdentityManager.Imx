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
import { Subject } from 'rxjs';

import { PortalPersonReports, UserConfig, UserGroupInfo } from 'imx-api-qer';
import { PendingItemsType } from './pending-items-type.interface';
import { QerApiService } from '../qer-api-client.service';
import { CacheService, CachedPromise } from 'qbm';


@Injectable()
export class UserModelService {
  private pendingItems: CachedPromise<PendingItemsType>;
  private userConfig: CachedPromise<UserConfig>;

  public onPendingItemsChange = new Subject<PendingItemsType>();

  constructor(private qerClient: QerApiService, private readonly cache: CacheService) {
  }

  public async getUserConfig(): Promise<UserConfig> {
    if (this.userConfig == null) {
      this.userConfig = this.cache.buildCache(() => this.qerClient.client.portal_person_config_get());
    }

    return this.userConfig.get();
  }

  public getPendingItems(): Promise<PendingItemsType> {
    if (this.pendingItems == null) {
      this.pendingItems = this.cache.buildCache(() => this.qerClient.client.portal_pendingitems_get());
    }
    return this.pendingItems.get();
  }

  public async reloadPendingItems(): Promise<void> {
    this.pendingItems = undefined;
    const pendingItems = await this.getPendingItems();
    this.onPendingItemsChange.next(pendingItems);
  }

  public async getGroups(): Promise<UserGroupInfo[]> {
    return this.qerClient.client.portal_usergroups_get();
  }

  public async getDirectReports(): Promise<PortalPersonReports[]> {
    const userGroups = await this.getGroups();
    if (userGroups.find(group => group.Name === 'VI_4_ALLMANAGER')) {
      return (await this.qerClient.typedClient.PortalPersonReports.Get({
        OnlyDirect: true,
        PageSize: 10000
      })).Data;
    }
    return [];
  }
}
