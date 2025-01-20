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

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';

import { ActivatedRoute, Params } from '@angular/router';
import {
  CollectionLoadParameters,
  DataModel,
  EntitySchema,
  IClientProperty,
  TypedEntityCollectionData,
  ValType,
} from '@imx-modules/imx-qbm-dbts';

import { PortalRules } from '@imx-modules/imx-api-cpl';
import { ViewConfigData } from '@imx-modules/imx-api-qer';
import {
  BusyService,
  calculateSidesheetWidth,
  ClassloggerService,
  DataSourceToolbarFilter,
  DataSourceToolbarViewConfig,
  DataTableGroupedData,
  DataViewInitParameters,
  DataViewSource,
} from 'qbm';
import { ViewConfigService } from 'qer';
import { Subscription } from 'rxjs';
import { MitigatingControlsPersonService } from './mitigating-controls-person/mitigating-controls-person.service';
import { RulesViolationsActionService } from './rules-violations-action/rules-violations-action.service';
import { RulesViolationsApproval } from './rules-violations-approval';
import { RulesViolationsDetailsComponent } from './rules-violations-details/rules-violations-details.component';
import { RulesViolationsService } from './rules-violations.service';

/**
 * Component that shows all rules violations that the user can approve or deny.
 * Therefore, the user can also view some information about the rules violations.
 *
 * Initially only the pending rules violations are shown.
 *
 */
@Component({
  selector: 'imx-rules-violations',
  templateUrl: './rules-violations.component.html',
  styleUrls: ['./rules-violations.component.scss'],
  providers: [DataViewSource],
})
export class RulesViolationsComponent implements OnInit, OnDestroy {
  @Input() public isMControlPerViolation: boolean;
  public dataModel: DataModel;
  public selectedRulesViolations: RulesViolationsApproval[] = [];
  public groupedData: { [key: string]: DataTableGroupedData } = {};
  public entitySchema: EntitySchema;
  public busyService = new BusyService();
  public displayedColumns: IClientProperty[];

  private viewConfig: DataSourceToolbarViewConfig;
  private viewConfigPath = 'rules/violations';
  private readonly subscriptions: Subscription[] = [];

  constructor(
    public readonly rulesViolationsService: RulesViolationsService,
    public readonly actionService: RulesViolationsActionService,
    public readonly viewConfigService: ViewConfigService,
    public readonly mControlsProvider: MitigatingControlsPersonService,
    private readonly sidesheet: EuiSidesheetService,
    private readonly translate: TranslateService,
    private readonly logger: ClassloggerService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly elementalBusyService: EuiLoadingService,
    public dataSource: DataViewSource<RulesViolationsApproval>,
  ) {
    this.subscriptions.push(
      this.actionService.applied.subscribe(async () => {
        this.dataSource.selection.clear();
        this.dataSource.updateState();
      }),
    );
  }

  public async ngOnInit(): Promise<void> {
    const isBusy = this.busyService.beginBusy();
    try {
      this.entitySchema = this.rulesViolationsService.rulesViolationsApproveSchema;
      // If this wasn't already set, then we need to get it from the config
      this.isMControlPerViolation ??= (await this.rulesViolationsService.featureConfig()).MitigatingControlsPerViolation;
      this.dataModel = await this.rulesViolationsService.getDataModel();
      this.viewConfig = await this.viewConfigService.getInitialDSTExtension(this.dataModel, this.viewConfigPath);
      this.displayedColumns = [
        this.entitySchema.Columns.UID_Person,
        this.entitySchema.Columns.UID_NonCompliance,
        this.entitySchema.Columns.State,
        this.entitySchema.Columns.RiskIndexCalculated,
        this.entitySchema.Columns.RiskIndexReduced,
        {
          ColumnName: 'decision',
          Type: ValType.String,
        },
      ];

      this.subscriptions.push(this.activatedRoute.queryParams.subscribe((params) => this.updateFiltersFromRouteParams(params)));
    } finally {
      isBusy.endBusy();
    }
    await this.getData();
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
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

  public async getData(): Promise<void> {
    const dataViewInitParameters: DataViewInitParameters<RulesViolationsApproval> = {
      execute: (params: CollectionLoadParameters, signal: AbortSignal): Promise<TypedEntityCollectionData<RulesViolationsApproval>> =>
        this.rulesViolationsService.getRulesViolationsApprove(params, signal),
      schema: this.entitySchema,
      columnsToDisplay: this.displayedColumns,
      dataModel: this.dataModel,
      groupExecute: (column: string, params: CollectionLoadParameters, signal: AbortSignal) =>
        this.rulesViolationsService.getGroupInfo({ ...params, by: column }),
      exportFunction: this.rulesViolationsService.exportRulesViolations(),
      viewConfig: this.viewConfig,
      highlightEntity: (entity: RulesViolationsApproval) => {
        this.viewDetails(entity);
      },
      selectionChange: (selection: RulesViolationsApproval[]) => this.onSelectionChanged(selection),
    };
    this.dataSource.init(dataViewInitParameters);
  }

  public onSelectionChanged(items: RulesViolationsApproval[]): void {
    this.logger.trace(this, 'selection changed', items);
    this.selectedRulesViolations = items;
  }

  /**
   * Opens the {@link RulesViolationsDetailsComponent} sidesheet thats shows some informations of the selected rules violation.
   * @param selectedRulesViolation the selected {@link RulesViolationsApproval}
   */
  public async viewDetails(entity: RulesViolationsApproval): Promise<void> {
    const selectedRulesViolation = entity;
    let complianceRule: PortalRules;
    this.elementalBusyService.show();

    try {
      complianceRule = await this.rulesViolationsService.getComplianceRuleByUId(selectedRulesViolation);
    } finally {
      this.elementalBusyService.hide();
    }
    if (!complianceRule) {
      return;
    }
    // TODO: Make API for mit conts
    const result = await this.sidesheet
      .open(RulesViolationsDetailsComponent, {
        title: await this.translate.get('#LDS#Heading View Rule Violation Details').toPromise(),
        subTitle: selectedRulesViolation.GetEntity().GetDisplay(),
        padding: '0px',
        panelClass: 'imx-sidesheet',
        disableClose: this.isMControlPerViolation,
        width: calculateSidesheetWidth(1200, 0.7),
        testId: 'rules-violations-details-sidesheet',
        data: {
          selectedRulesViolation,
          isMControlPerViolation: this.isMControlPerViolation,
          complianceRule,
        },
      })
      .afterClosed()
      .toPromise();

    if (result) {
      this.dataSource.updateState();
    }
  }

  private updateFiltersFromRouteParams(params: Params): void {
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
}
