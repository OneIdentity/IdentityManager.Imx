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

import { HELP_CONTEXTUAL, SideNavigationExtension, SystemInfoService } from 'qbm';
import { UserModelService } from '../user/user-model.service';
import { DataExplorerRegistryService } from './data-explorer-registry.service';

@Component({
  templateUrl: './data-explorer-view.component.html',
  styleUrls: ['./data-explorer-view.component.scss'],
})
export class DataExplorerViewComponent implements OnInit {
  public isAdmin = true;
  public baseUrl = 'admin/dataexplorer';
  public componentName = 'data-explorer-view';
  public componentTitle = '#LDS#Heading Data Explorer';
  public contextId = HELP_CONTEXTUAL.DataExplorer;
  public navItems: SideNavigationExtension[] = [];

  constructor(
    private readonly systemInfoService: SystemInfoService,
    private readonly userModelService: UserModelService,
    private readonly dataExplorerRegistryService: DataExplorerRegistryService,
    private cdref: ChangeDetectorRef
  ) {}

  public async ngOnInit(): Promise<void> {
    await this.loadNavItems();
  }

  private async loadNavItems(): Promise<void> {
    const systemInfo = await this.systemInfoService.get();
    const features = (await this.userModelService.getFeatures()).Features;
    const groups = (await this.userModelService.getGroups()).map((group) => group.Name || '');
    this.navItems = this.dataExplorerRegistryService.getNavItems(systemInfo.PreProps, features, undefined, groups);
    this.cdref.detectChanges();
  }
}
