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

import { Component, OnInit, Input } from "@angular/core";
import { PackageInfo } from "imx-api-qbm";
import { AppConfigService } from "../appConfig/appConfig.service";
import { imx_SessionService } from "../session/imx-session.service";
import { SideNavigationComponent } from "../side-navigation-view/side-navigation-view-interfaces";

type ExtendedPackageInfo = PackageInfo & { App?: string };

@Component({
  templateUrl: './packages.component.html',
  selector: 'imx-packages',
  styleUrls: ['./packages.component.scss']
})
export class PackagesComponent implements OnInit, SideNavigationComponent {
  @Input() public isAdmin: boolean;

  constructor(private readonly session: imx_SessionService,
    private readonly appConfigService: AppConfigService) {
  }

  public busy = true;
  public displayedColumns: string[] = ['Name', 'App', 'RelativePath', 'LastChangeDate', 'Fingerprint'];
  public packages: ExtendedPackageInfo[] = [];

  public async ngOnInit(): Promise<void> {
    try {
      this.packages = await this.session.Client.admin_packages_get();
      const apps = await this.session.Client.imx_applications_get();
      for (var p of this.packages) {
        p.Fingerprint = p.Fingerprint.substring(0, 8);

        var app = apps.filter(a => a.Name == p.Name);
        if (app.length > 0)
          p.App = app[0].DisplayName;
      }

    } finally {
      this.busy = false;
    }
  }

  public getAppHref(packageInfo: PackageInfo) {
    return this.appConfigService.BaseUrl + '/html/' + packageInfo.Name;
  }
}
