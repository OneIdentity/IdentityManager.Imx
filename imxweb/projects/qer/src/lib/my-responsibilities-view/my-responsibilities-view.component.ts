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

import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { SideNavigationExtension, SystemInfoService, HELP_CONTEXTUAL } from 'qbm';
import { UserModelService } from '../user/user-model.service';
import { MyResponsibilitiesRegistryService } from './my-responsibilities-registry.service';
import { ProjectConfigurationService } from '../project-configuration/project-configuration.service';
import { ProjectConfig } from 'imx-api-qbm';
import { QerProjectConfig } from 'imx-api-qer';

@Component({
  selector: 'imx-my-responsibilities-view',
  templateUrl: './my-responsibilities-view.component.html',
  styleUrls: ['./my-responsibilities-view.component.scss'],
})
export class MyResponsibilitiesViewComponent implements OnInit {
  public isAdmin = false;
  public baseUrl = 'myresponsibilities';
  public componentName = 'my-responsibilities-view';
  public componentTitle = '#LDS#Heading My Responsibilities';
  public contextId = HELP_CONTEXTUAL.MyResponsibilities;
  public navItems: SideNavigationExtension[] = [];
  constructor(
    private readonly systemInfoService: SystemInfoService,
    private readonly myResponsibilitiesRegistryService: MyResponsibilitiesRegistryService,
    private readonly userModelService: UserModelService,
    private cdref: ChangeDetectorRef,
    private readonly projectConfig: ProjectConfigurationService,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadNavItems();
  }
  public async loadNavItems(): Promise<void> {
    const systemInfo = await this.systemInfoService.get();
    const features = (await this.userModelService.getFeatures()).Features || [];
    const userConfig = await this.userModelService.getUserConfig();
    const config: QerProjectConfig & ProjectConfig = await this.projectConfig.getConfig();
    this.navItems = this.myResponsibilitiesRegistryService
      .getNavItems(systemInfo.PreProps, features, config)
      .filter((elem) => elem.name === 'identities' || elem.name === 'devices' || userConfig.Ownerships.find(own => own.TableName === elem.name)?.Count > 0);
    this.cdref.detectChanges();
  }
}
