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

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { ProjectConfig } from '@imx-modules/imx-api-qbm';
import { QerProjectConfig } from '@imx-modules/imx-api-qer';
import { TranslateModule } from '@ngx-translate/core';
import {
  CdrModule,
  ClassloggerService,
  DataSourceToolbarModule,
  DataTableModule,
  DataViewModule,
  HelpContextualModule,
  LdsReplaceModule,
} from 'qbm';
import { MyResponsibilitiesRegistryService } from '../my-responsibilities-view/my-responsibilities-registry.service';
import { CreateNewDeviceComponent } from './create-new-device/create-new-device.component';
import { ViewDevicesComponent } from './view-devices-home/view-devices.component';
import { ViewDevicesSidesheetComponent } from './view-devices-sidesheet/view-devices-sidesheet.component';

@NgModule({
  declarations: [ViewDevicesComponent, ViewDevicesSidesheetComponent, CreateNewDeviceComponent],
  imports: [
    CommonModule,
    CdrModule,
    EuiCoreModule,
    EuiMaterialModule,
    TranslateModule,
    LdsReplaceModule,
    ReactiveFormsModule,
    DataSourceToolbarModule,
    DataTableModule,
    HelpContextualModule,
    MatTableModule,
    DataViewModule,
  ],
  exports: [ViewDevicesComponent, ViewDevicesSidesheetComponent],
})
export class ViewDevicesModule {
  constructor(
    private readonly myResponsibilitiesRegistryService: MyResponsibilitiesRegistryService,
    logger: ClassloggerService,
  ) {
    logger.info(this, '▶️ ViewDevicesModule loaded');
    this.setupMyResponsibilitiesView();
  }
  private setupMyResponsibilitiesView(): void {
    this.myResponsibilitiesRegistryService.registerFactory(
      (preProps: string[], features: string[], projectConfig: QerProjectConfig & ProjectConfig) => {
        if (preProps.includes('MAC') && projectConfig.DeviceConfig && projectConfig.DeviceConfig.VI_Hardware_Enabled) {
          return {
            instance: ViewDevicesComponent,
            sortOrder: 13,
            name: 'devices',
            caption: '#LDS#Heading Devices',
          };
        } else {
          return { caption: '', name: '' };
        }
      },
    );
  }
}
