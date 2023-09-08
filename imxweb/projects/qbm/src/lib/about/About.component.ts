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

import { Component, HostBinding, OnInit } from '@angular/core';
import { OverlayRef } from '@angular/cdk/overlay';
import { EuiLoadingService } from '@elemental-ui/core';

import { AboutService } from './About.service';
import { ExtService } from '../ext/ext.service';
import { Globals, CollectionLoadParameters, EntitySchema, IClientProperty } from 'imx-qbm-dbts';
import { DataSourceToolbarSettings } from '../data-source-toolbar/data-source-toolbar-settings';
import { SettingsService } from '../settings/settings-service';
import { SystemInfoService } from '../system-info/system-info.service';

@Component({
  templateUrl: './About.component.html',
  styleUrls: ['./About.component.scss'],
  selector: 'imx-about'
})
export class AboutComponent implements OnInit {

  @HostBinding('class')
  public defaultHostClasses = 'imx-flex imx-flex-child';

  public product: { [key: string]: string } = {};

  public dstSettings: DataSourceToolbarSettings;
  public parameters: CollectionLoadParameters;
  public readonly entitySchema: EntitySchema;

  private readonly displayedColumns: IClientProperty[];

  constructor(
    private aboutInfoService: AboutService,
    private readonly systemInfoService: SystemInfoService,
    private extService: ExtService,
    private readonly settings: SettingsService,
    private readonly busyService: EuiLoadingService
  ) {
    this.entitySchema = aboutInfoService.EntitySchema;
    this.displayedColumns = [
      this.entitySchema.Columns['ComponentName'],
      this.entitySchema.Columns['CopyRight'],
      this.entitySchema.Columns['EmailOrURl'],
      this.entitySchema.Columns['LicenceName']
    ];
    this.product['Name'] = Globals.QIM_ProductNameFull;
    this.product['Version'] = Globals.Version;
    this.product['Copyright'] = Globals.QBM_Copyright;

    this.product['ThirdPartyLicencesUrl'] = 'https://www.oneidentity.com/legal/third-party-licenses.aspx';
    this.product['OpenSourceUrl'] = 'https://opensource.quest.com';
    this.product['ContactUrl'] = 'https://www.oneidentity.com/company/contact-us.aspx';
    this.product['ProductSupportPortalUrl'] = 'https://support.oneidentity.com/';
    this.product['ProductPageUrl'] = 'https://www.oneidentity.com/products/identity-manager/';
  }

  public async ngOnInit(): Promise<void> {
    const imxConfig = await this.systemInfoService.getImxConfig();
    const name = imxConfig.ProductName;
    if (name)
      this.product['Name'] = name;

    await this.update({ PageSize: this.settings.DefaultPageSize, StartIndex: 0, OrderBy: 'ComponentName' });
  }

  public ShowSystemOverviewTab(): boolean {
    return this.extService.Registry['SystemOverview'] && this.extService.Registry['SystemOverview'].length > 0;
  }

  public async update(parameters?: CollectionLoadParameters): Promise<void> {
    if (parameters) {
      this.parameters = parameters;
    }

    let overlayRef: OverlayRef;
    setTimeout(() => overlayRef = this.busyService.show());
    try {
      const data = await this.aboutInfoService.get(this.parameters);
      this.dstSettings = {
        dataSource: data,
        entitySchema: this.entitySchema,
        navigationState: this.parameters,
        displayedColumns: this.displayedColumns
      };
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
  }
}
