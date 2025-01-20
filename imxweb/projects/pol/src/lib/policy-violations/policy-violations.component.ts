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

import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { PortalPolicies } from '@imx-modules/imx-api-pol';
import { ViewConfigData } from '@imx-modules/imx-api-qer';
import {
  CollectionLoadParameters,
  DataModel,
  DisplayColumns,
  EntitySchema,
  TypedEntityCollectionData,
  ValType,
} from '@imx-modules/imx-qbm-dbts';
import {
  BusyService,
  calculateSidesheetWidth,
  ClientPropertyForTableColumns,
  DataSourceToolbarFilter,
  DataSourceToolbarViewConfig,
  DataViewInitParameters,
  DataViewSource,
} from 'qbm';
import { ViewConfigService } from 'qer';
import { PolicyViolation } from './policy-violation';
import { PolicyViolationsSidesheetComponent } from './policy-violations-sidesheet/policy-violations-sidesheet.component';
import { PolicyViolationsService } from './policy-violations.service';

@Component({
  selector: 'imx-policy-violations',
  templateUrl: './policy-violations.component.html',
  styleUrls: ['./policy-violations.component.scss'],
  providers: [DataViewSource],
})
export class PolicyViolationsComponent implements OnInit {
  @Input() public selectedCompanyPolicy: PortalPolicies;
  @Input() isMControlPerViolation: boolean;

  public DisplayColumns = DisplayColumns;
  public selectedViolations: PolicyViolation[] = [];
  public approveOnly: boolean;
  public busyService = new BusyService();
  public entitySchema: EntitySchema;

  private dataModel: DataModel;
  private displayedColumns: ClientPropertyForTableColumns[] = [];
  private readonly subscriptions: Subscription[] = [];
  private viewConfig: DataSourceToolbarViewConfig;
  private viewConfigPath = 'policies/violations';

  constructor(
    public policyViolationsService: PolicyViolationsService,
    private viewConfigService: ViewConfigService,
    private readonly sidesheet: EuiSidesheetService,
    private readonly translate: TranslateService,
    private readonly actRoute: ActivatedRoute,
    public dataSource: DataViewSource<PolicyViolation>,
  ) {
    this.entitySchema = this.policyViolationsService.policyViolationsSchema;

    this.subscriptions.push(
      this.policyViolationsService.applied.subscribe(async () => {
        this.getData();
      }),
    );
  }

  public async ngOnInit(): Promise<void> {
    if (!this.selectedCompanyPolicy)
      this.approveOnly = this.actRoute.snapshot.url[this.actRoute.snapshot.url.length - 1].path === 'approve';
    this.displayedColumns = [
      ...(!this.selectedCompanyPolicy ? [this.entitySchema?.Columns.UID_QERPolicy] : []),
      this.entitySchema?.Columns.ObjectKey,
      this.entitySchema?.Columns.State,
      ...(!this.selectedCompanyPolicy
        ? [
            {
              ColumnName: 'actions',
              Type: ValType.String,
              afterAdditionals: true,
              untranslatedDisplay: '#LDS#Approval decision',
            },
          ]
        : []),
    ];

    const isBusy = this.busyService.beginBusy();

    try {
      this.dataModel = await this.policyViolationsService.getPolicyViolationsDataModel();
      this.viewConfig = await this.viewConfigService.getInitialDSTExtension(this.dataModel, this.viewConfigPath);

      // If this wasn't already set, then we need to get it from the config
      this.isMControlPerViolation ??= (await this.policyViolationsService.getConfig()).MitigatingControlsPerViolation;

      this.subscriptions.push(this.actRoute.queryParams.subscribe((params) => this.updateFiltersFromRouteParams(params)));
    } finally {
      isBusy.endBusy();
    }
    return this.getData();
  }

  public async viewDetails(selectedPolicyViolation: PolicyViolation): Promise<void> {
    const result = await this.sidesheet
      .open(PolicyViolationsSidesheetComponent, {
        title: this.translate.instant('#LDS#Heading View Policy Violation Details'),
        subTitle: selectedPolicyViolation.GetEntity().GetDisplay(),
        panelClass: 'imx-sidesheet',
        padding: '0',
        disableClose: true,
        width: calculateSidesheetWidth(600, 0.4),
        testId: 'policy-violations-details-sidesheet',
        data: {
          policyViolation: selectedPolicyViolation,
          isMControlPerViolation: this.isMControlPerViolation,
          isReadOnly: !!this.selectedCompanyPolicy,
        },
      })
      .afterClosed()
      .toPromise();
    if (result) {
      this.getData();
    }
  }

  public async decide(approve: boolean, items: PolicyViolation[]): Promise<void> {
    let result = false;
    if (approve) {
      result = await this.policyViolationsService.approve(items);
    } else {
      result = await this.policyViolationsService.deny(items);
    }
    if (result) {
      this.getData();
    }
  }
  public onSelectionChanged(cases: PolicyViolation[]): void {
    this.selectedViolations = cases;
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

  public getData(): void {
    if (this.selectedCompanyPolicy) {
      this.dataModel = { ...this.dataModel, Filters: this.dataModel.Filters?.filter((filter) => filter.Name !== 'uid_qerpolicy') };
    }
    const dataViewInitParameters: DataViewInitParameters<PolicyViolation> = {
      execute: (params: CollectionLoadParameters, signal: AbortSignal): Promise<TypedEntityCollectionData<PolicyViolation>> => {
        if (this.selectedCompanyPolicy) {
          const selectedCompanyPolicyKey = this.selectedCompanyPolicy.GetEntity().GetKeys()[0];
          params = { ...params, uid_qerpolicy: selectedCompanyPolicyKey };
        }
        return this.policyViolationsService.get(this.approveOnly, params, signal);
      },
      schema: this.entitySchema,
      columnsToDisplay: this.displayedColumns,
      dataModel: this.dataModel,
      groupExecute: (column: string, params: CollectionLoadParameters, signal: AbortSignal) => {
        return this.policyViolationsService.getGroupInfo(this.getGroupParams(column, params), signal);
      },
      exportFunction: this.policyViolationsService.exportPolicyViolations(),
      viewConfig: this.viewConfig,
      highlightEntity: (identity: PolicyViolation) => {
        this.viewDetails(identity);
      },
      selectionChange: (selection: PolicyViolation[]) => this.onSelectionChanged(selection),
    };
    this.dataSource.init(dataViewInitParameters);
  }

  private updateFiltersFromRouteParams(params: Params): void {
    if (this.viewConfigService.isDefaultConfigSet()) {
      // If there is a default config, we will not use our defaults
      return;
    }

    for (const [key, value] of Object.entries(params)) {
      this.tryApplyFilter(key, value);
    }
  }

  private tryApplyFilter(name: string, value: string): void {
    let filterOptions: DataSourceToolbarFilter[] = this.dataModel?.Filters || [];
    const index = filterOptions.findIndex((elem) => elem.Name?.toLowerCase() === name.toLowerCase());

    if (index > -1) {
      const filter = filterOptions[index];
      if (filter) {
        filter.InitialValue = value;
        filter.CurrentValue = value;
        this.dataSource.state.update((state) => ({ ...state, [name.toLowerCase()]: value }));
      }
    }
  }

  private getGroupParams(column: string, params: CollectionLoadParameters): { by?: string; def?: string } & CollectionLoadParameters {
    if (this.dataModel.Properties?.find((property) => property.Property?.ColumnName === column)) {
      return { ...params, by: column };
    } else {
      return { ...params, def: column };
    }
  }
}
