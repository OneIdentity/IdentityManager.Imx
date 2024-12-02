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
import { ViewConfigData } from '@imx-modules/imx-api-qer';
import { DataModel } from '@imx-modules/imx-qbm-dbts';
import { DataSourceToolbarViewConfig, DSTViewConfig, isConfigDefault, isDefaultId } from 'qbm';
import { QerApiService } from '../qer-api-client.service';

@Injectable({
  providedIn: 'root',
})
export class ViewConfigService {
  private allConfigs: DSTViewConfig[] = [];

  constructor(private readonly qerClient: QerApiService) {}

  /**
   * Get all configs associated to the current viewId
   * @param viewId ViewConfigData.ViewId
   * @returns viewConfigData[]
   */
  public async getViewConfig(viewId: string, signal?: AbortSignal): Promise<ViewConfigData[]> {
    return (await this.qerClient.v2Client.portal_viewconfig_get(undefined, { signal })).filter((config) => config.ViewId === viewId);
  }

  /**
   * Post/put the config.
   * @param config ViewConfigData
   */
  public async putViewConfig(config: ViewConfigData): Promise<void> {
    await this.qerClient.v2Client.portal_viewconfig_put(config);
  }

  /**
   * Delete the config with the supplied id
   * @param id ViewConfigData.Id
   */
  public async deleteViewConfig(id: string): Promise<void> {
    await this.qerClient.v2Client.portal_viewconfig_delete(id);
  }

  /**
   * Use the DataModel to get all configs and mark any not in the user config as readonly
   * @param dataModel The dataModel associated with the dst entities we are using
   * @param viewId ViewConfigData.ViewId
   * @returns The list of available configs along with the viewId for the DST
   */
  public async getInitialDSTExtension(dataModel: DataModel, viewId: string, signal?: AbortSignal): Promise<DataSourceToolbarViewConfig> {
    // Take configs from the data model, this should be a superset of the user's configs.
    const userConfigs = await this.getViewConfig(viewId, signal);
    const userDefault = userConfigs.find((config) => config.UseAsDefault);
    this.allConfigs =
      dataModel?.Configurations?.map<DSTViewConfig>((config) => {
        // If we have a user default, set that as the default here, otherwise set the default from the default config id which is stored as the display name on the DataModelConfig, if there is no default then set as false
        const UseAsDefault = userDefault
          ? userDefault.Id === config?.Id
          : dataModel?.DefaultConfigId
            ? dataModel.DefaultConfigId === config?.DisplayName
            : false;

        // Use the user config if it exists, if not this is a readonly config
        let IsReadOnly: boolean = false;
        const userConfig = userConfigs.find((userConfig) => config?.Id === userConfig?.Id);
        userConfig ? (config = userConfig) : (IsReadOnly = true);

        return config?.DisplayName
          ? { ...config, UseAsDefault, IsReadOnly, ViewId: viewId }
          : { ...config, UseAsDefault, IsReadOnly, DisplayName: config?.Id, ViewId: viewId };
      }) || [];

    if (!this.allConfigs) {
      // There were no data model configs, use the user configs as is
      this.allConfigs = userConfigs;
    }
    return {
      viewConfigs: this.allConfigs,
      viewId,
    };
  }

  /**
   * Now assumes the datamodel is out of sync and will only update the configs based on what isn't present in the user configs
   * @param viewId ViewConfigData.ViewId
   * @returns The list of available configs along with the viewId for the DST
   */
  public async getDSTExtensionChanges(viewId: string): Promise<DataSourceToolbarViewConfig> {
    const userConfigs = await this.getViewConfig(viewId);
    const userConfigIds = userConfigs.map((config) => config?.Id);
    // Filter out any removed configs that aren't marked as readonly
    this.allConfigs = this.allConfigs.filter((config) => config.IsReadOnly || userConfigIds.includes(config.Id));
    // Add / update any new configs
    userConfigs.forEach((userConfig) => {
      const ind = this.allConfigs.findIndex((oldConfig) => oldConfig.Id === userConfig.Id);
      ind < 0 ? this.allConfigs.push(userConfig) : (this.allConfigs[ind] = userConfig);
    });
    return {
      viewConfigs: this.allConfigs,
      viewId,
    };
  }

  /**
   * Check to see if we have a user config set as the default view
   * @returns if we are using a user config as default
   */
  public isDefaultConfigSet(): boolean {
    return !!this.allConfigs.find((config) => isConfigDefault(config) && !isDefaultId(config));
  }
}
