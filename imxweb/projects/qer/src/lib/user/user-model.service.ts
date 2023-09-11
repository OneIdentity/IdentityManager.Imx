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
import { Subject } from 'rxjs';

import { PortalPersonReports, UserConfig, UserFeatureInfo, UserGroupInfo } from 'imx-api-qer';
import { PendingItemsType } from './pending-items-type.interface';
import { QerApiService } from '../qer-api-client.service';
import { CacheService, SettingsService } from 'qbm';
import { CachedPromise } from 'imx-qbm-dbts';

@Injectable()
export class UserModelService {
  public onPendingItemsChange = new Subject<PendingItemsType>();

  // The cached promises cache the results of often needed API requests.
  // The CacheService takes care of flushing the cache when re-authenticating.
  private pendingItemsCache: CachedPromise<PendingItemsType>;
  private cachedGroups: CachedPromise<UserGroupInfo[]>;
  private cachedFeatures: CachedPromise<UserFeatureInfo>;

  constructor(private readonly qerClient: QerApiService, private readonly settingsService: SettingsService, cacheService: CacheService) {
    this.pendingItemsCache = cacheService.buildCache(() => this.qerClient.client.portal_pendingitems_get());
    this.cachedGroups = cacheService.buildCache(() => this.qerClient.client.portal_usergroups_get());
    this.cachedFeatures = cacheService.buildCache(() => this.qerClient.client.portal_features_get());
  }

  public getUserConfig(): Promise<UserConfig> {
    return this.qerClient.client.portal_person_config_get();
  }

  public getPendingItems(): Promise<PendingItemsType> {
    return this.pendingItemsCache.get();
  }

  public async reloadPendingItems(): Promise<void> {
    this.pendingItemsCache.reset();
    this.onPendingItemsChange.next(await this.getPendingItems());
  }

  public getGroups(): Promise<UserGroupInfo[]> {
    return this.cachedGroups.get();
  }

  public getFeatures(): Promise<UserFeatureInfo> {
    return this.cachedFeatures.get();
  }

  public async getDirectReports(uidperson?: string): Promise<PortalPersonReports[]> {
    const features = (await this.cachedFeatures.get()).Features;
    if (features.find((feature) => feature === 'Portal_UI_PersonManager')) {
      return (
        await this.qerClient.typedClient.PortalPersonReports.Get({
          OnlyDirect: true,
          PageSize: this.settingsService.PageSizeForAllElements,
          uidperson,
        })
      ).Data;
    }
    return [];
  }
}
