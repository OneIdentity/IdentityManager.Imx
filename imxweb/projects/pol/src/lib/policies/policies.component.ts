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
import { PortalPolicies } from 'imx-api-pol';
import { CollectionLoadParameters, DisplayColumns, EntitySchema, ValType } from 'imx-qbm-dbts';
import { BusyService, ClientPropertyForTableColumns, DataSourceToolbarFilter, DataSourceToolbarSettings, SystemInfoService } from 'qbm';
import { PolicyParameter } from './policy-parameter';
import { PoliciesService } from './policies.service';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { PoliciesSidesheetComponent } from './policies-sidesheet/policies-sidesheet.component';

@Component({
  selector: 'imx-policies',
  templateUrl: './policies.component.html',
  styleUrls: ['./policies.component.scss'],
})
export class PoliciesComponent implements OnInit {
  public dstSettings: DataSourceToolbarSettings;
  public readonly DisplayColumns = DisplayColumns;
  public policySchema: EntitySchema;
  public busyService = new BusyService();

  private displayedColumns: ClientPropertyForTableColumns[] = [];
  private filterOptions: DataSourceToolbarFilter[] = [];
  private navigationState: PolicyParameter = {};
  private isMControlPerViolation: boolean;

  constructor(
    private readonly policiesProvider: PoliciesService,
    private readonly sideSheetService: EuiSidesheetService,
    private readonly systemInfoService: SystemInfoService,
    private readonly translate: TranslateService,
    private readonly euiBusysService: EuiLoadingService
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
      this.filterOptions = (await this.policiesProvider.getDataModel()).Filters;
      this.isMControlPerViolation = (await this.policiesProvider.featureConfig()).MitigatingControlsPerViolation;
    } finally {
      this.euiBusysService.hide();
    }

    const indexActive = this.filterOptions.findIndex((elem) => elem.Name === 'active');
    if (indexActive > -1) {
      this.filterOptions[indexActive].InitialValue = '1';
      this.navigationState.active = '1';
    }
    await this.navigate({});
  }

  public async showDetails(selectedPolicy: PortalPolicies): Promise<void> {
    const hasRiskIndex = (await this.systemInfoService.get()).PreProps.includes('RISKINDEX');

    await this.sideSheetService
      .open(PoliciesSidesheetComponent, {
        title: await this.translate.get('#LDS#Heading View Company Policy Details').toPromise(),
        subTitle: selectedPolicy.GetEntity().GetDisplay(),
        padding: '0px',
        width: 'max(700px, 60%)',
        testId: 'policy-details-sidesheet',
        data: {
          selectedPolicy,
          hasRiskIndex,
          isMControlPerViolation: this.isMControlPerViolation,
        },
      })
      .afterClosed()
      .toPromise();
  }

  public async navigate(parameter: CollectionLoadParameters): Promise<void> {
    const isBusy = this.busyService.beginBusy();

    this.navigationState = { ...this.navigationState, ...parameter };

    try {
      const data = await this.policiesProvider.getPolicies(this.navigationState);
      this.dstSettings = {
        displayedColumns: this.displayedColumns,
        dataSource: data,
        entitySchema: this.policySchema,
        navigationState: this.navigationState,
        filters: this.filterOptions,
      };
    } finally {
      isBusy.endBusy();
    }
  }
}
