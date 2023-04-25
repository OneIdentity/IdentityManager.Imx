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
 * Copyright 2022 One Identity LLC.
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

import { Component, Inject } from '@angular/core';
import { EuiDownloadOptions, EUI_SIDESHEET_DATA } from '@elemental-ui/core';

import { PortalRules } from 'imx-api-cpl';
import { DisplayColumns } from 'imx-qbm-dbts';
import { BaseReadonlyCdr, ColumnDependentReference, ElementalUiConfigService } from 'qbm';
import { RulesService } from '../rules.service';

@Component({
  selector: 'imx-rules-sidesheet',
  templateUrl: './rules-sidesheet.component.html',
  styleUrls: ['./rules-sidesheet.component.scss']
})
export class RulesSidesheetComponent {

  public reportDownload: EuiDownloadOptions;
  public cdrList: ColumnDependentReference[];
  constructor(
    @Inject(EUI_SIDESHEET_DATA) public data: {
      selectedRule: PortalRules,
      hasRiskIndex: boolean
    },
    private readonly rulesProvider: RulesService,
    elementalUiConfigService: ElementalUiConfigService,
  ) {
    this.cdrList = [
      new BaseReadonlyCdr(this.data.selectedRule.GetEntity().GetColumn(DisplayColumns.DISPLAY_PROPERTYNAME)),
      new BaseReadonlyCdr(this.data.selectedRule.Description.Column),
      new BaseReadonlyCdr(this.data.selectedRule.RuleNumber.Column),
      data.hasRiskIndex ? new BaseReadonlyCdr(this.data.selectedRule.RiskIndex.Column) : null,
      data.hasRiskIndex && this.data.selectedRule.RiskIndex.value !== this.data.selectedRule.RiskIndexReduced.value ?
        new BaseReadonlyCdr(this.data.selectedRule.RiskIndexReduced.Column) : null,
      new BaseReadonlyCdr(this.data.selectedRule.IsInActive.Column),
      new BaseReadonlyCdr(this.data.selectedRule.CountOpen.Column),
      new BaseReadonlyCdr(this.data.selectedRule.CountClosed.Column)
    ].filter(elem => elem != null);

    this.reportDownload = {
      ...elementalUiConfigService.Config.downloadOptions,
      url: this.rulesProvider.ruleReport(data.selectedRule.GetEntity().GetKeys()[0]),
    };
  }
}
