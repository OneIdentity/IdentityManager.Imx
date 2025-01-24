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

import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { OverlayRef } from '@angular/cdk/overlay';
import { EuiDownloadOptions, EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { MatButton } from '@angular/material/button';

import {
  ClassloggerService,
  ConfirmationService,
  DataSourceToolbarFilter,
  DataSourceToolbarGroupData,
  DataSourceToolbarSettings,
  DataTableGroupedData,
  ClientPropertyForTableColumns,
  SettingsService,
  SnackBarService,
  SystemInfoService,
  createGroupData,
  DataSourceToolbarViewConfig,
  BusyService,
} from 'qbm';
import { DisplayColumns, ValType, ExtendedTypedEntityCollection, EntitySchema, FilterType, CompareOperator, DataModel } from 'imx-qbm-dbts';
import { PolicyFilterData, PortalAttestationPolicy, PortalAttestationPolicyEdit } from 'imx-api-att';
import { UserModelService, ViewConfigService } from 'qer';
import { PolicyService } from '../policy.service';
import { EditMasterDataComponent } from '../edit-master-data/edit-master-data.component';
import { AttestationCasesComponentParameter } from '../attestation-cases/attestation-cases-component-parameter.interface';
import { AttestationCasesComponent } from '../attestation-cases/attestation-cases.component';
import { PolicyLoadParameters } from './policy-load-parameters.interface';
import { AttestationPolicy } from './attestation-policy';
import { PolicyDetailsComponent } from '../policy-details/policy-details.component';
import { PolicyCopyData } from '../policy.interface';
import { ViewConfigData } from 'imx-api-qer';

@Component({
  templateUrl: './policy-list.component.html',
  styleUrls: ['./policy-list.component.scss'],
})
export class PolicyListComponent implements OnInit {
  @ViewChild('deleteButton') public deleteButton: MatButton;

  public dstSettings: DataSourceToolbarSettings;
  public navigationState: PolicyLoadParameters;
  public readonly entitySchemaPolicy: EntitySchema;
  public readonly DisplayColumns = DisplayColumns;
  public groupedData: { [key: string]: DataTableGroupedData } = {};
  public isComplienceFrameworkEnabled = false;
  public busyService = new BusyService();
  public menuLoading = false;
  private groupData: DataSourceToolbarGroupData;

  private filterOptions: DataSourceToolbarFilter[] = [];
  private prefilterOwner = false;
  private readonly displayedColumns: ClientPropertyForTableColumns[];
  private dataModel: DataModel;
  private viewConfig: DataSourceToolbarViewConfig;
  private viewConfigPath = 'attestation/policy';

  constructor(
    private readonly elementalBusyService: EuiLoadingService,
    private readonly policyService: PolicyService,
    private readonly viewConfigService: ViewConfigService,
    private readonly confirmationService: ConfirmationService,
    private readonly snackbar: SnackBarService,
    private readonly translator: TranslateService,
    private readonly sideSheet: EuiSidesheetService,
    private readonly userService: UserModelService,
    private readonly systemInfoService: SystemInfoService,
    private readonly settingsService: SettingsService,
    private readonly changeDetector: ChangeDetectorRef,
    private readonly logger: ClassloggerService
  ) {
    this.navigationState = { PageSize: this.settingsService.DefaultPageSize, StartIndex: 0 };
    this.entitySchemaPolicy = policyService.AttestationPolicySchema;
    this.displayedColumns = [
      this.entitySchemaPolicy.Columns[DisplayColumns.DISPLAY_PROPERTYNAME],
      this.entitySchemaPolicy.Columns.NextRun,
      {
        ColumnName: 'actions',
        Type: ValType.String,
        afterAdditionals: true,
        untranslatedDisplay: '#LDS#Actions',
      },
    ];
  }

  public async ngOnInit(): Promise<void> {
    const isBusy = this.busyService.beginBusy();
    let features: string[];
    let prep: string[];
    try {
      this.dataModel = await this.policyService.getDataModel();
      features = (await this.userService.getFeatures()).Features;
      prep = (await this.systemInfoService.get()).PreProps;

      this.prefilterOwner = !this.policyService.canSeeAllAttestations(prep, features);
      this.isComplienceFrameworkEnabled = await this.policyService.isComplienceFrameworkEnabled();
      await this.initFilterAndGrouping();
    } finally {
      isBusy.endBusy();
    }
    await this.navigate(true);
  }

  public async updateConfig(config: ViewConfigData): Promise<void> {
    await this.viewConfigService.putViewConfig(config);
    this.viewConfig = await this.viewConfigService.getDSTExtensionChanges(this.viewConfigPath);
    this.dstSettings.viewConfig = this.viewConfig;
  }

  public async deleteConfigById(id: string): Promise<void> {
    await this.viewConfigService.deleteViewConfig(id);
    this.viewConfig = await this.viewConfigService.getDSTExtensionChanges(this.viewConfigPath);
    this.dstSettings.viewConfig = this.viewConfig;
  }

  public async onNavigationStateChanged(newState: PolicyLoadParameters): Promise<void> {
    this.navigationState = newState;
    this.logger.trace(this, 'navigation state change to ', this.navigationState);
    await this.navigate();
  }

  public async onSearch(keywords: string): Promise<void> {
    this.policyService.abortCall();
    this.navigationState = {
      ...this.navigationState,
      ...{
        StartIndex: 0,
        search: keywords,
      },
    };
    this.logger.trace(this, 'navigation state change to ', this.navigationState);
    return this.navigate();
  }

  public async onGroupingChange(groupInfo: { key: string; isInitial: boolean }): Promise<void> {
    const isBusy = this.busyService.beginBusy();

    try {
      const groupedData = this.groupedData[groupInfo.key];
      groupedData.data = groupInfo.isInitial
        ? { totalCount: 0, Data: [] }
        : await this.policyService.getPolicies(groupedData.navigationState);
      groupedData.settings = {
        displayedColumns: this.dstSettings.displayedColumns,
        dataModel: this.dstSettings.dataModel,
        dataSource: groupedData.data,
        entitySchema: this.dstSettings.entitySchema,
        navigationState: groupedData.navigationState,
      };
    } finally {
      isBusy.endBusy();
    }
  }

  public async menuOpened(policy: AttestationPolicy): Promise<void> {
    policy.hasAttestations = true;
    this.menuLoading = true;
    try {
      const count = await this.policyService.getRunCountForPolicy(policy.GetEntity().GetKeys()[0]);
      policy.hasAttestations = count > 0;
    } finally {
      this.menuLoading = false;
      this.changeDetector.detectChanges();
    }
  }

  public async editPolicy(policy: PortalAttestationPolicy): Promise<void> {
    let data: ExtendedTypedEntityCollection<PortalAttestationPolicyEdit, {}>;

    let overlayRef: OverlayRef;
    setTimeout(() => (overlayRef = this.elementalBusyService.show()));
    try {
      data = await this.policyService.getPolicyEditInteractive(policy.GetEntity().GetKeys()[0]);
    } finally {
      setTimeout(() => this.elementalBusyService.hide(overlayRef));
      if (data && data.Data.length > 0) {
        await this.showPolicy(
          data.Data[0],
          data.extendedData[0],
          await this.translator.get('#LDS#Heading Edit Attestation Policy').toPromise(),
          false
        );
      }
    }
  }

  public async newPolicy(): Promise<void> {
    let policy: PolicyCopyData;
    let overlayRef: OverlayRef;
    setTimeout(() => (overlayRef = this.elementalBusyService.show()));
    try {
      policy = await this.policyService.buildNewEntity();
      this.logger.trace(this, 'new policy created', policy);
    } finally {
      setTimeout(() => this.elementalBusyService.hide(overlayRef));
      if (policy) {
        await this.showPolicy(
          policy.data,
          {
            IsReadOnly: false,
            Filter: { Elements: [], ConcatenationType: 'OR' },
            InfoDisplay: [],
          },
          await this.translator.get('#LDS#Heading Create Attestation Policy').toPromise(),
          true
        );
      }
    }
  }

  public async copy(policy: PortalAttestationPolicy): Promise<void> {
    let newPolicy: PolicyCopyData;
    let filter: PolicyFilterData;
    let overlayRef: OverlayRef;
    setTimeout(() => (overlayRef = this.elementalBusyService.show()));
    try {
      const data = await this.policyService.getPolicyEditInteractive(policy.GetEntity().GetKeys()[0]);

      if (data == null || data.Data.length === 0) {
        return this.newPolicy();
      }

      newPolicy = await this.policyService.buildNewEntity(data.Data[0], data.extendedData[0]?.Filter);
      filter = data.extendedData[0];
      this.logger.trace(this, 'copy for policy (old, new)', data, newPolicy);
    } finally {
      setTimeout(() => this.elementalBusyService.hide(overlayRef));
      if (newPolicy) {
        await this.showPolicy(
          newPolicy.data,
          filter,
          await this.translator.get('#LDS#Heading Copy Attestation Policy').toPromise(),
          true,
          newPolicy.pickCategorySkipped
        );
      }
    }
  }

  public async delete(policy: PortalAttestationPolicy): Promise<void> {
    if (
      await this.confirmationService.confirm({
        Title: '#LDS#Heading Delete Attestation Policy',
        Message: '#LDS#Are you sure you want to delete the attestation policy?',
      })
    ) {
      const isBusy = this.busyService.beginBusy();

      try {
        const key = policy.GetEntity().GetKeys()[0];
        await this.policyService.deleteAttestationPolicy(key);
        this.logger.debug(this, `policy ${key} deleted`);
      } finally {
        isBusy.endBusy();
      }
      const message = {
        key: '#LDS#The attestation policy "{0}" has been successfully deleted.',
        parameters: [policy.GetEntity().GetDisplay()],
      };
      this.navigate();
      this.snackbar.open(message, '#LDS#Close');
    }
  }

  public getReportOptions(policy: PortalAttestationPolicy): EuiDownloadOptions {
    return this.policyService.getReportDownloadOptions(policy.GetEntity().GetKeys()[0], policy.GetEntity().GetDisplay());
  }

  public async run(policy: PortalAttestationPolicy): Promise<void> {
    let data: AttestationCasesComponentParameter;
    let overlayRef: OverlayRef;
    setTimeout(() => (overlayRef = this.elementalBusyService.show()));
    try {
      const policyEdit = await this.policyService.getPolicyEditInteractive(policy.GetEntity().GetKeys()[0]);
      this.logger.trace(this, 'interactive policy loaded', policyEdit);

      if (policyEdit == null || policyEdit.Data.length === 0) {
        return;
      }

      const ext = policyEdit.extendedData;
      data = {
        uidobject: policyEdit.Data[0].UID_AttestationObject.value,
        uidPickCategory: policyEdit.Data[0].UID_QERPickCategory.value,
        filter: ext != null ? ext[0]?.Filter.Elements : null,
        concat: ext != null ? ext[0]?.Filter.ConcatenationType : null,
        canCreateRuns: true,
        uidpolicy: policy.GetEntity().GetKeys()[0],
        subtitle: policy.GetEntity().GetDisplay(),
      };
    } finally {
      setTimeout(() => this.elementalBusyService.hide(overlayRef));
    }

    if (data) {
      const result = await this.sideSheet
        .open(AttestationCasesComponent, {
          title: await this.translator.get('#LDS#Heading Start Attestation').toPromise(),
          subTitle: policy.GetEntity().GetDisplay(),
          padding: '0px',
          width: 'max(600px, 60%)',
          data,
          testId: 'policy-list-start-attestation-run-sidesheet',
        })
        .afterClosed()
        .toPromise();

      if (result) {
        this.navigate();
      }
    }
  }

  public async showDetails(policy: PortalAttestationPolicy): Promise<void> {
    let singlePolicy: PortalAttestationPolicy;
    let overlayRef: OverlayRef;
    setTimeout(() => (overlayRef = this.elementalBusyService.show()));
    try {
      const policies = await this.policyService.getPolicies({
        filter: [
          {
            ColumnName: 'UID_AttestationPolicy',
            Type: FilterType.Compare,
            CompareOp: CompareOperator.Equal,
            Value1: policy.GetEntity().GetKeys()[0],
          },
        ],
      });
      singlePolicy = policies.Data.length > 0 ? policies.Data[0] : undefined;
    } finally {
      setTimeout(() => this.elementalBusyService.hide(overlayRef));
    }
    if (singlePolicy) {
      this.sideSheet.open(PolicyDetailsComponent, {
        title: await this.translator.get('#LDS#Heading View Attestation Runs').toPromise(),
        subTitle: singlePolicy.GetEntity().GetDisplay(),
        padding: '0px',
        width: 'max(600px, 60%)',
        data: { policy: singlePolicy },
        testId: 'policy-list-view-details-sidesheet',
      });
    }
  }

  private async navigate(isInitialLoad: boolean = false): Promise<void> {
    const isBusy = this.busyService.beginBusy();

    try {
      const policies = isInitialLoad ? { totalCount: 0, Data: [] } : await this.policyService.getPolicies(this.navigationState);
      if (policies) {
        const exportMethod = this.policyService.exportPolicies(this.navigationState);
        this.logger.trace(this, 'interactive policy loaded', policies);

        this.dstSettings = {
          displayedColumns: this.displayedColumns,
          dataSource: policies,
          filters: this.filterOptions,
          groupData: this.groupData,
          entitySchema: this.entitySchemaPolicy,
          navigationState: this.navigationState,
          dataModel: this.dataModel,
          viewConfig: this.viewConfig,
          exportMethod,
        };
      }
    } finally {
      isBusy.endBusy();
    }
  }

  private async showPolicy(
    policy: PortalAttestationPolicyEdit,
    filterData: PolicyFilterData,
    display: string,
    isNew: boolean,
    showSampleDataWarning: boolean = false
  ): Promise<void> {
    const sidesheetRef = this.sideSheet.open(EditMasterDataComponent, {
      title: display,
      subTitle: isNew ? '' : policy.GetEntity().GetDisplay(),
      padding: '0px',
      width: 'max(600px, 80%)',
      disableClose: true,
      data: { policy, filterData, isNew, isComplienceFrameworkEnabled: this.isComplienceFrameworkEnabled, showSampleDataWarning },
      testId: 'policy-list-show-policy-sidesheet',
    });

    const shouldReload = await sidesheetRef.afterClosed().toPromise();
    if (shouldReload) {
      this.navigate();
    }
  }

  private async initFilterAndGrouping(): Promise<void> {
    this.viewConfig = await this.viewConfigService.getInitialDSTExtension(this.dataModel, this.viewConfigPath);
    const defaultSet = this.viewConfigService.isDefaultConfigSet();
    this.filterOptions = this.dataModel.Filters;

    // set initial value for OnlyActivePolicies
    const indexActive = this.filterOptions.findIndex((elem) => elem.Name === 'OnlyActivePolicies');
    if (indexActive > -1 && !defaultSet) {
      this.filterOptions[indexActive].InitialValue = '1';
      this.navigationState.OnlyActivePolicies = '1';
    }

    // remove filter myPolicies, if you are an owner only and not an attestation admin
    if (this.prefilterOwner && !defaultSet) {
      this.navigationState.mypolicies = '1';
      const index = this.filterOptions.findIndex((elem) => elem.Name === 'mypolicies');
      if (index > -1) {
        this.filterOptions.splice(index, 1);
      }
    }

    this.groupData = createGroupData(this.dataModel, (parameters) =>
      this.policyService.getGroupInfo({
        ...{ PageSize: this.navigationState.PageSize, StartIndex: 0 },
        ...parameters,
      })
    );
  }
}
