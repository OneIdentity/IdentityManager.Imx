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
  templateUrl: './convert-config-sidesheet.component.html',
  styleUrls: ['./convert-config-sidesheet.component.scss']
})
export class ConvertConfigSidesheetComponent {

  constructor(private readonly configSvc: ConfigService,
    private readonly sideSheetRef: EuiSidesheetRef,
  ) {
    this.customizationsToConvert = this.configSvc.getLocalCustomizations();
  }

  public isGlobal: boolean = false;

  public customizationsToConvert: string[][];

  public submit() {
    this.configSvc.convert();
    this.sideSheetRef.close();
  }

  public LdsInfoText = '#LDS#You can globally apply the following configuration changes that are currently used locally. The changes are stored in the global configuration file and distributed to all API Servers.';
}