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

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { EuiSidesheetService } from '@elemental-ui/core';
import { ConfigSettingType, MethodSetInfo } from '@imx-modules/imx-api-qbm';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { AppConfigService } from '../appConfig/appConfig.service';
import { calculateSidesheetWidth } from '../base/sidesheet-helper';
import { DataSourceToolbarFilter } from '../data-source-toolbar/data-source-toolbar-filters.interface';
import { DataSourceToolbarSettings } from '../data-source-toolbar/data-source-toolbar-settings';
import { SideNavigationComponent } from '../side-navigation-view/side-navigation-view-interfaces';
import { AddConfigSidesheetComponent } from './add-config-sidesheet.component';
import { ApplyConfigSidesheetComponent } from './apply-config-sidesheet.component';
import { ConfigSection, KeyData } from './config-section';
import { ConfigService } from './config.service';
import { ConvertConfigSidesheetComponent } from './convert-config-sidesheet.component';
import { DeleteConfigSidesheetComponent } from './delete-config-sidesheet.component';

@Component({
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss'],
  selector: 'imx-config',
})
export class ConfigComponent implements OnInit, OnDestroy, SideNavigationComponent {
  @Input() public isAdmin: boolean;

  public sectionsFiltered: ConfigSection[] = [];
  private subscriptions: Subscription[] = [];

  constructor(
    private readonly appConfigSvc: AppConfigService,
    public readonly configSvc: ConfigService,
    private readonly translator: TranslateService,
    private readonly sidesheet: EuiSidesheetService,
    private readonly translate: TranslateService,
  ) {}

  public dstSettings: DataSourceToolbarSettings;

  /** expose the enum type to the template */
  ConfigSettingType = ConfigSettingType;

  apiProjects: MethodSetInfo[];

  loading: boolean = true;

  async ngOnInit() {
    const filter: DataSourceToolbarFilter = {
      Description: 'Customized',
      Name: 'customized',
      Options: [],
    };

    this.dstSettings = {
      dataSource: {
        Data: [],
        totalCount: 0,
      },
      entitySchema: { Columns: {} },
      filters: [filter],
      displayedColumns: [],
      navigationState: {
        StartIndex: 0,
      },
    };

    // add async filter only after dstSettings has been assigned
    filter.Options?.push({
      Display: await this.translator.get('#LDS#Customized settings').toPromise(),
      Value: '1',
    });

    this.configSvc.filter.keywords = undefined;

    this.apiProjects = await this.appConfigSvc.client.admin_projects_get();
    if (this.apiProjects.length > 0 && this.apiProjects?.[0].AppId) {
      await this.optionSelected(this.apiProjects[0].AppId);
    }

    this.configSvc.submitChanges.subscribe(() => this.getData());
  }

  async ngOnDestroy() {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  public getData(): void {
    this.updateConfigServiceFilter();
    this.sectionsFiltered = this.configSvc.search();
  }

  public async optionSelected(projectId: string): Promise<void> {
    this.sectionsFiltered = [];
    try {
      this.loading = true;
      this.configSvc.setAppId(projectId);
      this.sectionsFiltered = await this.configSvc.load();
    } finally {
      this.loading = false;
    }
  }

  public isBoolean(conf: KeyData): boolean {
    return conf.Type != ConfigSettingType.LimitedValues && typeof conf.Value == 'boolean';
  }

  public isArray(conf: KeyData): boolean {
    return Array.isArray(conf.Value);
  }

  public getValuePreview(conf: KeyData): string {
    var d = conf.Value + '';
    if (d.length > 30) d = d.substring(0, 30) + '...';
    return d;
  }

  public onChangeEvent(conf: KeyData) {
    this.configSvc.addChange(conf);
  }

  public revertAll(isGlobal: boolean) {
    this.configSvc.revertAll(isGlobal);
  }

  public async openConvertSidesheet(): Promise<void> {
    this.sidesheet.open(ConvertConfigSidesheetComponent, {
      title: await this.translate.get('#LDS#Heading Convert Locally Customized Settings to Global Settings').toPromise(),
      panelClass: 'imx-sidesheet',
      padding: '0',
      width: calculateSidesheetWidth(600, 0.4),
      testId: 'admin-convert-config-sidesheet',
    });
  }

  public async openApplySidesheet(): Promise<void> {
    this.sidesheet.open(ApplyConfigSidesheetComponent, {
      title: await this.translate.get('#LDS#Heading Apply Configuration').toPromise(),
      panelClass: 'imx-sidesheet',
      padding: '0',
      width: calculateSidesheetWidth(600, 0.4),
      testId: 'admin-apply-config-sidesheet',
    });
  }

  public async add(): Promise<void> {
    this.sidesheet.open(AddConfigSidesheetComponent, {
      title: await this.translate.get('#LDS#Heading Create Configuration Key').toPromise(),
      panelClass: 'imx-sidesheet',
      padding: '0',
      width: calculateSidesheetWidth(600, 0.4),
      testId: 'admin-add-config-sidesheet',
    });
  }

  public async openDeleteSidesheet(): Promise<void> {
    this.sidesheet.open(DeleteConfigSidesheetComponent, {
      title: await this.translate.get('#LDS#Heading Delete Configuration Key').toPromise(),
      panelClass: 'imx-sidesheet',
      padding: '0',
      width: calculateSidesheetWidth(600, 0.4),
      testId: 'admin-delete-config-sidesheet',
    });
  }
  public sectionTrackByFn(index: number, item: ConfigSection) {
    return index;
  }

  public confTrackByFn(index: number, item: KeyData) {
    return item.Key;
  }

  private updateConfigServiceFilter(): void {
    let keywords = this.dstSettings.navigationState?.filter?.map((filter) => filter.Value1) || [];
    if (this.dstSettings.navigationState?.search) {
      keywords.push(this.dstSettings.navigationState.search);
    }
    this.configSvc.setFilter({
      customized: this.dstSettings.navigationState?.customized == '1',
      keywords,
    });
  }
}
