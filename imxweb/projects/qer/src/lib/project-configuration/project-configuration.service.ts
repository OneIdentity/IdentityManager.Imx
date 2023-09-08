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

import { ClassloggerService, SettingsService } from 'qbm';
import { ProjectConfig, QerProjectConfig } from 'imx-api-qer';
import { QerApiService } from '../qer-api-client.service';

/**
 * ProjectConfigurationService returns the configuration of the portal.
 * The configuration contains among other things information which fields of the returned object types are visible to a user.
 */
@Injectable({
  providedIn: 'root'
})
export class ProjectConfigurationService {
  private projectConfig: QerProjectConfig & ProjectConfig;

  constructor(private qerClient: QerApiService,
    private readonly settings: SettingsService,
    private readonly logger: ClassloggerService) { }

  public async getConfig(): Promise<QerProjectConfig & ProjectConfig> {
    if (this.projectConfig == null) {
      this.logger.info(this, 'Project configuration is undefined. Retrieving...');
      this.projectConfig = {
        ...await this.qerClient.client.portal_qer_projectconfig_get(),
        ...await this.qerClient.client.portal_config_get()
      };

      this.logger.info(this, 'Received project configuration.');
      this.logger.trace(this, '', this.projectConfig);
    }

    this.settings.DefaultPageSize = this.projectConfig.DefaultPageSize;

    return this.projectConfig;
  }

}
