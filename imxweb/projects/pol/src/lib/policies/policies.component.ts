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

import { Component, OnInit } from '@angular/core';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { PortalPolicies } from '@imx-modules/imx-api-pol';
import {
  CollectionLoadParameters,
  DataModel,
  DisplayColumns,
  EntitySchema,
  TypedEntityCollectionData,
  ValType,
} from '@imx-modules/imx-qbm-dbts';
import { TranslateService } from '@ngx-translate/core';
import {
  BusyService,
  ClientPropertyForTableColumns,
  DataSourceToolbarFilter,
  DataSourceToolbarSettings,
  DataViewInitParameters,
  DataViewSource,
  SystemInfoService,
  calculateSidesheetWidth,
} from 'qbm';
import { PoliciesSidesheetComponent } from './policies-sidesheet/policies-sidesheet.component';
import { PoliciesService } from './policies.service';

@Component({
  selector: 'imx-policies',
  templateUrl: './policies.component.html',
  styleUrls: ['./policies.component.scss'],
  providers: [DataViewSource],
})
export class PoliciesComponent implements OnInit {
  public dstSettings: DataSourceToolbarSettings;
  public readonly DisplayColumns = DisplayColumns;
  public policySchema: EntitySchema;
  public busyService = new BusyService();
  public dataModel: DataModel;

  private displayedColumns: ClientPropertyForTableColumns[] = [];
  private filterOptions: DataSourceToolbarFilter[] = [];
  private isMControlPerViolation: boolean;

  constructor(
    private readonly policiesProvider: PoliciesService,
    private readonly sideSheetService: EuiSidesheetService,
    private readonly systemInfoService: SystemInfoService,
    private readonly translate: TranslateService,
    private readonly euiBusysService: EuiLoadingService,
    public dataSource: DataViewSource<PortalPolicies>,
  ) {
    this.policySchema = policiesProvider.policySchema;
    this.displayedColumns = [
      this.policySchema.Columns[DisplayColumns.DISPLAY_PROPERTYNAME],
      {
        ColumnName: 'cases',
        Type: ValType.Int,
      },
      this.policySchema.Columns.CountOpen,
    ];
  }

  public async ngOnInit(): Promise<void> {
    this.euiBusysService.show();
    try {
      this.dataModel = await this.policiesProvider.getDataModel();
      this.isMControlPerViolation = (await this.policiesProvider.featureConfig()).MitigatingControlsPerViolation;
    } finally {
      this.euiBusysService.hide();
    }
    await this.getData();
  }

  public async showDetails(selectedPolicy: PortalPolicies): Promise<void> {
    const hasRiskIndex = (await this.systemInfoService.get())?.PreProps?.includes('RISKINDEX');

    await this.sideSheetService
      .open(PoliciesSidesheetComponent, {
        title: await this.translate.get('#LDS#Heading View Company Policy Details').toPromise(),
        subTitle: selectedPolicy.GetEntity().GetDisplay(),
        padding: '0px',
        width: calculateSidesheetWidth(700, 0.4),
        testId: 'policy-details-sidesheet',
        data: {
          selectedPolicy: selectedPolicy as PortalPolicies,
          hasRiskIndex,
          isMControlPerViolation: this.isMControlPerViolation,
        },
      })
      .afterClosed()
      .toPromise();
  }

  public async getData(): Promise<void> {
    this.filterOptions = this.dataModel?.Filters || [];
    this.filterOptions.map((filter) => {
      if (filter.Name === 'active') {
        filter.CurrentValue = '1';
      }
    });
    this.dataSource.state.update((state) => ({ ...state, active: '1' }));
    const dataViewInitParameters: DataViewInitParameters<PortalPolicies> = {
      execute: (params: CollectionLoadParameters, signal: AbortSignal): Promise<TypedEntityCollectionData<PortalPolicies>> =>
        this.policiesProvider.getPolicies(params, signal),
      schema: this.policySchema,
      columnsToDisplay: this.displayedColumns,
      dataModel: this.dataModel,
      highlightEntity: (entity: PortalPolicies) => {
        this.showDetails(entity);
      },
    };
    this.dataSource.init(dataViewInitParameters);
  }
}
