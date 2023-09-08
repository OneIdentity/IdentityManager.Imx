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

@Component({
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  constructor(private readonly appConfigService: AppConfigService, private readonly configService: ConfigService) {}

  src: EventSource;

  statusData: {
    CacheHits: number;
    CacheMisses: number;
    OpenSessions: number;
    TotalSessions: number;
  };

  selectedPage: string = '';

  documentationUiEnabled: boolean = true;

  selectPage(page: string) {
    this.selectedPage = page;
  }

  async ngOnInit() {
    this.loadDocumentationUi();
    this.configService.submitChanges?.subscribe(() => {
      this.loadDocumentationUi();
    })
  }

  ngOnDestroy() {
    if (this.src) this.src.close();
  }

  private async loadDocumentationUi(): Promise<void>{
    let state = await this.appConfigService.client.admin_apiconfigsingle_get('imx', 'ServerLevelConfig/ApiDocumentation');
    this.documentationUiEnabled = state == 'SwaggerUi';
  }
}
