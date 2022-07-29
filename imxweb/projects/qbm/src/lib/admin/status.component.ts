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
 * Copyright 2022 One Identity LLC.
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

import { Component } from "@angular/core";
import { ImxConfig, LoadedPlugin, MethodSetInfo, PingResult, SystemInfo, UpdaterState } from 'imx-api-qbm';
import { AppConfigService } from "../appConfig/appConfig.service";
import { ImxTranslationProviderService } from "../translation/imx-translation-provider.service";

@Component({
  selector: 'imx-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.scss']
})
export class StatusComponent {
  constructor(private readonly appConfigService: AppConfigService, private readonly translator : ImxTranslationProviderService) {
  }

  pingResult: PingResult;
  apiProjects: MethodSetInfo[];
  plugins: LoadedPlugin[];
  updaterState: UpdaterState;
  systemInfo: SystemInfo;
  config: ImxConfig;
  dataReady: boolean;
  UpdateText : string;

  UpdaterState = UpdaterState;


  ngOnInit() {
    this.Reload();
  }

  async Reload() {

    this.UpdateText = await this.translator.Translate("#LDS#Installs updates and restarts the server.").toPromise();

    // TODO add busy indicator
    const client = this.appConfigService.client;
    this.pingResult = await client.imx_ping_get();
    this.systemInfo = await client.imx_system_get();
    this.apiProjects = await client.admin_projects_get();
    this.plugins = await client.admin_systeminfo_plugins_get();
    const s = await client.admin_systeminfo_software_status_get();
    this.config = await this.appConfigService.getImxConfig();

    this.updaterState = s.Status;
    this.dataReady = true;
  }

  StartUpdate() {
    this.appConfigService.client.admin_systeminfo_software_update_post();
  }
}