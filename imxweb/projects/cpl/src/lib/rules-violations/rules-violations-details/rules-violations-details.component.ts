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

import { Component, Inject, OnDestroy, OnInit, Type, ViewChild } from '@angular/core';
import { EUI_SIDESHEET_DATA, EuiSidesheetRef } from '@elemental-ui/core';

import { MatTabGroup } from '@angular/material/tabs';
import { TranslateService } from '@ngx-translate/core';
import { PortalRules } from 'imx-api-cpl';
import { BaseCdr, ExtService, IExtension } from 'qbm';
import { Subscription } from 'rxjs';
import { RulesViolationsActionService } from '../rules-violations-action/rules-violations-action.service';
import { RulesViolationsApproval } from '../rules-violations-approval';

export class baseComplienceClass {
  public data: {
    selectedRulesViolation: RulesViolationsApproval;
  };
}
export interface DynamicTabItem extends IExtension {
  instance: Type<baseComplienceClass>;
}
/**
 * A sidesheet component to show some information about the selected rules violation.
 */
@Component({
  selector: 'imx-rules-violations-details',
  templateUrl: './rules-violations-details.component.html',
  styleUrls: ['./rules-violations-details.component.scss'],
})
export class RulesViolationsDetailsComponent implements OnInit, OnDestroy {
  @ViewChild(MatTabGroup) public matTabGroup: MatTabGroup;

  public cdrList: BaseCdr[] = [];
  public uidPerson: string;
  public uidNonCompliance: string;
  public uidCompliance: string;
  public ruleInfoCdrList: BaseCdr[] = [];
  private subscriptions$: Subscription[] = [];

  constructor(
    @Inject(EUI_SIDESHEET_DATA)
    public data: {
      selectedRulesViolation: RulesViolationsApproval;
      isMControlPerViolation: boolean;
      complianceRule: PortalRules;
    },
    public sidesheetRef: EuiSidesheetRef,
    private readonly actionService: RulesViolationsActionService,
    private readonly extService: ExtService,
    private translateService: TranslateService
  ) {
    this.uidPerson = data.selectedRulesViolation.GetEntity().GetColumn('UID_Person').GetValue();
    this.uidNonCompliance = data.selectedRulesViolation.GetEntity().GetColumn('UID_NonCompliance').GetValue();
    this.cdrList = data.selectedRulesViolation.propertyInfo;
    if (this.data.complianceRule)
      this.ruleInfoCdrList.push(
        new BaseCdr(this.data.complianceRule.Description.Column, this.translateService.instant('#LDS#Rule description')),
        new BaseCdr(this.data.complianceRule.RuleNumber.Column)
      );
  }

  public ngOnInit(): void {
    this.subscriptions$.push(
      this.sidesheetRef.componentInstance.onOpen().subscribe(() => {
        // Recalculates header
        this.matTabGroup.updatePagination();
      })
    );
  }

  /**
   * Opens the Approve-Sidesheet for the current selected rules violations and closes the sidesheet afterwards.
   */
  public async approve(): Promise<void> {
    await this.actionService.approve([this.data.selectedRulesViolation]);
    return this.sidesheetRef.close(true);
  }

  /**
   * Opens the Deny-Sidesheet for the current selected rules violations and closes the sidesheet afterwards.
   */
  public async deny(): Promise<void> {
    await this.actionService.deny([this.data.selectedRulesViolation]);
    return this.sidesheetRef.close(true);
  }

  public async resolve(): Promise<void> {
    await this.actionService.resolve(this.data.selectedRulesViolation);
    return this.sidesheetRef.close(true);
  }

  public get showDynamicTab(): boolean {
    return this.extService.Registry['RuleViolationsTab'] && this.extService.Registry['RuleViolationsTab'].length > 0;
  }

  public ngOnDestroy(): void {
    this.subscriptions$.map((sub) => sub.unsubscribe());
  }
}
