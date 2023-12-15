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

import { Component, OnInit } from '@angular/core';
import { PortalRules, PortalRulesViolations } from 'imx-api-cpl';
import { ByAbilityResult, ByRoleResult, PortalTargetsystemSapuser } from 'imx-api-sac';
import { SapComplianceApiService } from '../sac-api-client.service';
import { SapSelectionOptions, SapSelectionTypeEnum } from './sap-compliance-violation.model';

@Component({
  templateUrl: './sap-compliance-violation.component.html',
  styleUrls: ['./sap-compliance-violation.component.scss'],
})
export class SapComplianceViolationComponent implements OnInit {
  public data: {
    selectedRulesViolation: PortalRulesViolations;
    complianceRule: PortalRules;
  };
  public accounts: PortalTargetsystemSapuser[] = [];
  public resultByRole: ByRoleResult = { Elements: [] };
  public resultByAbility: ByAbilityResult = { Data: [] };
  public selectionOptions: SapSelectionOptions[] = [
    { value: SapSelectionTypeEnum.ROLE, label: '#LDS#By role' },
    { value: SapSelectionTypeEnum.ABILITY, label: '#LDS#By ability' },
  ];
  public selectedOption: SapSelectionTypeEnum = SapSelectionTypeEnum.ROLE;
  public loading = false;
  public sapSelectionTypeEnum = SapSelectionTypeEnum;
  public selectedAccount: PortalTargetsystemSapuser;

  constructor(private readonly api: SapComplianceApiService) {}

  async ngOnInit(): Promise<void> {
    this.loading = true;
    const uidPerson = this.data.selectedRulesViolation.UID_Person.value;
    this.accounts = (
      await this.api.typedClient.PortalTargetsystemSapuser.Get({
        UID_PersonAssociated: uidPerson,
      })
    ).Data;
    if (this.accounts.length > 0 && !!this.data.complianceRule?.EntityKeysData?.Keys?.[0]) {
      this.selectedAccount = this.accounts[0];
      await this.loadResult();
    }
    this.loading = false;
  }

  public onSelectionChange(option: SapSelectionOptions) {
    this.selectedOption = option.value;
  }
  public isOptionSelected(value: SapSelectionTypeEnum): boolean {
    return value === this.selectedOption;
  }
  public onUserOptionSelected(): void {
    this.loadResult();
  }
  public get showNoData(): boolean {
    const roleLength = this.resultByRole?.Elements?.length || 0;
    const abilityLength = this.resultByAbility?.Data?.length || 0;
    return (
      !this.loading &&
      ((this.isOptionSelected(this.sapSelectionTypeEnum.ROLE) && roleLength == 0) ||
        (this.isOptionSelected(this.sapSelectionTypeEnum.ABILITY) && abilityLength == 0))
    );
  }
  public get hideChips(): boolean {
    return this.resultByRole?.Elements?.length == 0 && this.resultByAbility?.Data?.length == 0;
  }
  private async loadResult(): Promise<void> {
    this.loading = true;
    const uidsapuser = this.selectedAccount.GetEntity().GetKeys()[0];
    this.resultByAbility = await this.api.client.portal_sap_ruleanalysis_fld_get(
      uidsapuser,
      this.data.complianceRule?.EntityKeysData?.Keys?.[0]
    );
    this.resultByRole = await this.api.client.portal_sap_ruleanalysis_byrole_get(
      uidsapuser,
      this.data.complianceRule?.EntityKeysData?.Keys?.[0]
    );
    this.loading = false;
  }
}
