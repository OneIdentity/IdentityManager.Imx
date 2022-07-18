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

import { ReportsService } from './reports.service';
import { Component, ViewChild } from '@angular/core';
import { EuiSelectOption, EuiLoadingService, EuiSelectComponent, EuiDownloadOptions } from '@elemental-ui/core';
import {
  PortalTargetsystemUnsAccount,
  PortalTargetsystemUnsContainer,
  PortalTargetsystemUnsGroup,
  PortalTargetsystemUnsSystem,
} from 'imx-api-arc';
import { EntityData } from 'imx-qbm-dbts';
import { IdentitiesReportsService } from 'qer';
import { AccountsReportsService, GroupsReportsService } from 'tsb';
import { OverlayRef } from '@angular/cdk/overlay';
import { ElementalUiConfigService } from 'qbm';

@Component({
  selector: 'imx-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
})
export class ReportsComponent {
  public reportCategory: string;
  public reportType: string;
  public reportTypeOptions: { display: string; value: string }[] = [];
  public param = '';
  public historyDays = 30;

  public paramList: EuiSelectOption[] = [];
  public paramSelectPending = false;

  public downloadOptions: EuiDownloadOptions;

  @ViewChild('paramselect', { static: false }) public paramselect: EuiSelectComponent;

  private accountTableName: string;

  constructor(
    private reports: ReportsService,
    private readonly elementalUiConfigService: ElementalUiConfigService,
    private identitiesReports: IdentitiesReportsService,
    private accountsReports: AccountsReportsService,
    private groupsReports: GroupsReportsService,
    private loader: EuiLoadingService
  ) { }

  public get reportParam(): string {
    switch (this.reportType) {
      case 'persons':
      case 'personsManaged':
      case 'accountsOwnedByPerson':
      case 'accountsOwnedByManaged':
      case 'groupsOwnedByPerson':
        return 'person';
      case 'accounts':
        return 'account';
      case 'accountsByRoot':
      case 'groupsByRoot':
        return 'authority';
      case 'accountsByContainer':
      case 'groupsByContainer':
        return 'container';
      case 'groupsByGroup':
        return 'group';
    }
  }

  public get paramSelectLabel(): string {
    switch (this.reportParam) {
      case 'person':
        return '#LDS#Select an identity';
      case 'account':
        return '#LDS#Select a user account';
      case 'authority':
        return '#LDS#Select a domain';
      case 'container':
        return '#LDS#Select a container';
      case 'group':
        return '#LDS#Select a system entitlement';
    }
  }

  public reportCategoryChange(): void {
    this.reportType = undefined;
    this.clearParam();

    switch (this.reportCategory) {
      case 'identities':
        this.setIdentitiesReportTypeOptions();
        break;
      case 'accounts':
        this.setAccountsReportTypeOptions();
        break;
      case 'groups':
        this.setGroupsReportTypeOptions();
        break;
    }
  }

  public reportTypeChange(filtering?: boolean, search?: string): void {
    if (!filtering) {
      this.clearParam();
    }
    this.paramSelectPending = true;
    this.accountTableName = undefined;
    let getReportData: Promise<any>;
    switch (this.reportParam) {
      case 'person':
        getReportData = this.identitiesReports.personData(search);
        break;
      case 'account':
        getReportData = this.accountsReports.accountData(search);
        break;
      case 'group':
        getReportData = this.groupsReports.groupData(search);
        break;
      default:
        getReportData = this.reports[`${this.reportParam}Data`](search);
    }

    this.handleReportTypeChange(getReportData, filtering);
  }

  public paramListFilter(): boolean {
    return true;
  }

  public paramSelected(selected: EuiSelectOption): void {
    this.param = selected.value;

    let url = '';

    switch (this.reportCategory) {
      case 'identities':
        url = this.identitiesReports[`${this.reportType}Report`](this.historyDays, this.param);
        break;
      case 'accounts':
        url = this.accountsReports[`${this.reportType}Report`](this.historyDays, this.param, this.accountTableName);
        break;
      case 'groups':
        url = this.groupsReports[`${this.reportType}Report`](this.historyDays, this.param);
        break;
    }

    this.downloadOptions = {
      ... this.elementalUiConfigService.Config.downloadOptions,
      url
    };
  }

  private setIdentitiesReportTypeOptions(): void {
    this.reportTypeOptions = [
      { display: '#LDS#Specific identity', value: 'persons' },
      { display: '#LDS#Identities reporting to a specific identity', value: 'personsManaged' },
    ];
  }

  private setAccountsReportTypeOptions(): void {
    this.reportTypeOptions = [
      { display: '#LDS#Specific user account', value: 'accounts' },
      { display: '#LDS#User accounts owned by a specific identity', value: 'accountsOwnedByPerson' },
      {
        display: '#LDS#User accounts where an identity is managed by a specific identity',
        value: 'accountsOwnedByManaged',
      },
      { display: '#LDS#User accounts in a domain', value: 'accountsByRoot' },
      { display: '#LDS#User accounts in a container', value: 'accountsByContainer' },
    ];
  }

  private setGroupsReportTypeOptions(): void {
    this.reportTypeOptions = [
      { display: '#LDS#Specific system entitlement', value: 'groupsByGroup' },
      { display: '#LDS#System entitlements in a domain', value: 'groupsByRoot' },
      { display: '#LDS#System entitlements in a container', value: 'groupsByContainer' },
      { display: '#LDS#System entitlements owned by a specific identity', value: 'groupsOwnedByPerson' },
    ];
  }

  private convertToEuiSelectOption(data: any): EuiSelectOption {
    switch (this.reportParam) {
      case 'person':
        const person: EntityData = data;
        return { display: person.Display, value: person.Keys[0] };
      case 'account':
        const account: PortalTargetsystemUnsAccount = data;
        return { display: account.GetEntity().GetDisplay(), value: account.GetEntity().GetKeys()[0] };
      case 'authority':
        const authority: PortalTargetsystemUnsSystem = data;
        return { display: authority.GetEntity().GetDisplay(), value: authority.GetEntity().GetKeys()[0] };
      case 'container':
        const container: PortalTargetsystemUnsContainer = data;
        return { display: container.GetEntity().GetDisplay(), value: container.GetEntity().GetKeys()[0] };
      case 'group':
        const group: PortalTargetsystemUnsGroup = data;
        return { display: group.GetEntity().GetDisplay(), value: group.GetEntity().GetKeys()[0] };
    }
  }

  private clearParam(): void {
    this.param = '';
    setTimeout(() => {
      if (this.paramselect) {
        this.paramselect.searchInput.clearSearch();
        this.paramselect.clearSelectionsInside();
      }
    });
  }

  private handleReportTypeChange(getReportData: Promise<any>, filtering: boolean): Promise<any> {
    let loaderRef: OverlayRef;
    if (!filtering) {
      loaderRef = this.loader.show();
    }
    return getReportData.then((result) => {
      const personRelatedData =
        this.reportCategory === 'identities' ||
        this.reportType === 'groupsOwnedByPerson' ||
        this.reportType === 'accountsOwnedByPerson' ||
        this.reportType === 'accountsOwnedByManaged';
      const data = personRelatedData ? result.Entities : result.Data;

      this.accountTableName = this.reportType === 'accounts' ? result.tableName : undefined;

      this.paramList = data.map((d) => {
        return this.convertToEuiSelectOption(d);
      });
    }).finally(() => {
      this.loader.hide(loaderRef);
      this.paramSelectPending = false;
    });
  }
}
