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

import { Component, OnInit } from '@angular/core';
import { EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';

import { PortalRules } from 'imx-api-cpl';
import { CollectionLoadParameters, DisplayColumns, EntitySchema, IClientProperty, ValType } from 'imx-qbm-dbts';
import { DataSourceToolbarFilter, DataSourceToolbarSettings, ClientPropertyForTableColumns } from 'qbm';
import { RuleParameter } from './rule-parameter';
import { RulesSidesheetComponent } from './rules-sidesheet/rules-sidesheet.component';
import { RulesService } from './rules.service';

@Component({
  selector: 'imx-rules',
  templateUrl: './rules.component.html',
  styleUrls: ['./rules.component.scss']
})
export class RulesComponent implements OnInit {
  public dstSettings: DataSourceToolbarSettings;
  public readonly DisplayColumns = DisplayColumns;
  public ruleSchema: EntitySchema;

  private displayedColumns: ClientPropertyForTableColumns[] = [];
  private filterOptions: DataSourceToolbarFilter[] = [];
  private navigationState: RuleParameter = {};

  constructor(
    private readonly rulesProvider: RulesService,
    private readonly sideSheetService: EuiSidesheetService,
    private readonly translate: TranslateService
  ) {
    this.ruleSchema = rulesProvider.ruleSchema;
    this.displayedColumns = [
      this.ruleSchema.Columns[DisplayColumns.DISPLAY_PROPERTYNAME],
      {
        ColumnName: 'cases',
        Type: ValType.Int,
      },
      this.ruleSchema.Columns.CountOpen,
      this.ruleSchema.Columns.IsInActive,
      {
        ColumnName: 'details',
        Type: ValType.String,
        afterAdditionals: true
      }
    ];
  }

  public async ngOnInit(): Promise<void> {
    this.filterOptions = (await this.rulesProvider.getDataModel()).Filters;

    const indexActive = this.filterOptions.findIndex(elem => elem.Name === 'active');
    if (indexActive > -1) {
      this.filterOptions[indexActive].InitialValue = '1';
      this.navigationState.active = '1';
    }
    await this.navigate({});
  }

  public async showDetails(selectedRule: PortalRules): Promise<void> {
    await this.sideSheetService.open(RulesSidesheetComponent, {
      title: await this.translate.get('#LDS#Heading View Compliance Rule Details').toPromise(),
      padding: '0px',
      width: 'max(700px, 60%)',
      headerColour: 'iris-blue',
      bodyColour: 'asher-gray',
      testId: 'rule-details-sidesheet',
      data: {
        selectedRule
      }
    }).afterClosed().toPromise();
  }

  public async navigate(parameter: CollectionLoadParameters): Promise<void> {

    this.navigationState = { ...this.navigationState, ...parameter };

    this.rulesProvider.handleOpenLoader();
    try {
      const data = await this.rulesProvider.getRules(this.navigationState);
      this.dstSettings = {
        displayedColumns: this.displayedColumns,
        dataSource: data,
        entitySchema: this.ruleSchema,
        navigationState: this.navigationState,
        filters: this.filterOptions,
      };
    } finally {
      this.rulesProvider.handleCloseLoader();
    }
  }
}
