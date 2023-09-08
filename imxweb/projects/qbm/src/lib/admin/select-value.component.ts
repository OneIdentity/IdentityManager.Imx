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

import { Component, Input, OnInit } from "@angular/core";
import { ConfigSettingValidValue } from "imx-api-qbm";
import { imx_SessionService } from "../session/imx-session.service";
import { KeyData } from "./config-section";
import { ConfigService } from "./config.service";

@Component({
  templateUrl: './select-value.component.html',
  styles: ['.wide-field {min-width:450px;}'],
  selector: 'imx-config-select'
})
export class SelectValueComponent implements OnInit {

  constructor(private readonly session: imx_SessionService, public readonly configSvc: ConfigService) { }

  async ngOnInit(): Promise<void> {
    this.validvalues = await this.session.Client.admin_apiconfig_values_get(this.configSvc.appId, this.conf.Path);
  }

  @Input() conf: KeyData;

  public validvalues: ConfigSettingValidValue[] = [];

}