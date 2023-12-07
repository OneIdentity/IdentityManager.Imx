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

import { Component, Input } from "@angular/core";
import { PortalPersonOrgdata } from "imx-api-qer";
import { XOrigin } from "imx-qbm-dbts";
import { OrgChartService } from "./org-chart.service";
import { TranslateService } from "@ngx-translate/core";

@Component({
  styleUrls: ['./identity.component.scss'],
  selector: 'imx-orgchart-identity',
  templateUrl: './identity.component.html'
})
export class IdentityComponent {
  constructor(public readonly orgChartService: OrgChartService,
    private readonly translator: TranslateService
  ) { }

  @Input() public identity: PortalPersonOrgdata;

  isExternal() {
    return this.identity.IsExternal.value;
  }

  isDelegated() {
    // TODO: this is not correct. the relationship is "Ordered" but it may be something
    // different than delegation
    return (this.identity.XOrigin.value & XOrigin.Ordered) == XOrigin.Ordered;
  }

  buildSubTitle(): string {
    var strings = [];
    if (this.isExternal()) {
      strings.push(this.translator.instant('#LDS#External'));
    }
    if (this.isDelegated()) {
      strings.push(this.translator.instant('#LDS#Delegated'));
    }
    var title = this.identity.PersonalTitle.Column.GetDisplayValue();
    if (title && title.trim().length > 0) {
      strings.push(title);
    }
    var employeeType = this.identity.EmployeeType.Column.GetDisplayValue();
    if (employeeType && employeeType.trim().length > 0) {
      strings.push(employeeType);
    }

    return strings.length > 0 ? strings.reduce((a, b) => a + ", " + b) : '';
  }
}