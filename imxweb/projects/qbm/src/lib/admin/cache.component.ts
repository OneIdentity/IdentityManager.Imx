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

import { Component, Input, OnInit } from '@angular/core';
import { CacheData } from '@imx-modules/imx-api-qbm';
import { AppConfigService } from '../appConfig/appConfig.service';
import { ConfirmationService } from '../confirmation/confirmation.service';
import { MessageParameter } from '../message-dialog/message-parameter.interface';
import { SideNavigationComponent } from '../side-navigation-view/side-navigation-view-interfaces';

type T = CacheData & { key: string };

@Component({
  templateUrl: './cache.component.html',
  styleUrls: ['./shared.scss'],
  selector: 'imx-cache',
})
export class CacheComponent implements OnInit, SideNavigationComponent {
  @Input() public isAdmin: boolean;

  constructor(
    private readonly appConfigService: AppConfigService,
    private readonly confirmService: ConfirmationService,
  ) {}

  public cacheData: { [key: string]: CacheData } = {};
  public totalEntries = 0;
  public totalHits = 0;
  public apiProjects: (string | undefined)[];
  public cacheKeys: string[] = [];

  async ngOnInit() {
    this.busy = true;
    this.apiProjects = (await this.appConfigService.v2client.admin_projects_get()).map((p) => p.AppId);
    await this.reload();
  }

  async reload() {
    const client = this.appConfigService.client;
    var data = this.apiProjects.map((appid) => client.admin_cache_get(appid ?? ''));
    await this.apply(data);
  }

  async flushall(): Promise<void> {
    const data = this.apiProjects.map((appid) =>
      this.appConfigService.v2client.admin_cache_post(appid ?? '', {
        flush: true,
        disable: this.isCachingDeactivated(),
      }),
    );
    await this.apply(data);
  }

  async switchall(): Promise<void> {
    const disable = !this.isCachingDeactivated();
    if (disable) {
      const messageParameters: MessageParameter = {
        Title: '#LDS#Heading Deactivate Caches',
        Message: '#LDS#If you deactivate all caches, performance will be impaired. Are you sure you want to deactivate all caches?',
      };
      if (await this.confirmService.confirm(messageParameters)) {
        const data = this.apiProjects.map((appid) => this.appConfigService.v2client.admin_cache_post(appid ?? '', { disable: disable }));
        await this.apply(data);
      }
    } else {
      const data = this.apiProjects.map((appid) => this.appConfigService.v2client.admin_cache_post(appid ?? '', { disable: disable }));
      await this.apply(data);
    }
  }

  async apply(pdata: Promise<{ [key: string]: CacheData }>[]) {
    this.busy = true;
    try {
      this.cacheData = {};
      this.cacheKeys = [];
      for (var idx = 0; idx < pdata.length; idx++) {
        const data = await pdata[idx];
        for (let key of Object.keys(data)) {
          if (!this.cacheData[key])
            this.cacheData[key] = {
              IsDisabled: false,
              AccessCount: 0,
              HitCount: 0,
              ObjectCount: 0,
            };

          const obj = this.cacheData[key];
          this.cacheData[key] = {
            IsDisabled: obj.IsDisabled || data[key].IsDisabled,
            AccessCount: obj.AccessCount + data[key].AccessCount,
            HitCount: obj.HitCount + data[key].HitCount,
            ObjectCount: obj.ObjectCount + data[key].ObjectCount,
          };
        }
      }
    } finally {
      this.busy = false;
    }

    this.totalEntries = Object.keys(this.cacheData)
      .map((a) => this.cacheData[a].ObjectCount)
      .reduce((a, b) => a + b);

    this.totalHits = Object.keys(this.cacheData)
      .map((a) => this.cacheData[a].HitCount)
      .reduce((a, b) => a + b);

    this.cacheKeys = Object.keys(this.cacheData);
  }

  private isCachingDeactivated() {
    return Object.keys(this.cacheData).filter((b) => !this.cacheData[b].IsDisabled).length == 0;
  }

  public GetLdsSwitchText() {
    return this.isCachingDeactivated() ? '#LDS#Activate caches' : '#LDS#Deactivate caches';
  }

  public LdsFlushAll = '#LDS#Flush all caches';
  public LdsReload = '#LDS#Reload';

  public busy = false;
}
