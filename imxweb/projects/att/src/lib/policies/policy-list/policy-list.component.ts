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
 * Copyright 2024 One Identity LLC.
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
import { MatButton } from '@angular/material/button';
import { EuiDownloadOptions, EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';

import { PolicyFilterData, PortalAttestationPolicy, PortalAttestationPolicyEdit } from '@imx-modules/imx-api-att';
import { ViewConfigData } from '@imx-modules/imx-api-qer';
import {
  CollectionLoadParameters,
  CompareOperator,
  DataModel,
  DisplayColumns,
  EntitySchema,
  ExtendedTypedEntityCollection,
  FilterType,
  TypedEntityCollectionData,
  ValType,
} from '@imx-modules/imx-qbm-dbts';
import {
  BusyService,
  ClassloggerService,
  ClientPropertyForTableColumns,
  ConfirmationService,
  DataSourceToolbarFilter,
  DataSourceToolbarViewConfig,
  DataTableGroupedData,
  DataViewInitParameters,
  DataViewSource,
  SettingsService,
  SnackBarService,
  SystemInfoService,
  calculateSidesheetWidth,
} from 'qbm';
import { UserModelService, ViewConfigService } from 'qer';
import { AttestationCasesComponentParameter } from '../attestation-cases/attestation-cases-component-parameter.interface';
import { AttestationCasesComponent } from '../attestation-cases/attestation-cases.component';
import { EditMasterDataComponent } from '../edit-master-data/edit-master-data.component';
import { PolicyDetailsComponent } from '../policy-details/policy-details.component';
import { PolicyCopyData } from '../policy.interface';
import { PolicyService } from '../policy.service';
import { AttestationPolicy } from './attestation-policy';

@Component({
  templateUrl: './policy-list.component.html',
  styleUrls: ['./policy-list.component.scss'],
  providers: [DataViewSource],
})
export class PolicyListComponent implements OnInit {
  @ViewChild('deleteButton') public deleteButton: MatButton;

  public readonly entitySchemaPolicy: EntitySchema;
  public readonly DisplayColumns = DisplayColumns;
  public groupedData: { [key: string]: DataTableGroupedData } = {};
  public isComplienceFrameworkEnabled = false;
  public busyService = new BusyService();
  public menuLoading = false;

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
    private readonly logger: ClassloggerService,
    public dataSource: DataViewSource<AttestationPolicy>,
  ) {
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
      features = (await this.userService.getFeatures()).Features || [];
      prep = (await this.systemInfoService.get()).PreProps || [];

      this.prefilterOwner = !this.policyService.canSeeAllAttestations(prep, features);
      this.isComplienceFrameworkEnabled = await this.policyService.isComplienceFrameworkEnabled();
      await this.initFilterAndGrouping();
    } finally {
      isBusy.endBusy();
    }
    await this.navigate();
  }

  public async updateConfig(config: ViewConfigData): Promise<void> {
    await this.viewConfigService.putViewConfig(config);
    this.viewConfig = await this.viewConfigService.getDSTExtensionChanges(this.viewConfigPath);
    this.dataSource.viewConfig.set(this.viewConfig);
  }

  public async deleteConfigById(id: string): Promise<void> {
    await this.viewConfigService.deleteViewConfig(id);
    this.viewConfig = await this.viewConfigService.getDSTExtensionChanges(this.viewConfigPath);
    this.dataSource.viewConfig.set(this.viewConfig);
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

  public async editPolicy(policy: AttestationPolicy): Promise<void> {
    this.elementalBusyService.show();
    let data: ExtendedTypedEntityCollection<PortalAttestationPolicyEdit, {}> = await this.policyService.getPolicyEditInteractive(
      policy.GetEntity().GetKeys()[0],
    );
    this.elementalBusyService.hide();
    if (data && data.Data.length > 0) {
      await this.showPolicy(
        data.Data[0],
        data.extendedData?.[0],
        await this.translator.get('#LDS#Heading Edit Attestation Policy').toPromise(),
        false,
      );
    }
  }

  public async newPolicy(): Promise<void> {
    if (this.elementalBusyService.overlayRefs.length === 0) {
      // Its possible we enter this function from another that has used the busy service, check if there is an overlay before showing
      this.elementalBusyService.show();
    }
    let policy: PolicyCopyData = await this.policyService.buildNewEntity();
    this.logger.trace(this, 'new policy created', policy);
    this.elementalBusyService.hide();
    if (policy) {
      await this.showPolicy(
        policy.data,
        {
          IsReadOnly: false,
          Filter: { Elements: [], ConcatenationType: 'OR' },
          InfoDisplay: [],
        },
        await this.translator.get('#LDS#Heading Create Attestation Policy').toPromise(),
        true,
      );
    }
  }

  public async copy(policy: PortalAttestationPolicy): Promise<void> {
    let newPolicy: PolicyCopyData;
    let filter: PolicyFilterData;
    this.elementalBusyService.show();
    const data = await this.policyService.getPolicyEditInteractive(policy.GetEntity().GetKeys()[0]);

    if (!data || data.Data.length === 0) {
      return this.newPolicy();
    }

    newPolicy = await this.policyService.buildNewEntity(data.Data[0], data.extendedData?.[0]?.Filter);
    filter = data.extendedData?.[0] || { IsReadOnly: true };
    this.logger.trace(this, 'copy for policy (old, new)', data, newPolicy);
    this.elementalBusyService.hide();
    if (newPolicy) {
      await this.showPolicy(
        newPolicy.data,
        filter,
        await this.translator.instant('#LDS#Heading Copy Attestation Policy'),
        true,
        newPolicy.pickCategorySkipped,
      );
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
      this.dataSource.updateState();
      this.snackbar.open(message, '#LDS#Close');
    }
  }

  public getReportOptions(policy: PortalAttestationPolicy): EuiDownloadOptions {
    return this.policyService.getReportDownloadOptions(policy.GetEntity().GetKeys()[0], policy.GetEntity().GetDisplay());
  }

  public async run(policy: PortalAttestationPolicy): Promise<void> {
    let data: AttestationCasesComponentParameter;
    this.elementalBusyService.show();
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
      this.elementalBusyService.hide();
    }

    if (data) {
      const result = await this.sideSheet
        .open(AttestationCasesComponent, {
          title: await this.translator.get('#LDS#Heading Start Attestation').toPromise(),
          subTitle: policy.GetEntity().GetDisplay(),
          padding: '0px',
          width: calculateSidesheetWidth(),
          data,
          testId: 'policy-list-start-attestation-run-sidesheet',
        })
        .afterClosed()
        .toPromise();

      if (result) {
        this.dataSource.updateState();
      }
    }
  }

  public async showDetails(policy: PortalAttestationPolicy): Promise<void> {
    let singlePolicy: PortalAttestationPolicy | undefined;
    this.elementalBusyService.show();
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
      this.elementalBusyService.hide();
    }
    if (singlePolicy) {
      this.sideSheet.open(PolicyDetailsComponent, {
        title: await this.translator.get('#LDS#Heading View Attestation Runs').toPromise(),
        subTitle: singlePolicy.GetEntity().GetDisplay(),
        padding: '0px',
        width: calculateSidesheetWidth(),
        data: { policy: singlePolicy },
        testId: 'policy-list-view-details-sidesheet',
      });
    }
  }

  private async navigate(): Promise<void> {
    const dataViewInitParameters: DataViewInitParameters<AttestationPolicy> = {
      execute: (params: CollectionLoadParameters, signal: AbortSignal): Promise<TypedEntityCollectionData<AttestationPolicy>> =>
        this.policyService.getPolicies(params, signal),
      schema: this.entitySchemaPolicy,
      columnsToDisplay: this.displayedColumns,
      dataModel: this.dataModel,
      groupExecute: (column: string, params: CollectionLoadParameters, signal: AbortSignal) =>
        this.policyService.getGroupInfo({ ...params, by: column }),
      exportFunction: this.policyService.exportPolicies(),
      viewConfig: this.viewConfig,
      highlightEntity: (policy: AttestationPolicy) => {
        this.editPolicy(policy);
      },
    };
    this.dataSource.init(dataViewInitParameters);
  }

  private async showPolicy(
    policy: PortalAttestationPolicyEdit,
    filterData: PolicyFilterData,
    display: string,
    isNew: boolean,
    showSampleDataWarning: boolean = false,
  ): Promise<void> {
    const sidesheetRef = this.sideSheet.open(EditMasterDataComponent, {
      title: display,
      subTitle: isNew ? '' : policy.GetEntity().GetDisplay(),
      padding: '0px',
      width: calculateSidesheetWidth(1000),
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
    this.filterOptions = this.dataModel.Filters || [];

    // set initial value for OnlyActivePolicies
    const indexActive = this.filterOptions.findIndex((elem) => elem.Name === 'OnlyActivePolicies');
    if (indexActive > -1 && !defaultSet) {
      this.filterOptions[indexActive].InitialValue = '1';
      this.filterOptions.map((filter) => {
        if (filter.Name === 'OnlyActivePolicies') {
          filter.CurrentValue = '1';
        }
      });
      this.dataSource.state.update((state) => ({ ...state, OnlyActivePolicies: '1' }));
      this.dataSource.predefinedFilters.set(this.filterOptions);
    }

    // remove filter myPolicies, if you are an owner only and not an attestation admin
    if (this.prefilterOwner && !defaultSet) {
      this.filterOptions.map((filter) => {
        if (filter.Name === 'mypolicies') {
          filter.CurrentValue = '1';
        }
      });
      this.dataSource.state.update((state) => ({ ...state, mypolicies: '1' }));
      this.dataSource.predefinedFilters.set(this.filterOptions);
    }
  }
}
