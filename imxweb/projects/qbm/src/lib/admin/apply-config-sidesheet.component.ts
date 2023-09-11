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

import { Component } from "@angular/core";
import { EuiSidesheetRef } from "@elemental-ui/core";
import { ConfigService } from "./config.service";

@Component({
  templateUrl: './apply-config-sidesheet.component.html',
  styleUrls: ['./apply-config-sidesheet.component.scss']
})
export class ApplyConfigSidesheetComponent {

  constructor(private readonly configSvc: ConfigService,
    private readonly sideSheetRef: EuiSidesheetRef,
  ) { 
    this.isGlobal = !configSvc.supportsLocalCustomization;
  }

  public isGlobal: boolean = false;

  public get supportsLocalCustomizations() {
    return this.configSvc.supportsLocalCustomization;
  }

  public submit() {
    this.configSvc.submit(this.isGlobal);
    this.sideSheetRef.close();
  }

  public LdsApplyLocally = '#LDS#Use this setting if you want to try configuration changes only on this server. The changes are reset when you restart the server.';

  public LdsApplyGlobally = '#LDS#Use this setting if you want to apply the configuration changes globally. The changes are stored in the global configuration file and distributed to all API servers.';

  public LdsApplyLocallyNotPossible = '#LDS#This option has been disabled by your administrator.';

  public get pendingChanges(): string[][] {
    return this.configSvc.getPendingChanges();
  }
}