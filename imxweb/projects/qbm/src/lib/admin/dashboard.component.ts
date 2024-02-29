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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ConfigService } from './config.service';

import { AppConfigService } from '../appConfig/appConfig.service';
import { Subscription } from 'rxjs';
import { StatusComponent } from './status.component';
import { ConfigComponent } from './config.component';
import { PackagesComponent } from './packages.component';
import { CacheComponent } from './cache.component';
import { LogsComponent } from './logs.component';
import { SwaggerComponent } from './swagger/swagger.component';
import { SideNavigationExtension } from '../side-navigation-view/side-navigation-view-interfaces';

@Component({
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  public isAdmin = true;
  public baseUrl = 'admin';
  public componentName = 'admin';
  public navItems: SideNavigationExtension[] = [
    {
      instance: StatusComponent,
      data: {
        TableName: 'Overview',
        Count: 0,
      },
      sortOrder: 1,
      name: 'overview',
      caption: '#LDS#Overview',
    },
    {
      instance: ConfigComponent,
      data: {
        TableName: 'Configuration',
        Count: 0,
      },
      sortOrder: 2,
      name: 'config',
      caption: '#LDS#Configuration',
    },
    {
      instance: PackagesComponent,
      data: {
        TableName: 'Packages',
        Count: 0,
      },
      sortOrder: 3,
      name: 'packages',
      caption: '#LDS#Packages',
    },
    {
      instance: CacheComponent,
      data: {
        TableName: 'Caches',
        Count: 0,
      },
      sortOrder: 4,
      name: 'caches',
      caption: '#LDS#Caches',
    },
    {
      instance: LogsComponent,
      data: {
        TableName: 'Logs',
        Count: 0,
      },
      sortOrder: 5,
      name: 'logs',
      caption: '#LDS#Logs',
    },
    {
      instance: SwaggerComponent,
      data: {
        TableName: 'API documentation',
        Count: 0,
      },
      sortOrder: 6,
      name: 'documentation',
      caption: '#LDS#API documentation',
    },
  ];

  subscriptions: Subscription[] = [];
  src: EventSource;

  statusData: {
    CacheHits: number;
    CacheMisses: number;
    OpenSessions: number;
    TotalSessions: number;
  };

  documentationUiEnabled: boolean = true;

  constructor(
    private readonly appConfigService: AppConfigService,
    private readonly configService: ConfigService
  ) {}

  async ngOnInit() {
    this.loadDocumentationUi();
    this.subscriptions.push(this.configService.submitChanges?.subscribe(() => this.loadDocumentationUi()));
  }

  /**
   * Checks if the user has permission to use the API documentation
   */
  private async loadDocumentationUi(): Promise<void>{
    let state = await this.appConfigService.client.admin_apiconfigsingle_get('imx', 'ServerLevelConfig/ApiDocumentation');
    this.documentationUiEnabled = state == 'SwaggerUi';
  }

  ngOnDestroy() {
    if (this.src) this.src.close();
    if (this.subscriptions.length) this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
