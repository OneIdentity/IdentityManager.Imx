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

import { Component, Inject, OnDestroy } from '@angular/core';
import { EuiDownloadOptions, EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { Subscription } from 'rxjs';

import { PortalPolicies } from 'imx-api-pol';
import { DisplayColumns } from 'imx-qbm-dbts';
import { BaseReadonlyCdr, ColumnDependentReference, ElementalUiConfigService } from 'qbm';
import { PoliciesService } from '../policies.service';

@Component({
  selector: 'imx-policies-sidesheet',
  templateUrl: './policies-sidesheet.component.html',
  styleUrls: ['./policies-sidesheet.component.scss'],
})
export class PoliciesSidesheetComponent implements OnDestroy {
  public reportDownload: EuiDownloadOptions;
  public cdrList: ColumnDependentReference[];
  public uidNonCompliance: string;
  public uidCompliance: string;

  public subscriptions$: Subscription[] = [];

  constructor(
    @Inject(EUI_SIDESHEET_DATA)
    public data: {
      selectedPolicy: PortalPolicies;
      hasRiskIndex: boolean;
      isMControlPerViolation: boolean;
    },
    public sidesheetRef: EuiSidesheetRef,
    private readonly policiesProvider: PoliciesService,
    elementalUiConfigService: ElementalUiConfigService
  ) {
    this.uidCompliance = data.selectedPolicy.GetEntity().GetKeys().join(',');
    this.cdrList = [
      new BaseReadonlyCdr(this.data.selectedPolicy.GetEntity().GetColumn(DisplayColumns.DISPLAY_PROPERTYNAME)),
      new BaseReadonlyCdr(this.data.selectedPolicy.Description.Column),
      new BaseReadonlyCdr(this.data.selectedPolicy.IsExceptionAllowed.Column),
      new BaseReadonlyCdr(this.data.selectedPolicy.IsInActive.Column),
      data.hasRiskIndex ? new BaseReadonlyCdr(this.data.selectedPolicy.RiskIndex.Column) : null,
      new BaseReadonlyCdr(this.data.selectedPolicy.RuleSeverity.Column),
      new BaseReadonlyCdr(this.data.selectedPolicy.RuleViolationThreshold.Column),
      new BaseReadonlyCdr(this.data.selectedPolicy.SignificancyClass.Column),
      new BaseReadonlyCdr(this.data.selectedPolicy.TransparencyIndex.Column),
      new BaseReadonlyCdr(this.data.selectedPolicy.UID_QERPolicyGroup.Column),
    ].filter((elem) => elem != null);

    this.reportDownload = {
      ...elementalUiConfigService.Config.downloadOptions,
      url: this.policiesProvider.policyReport(this.uidCompliance),
    };
  }

  public get objectType(): string {
    return this.data.selectedPolicy.GetEntity().TypeName;
  }

  public get objectUid(): string {
    return this.data.selectedPolicy.GetEntity().GetKeys().join(',');
  }

  public ngOnDestroy(): void {
    this.subscriptions$.map((sub) => sub.unsubscribe());
  }
}
