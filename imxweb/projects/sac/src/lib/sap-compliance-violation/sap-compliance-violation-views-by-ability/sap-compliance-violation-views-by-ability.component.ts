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

import { Component, Input } from '@angular/core';
import { ByAbilityResult, SAPUserFunctionSrcFLD } from 'imx-api-sac';
import {
  CollectionLoadParameters,
  EntitySchema,
  FilterData,
  GroupInfo,
  GroupInfoData,
  TypedEntityCollectionData,
  ValType,
} from 'imx-qbm-dbts';
import { DataSourceToolBarGroup, DataSourceToolbarGroupData, DataSourceToolbarSettings, DataTableGroupedData } from 'qbm';
import { SapComplianceByAbilityBuilder } from './sap-compliance-violation-views-by-ability-builder';
import { SapComplianceByAbilityEntity } from './sap-compliance-violation-views-by-ability-entity';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'imx-sap-compliance-violation-views-by-ability',
  templateUrl: './sap-compliance-violation-views-by-ability.component.html',
  styleUrls: ['./sap-compliance-violation-views-by-ability.component.scss'],
})
export class SapComplianceViolationViewsByAbilityComponent {
  @Input() set resultByAbility(value: ByAbilityResult) {
    this._resultByAbility = value;
    if (!!value?.Data) {
      this.buildDataSource(value.Data);
    }
  }
  get resultByAbility(): ByAbilityResult {
    return this._resultByAbility;
  }
  public _resultByAbility: ByAbilityResult = { Data: [] };
  public dstSettings: DataSourceToolbarSettings;
  public entitySchema: EntitySchema;
  public dataSource: TypedEntityCollectionData<SapComplianceByAbilityEntity>;
  public groupData: { [key: string]: DataTableGroupedData } = {};
  private defaultData: SapComplianceByAbilityEntity[];
  private sapComplianceByAbilityBuilder = new SapComplianceByAbilityBuilder();

  constructor(private translateService: TranslateService) {
    this.entitySchema = SapComplianceByAbilityEntity.GetEntitySchema();
  }

  /**
   * Called when search action is emitted.
   * @param searchValue current search param
   */
  public onSearch(searchValue: string): void {
    if (!!searchValue) {
      searchValue = searchValue.toLocaleLowerCase();
      this.dstSettings.dataSource.Data = this.defaultData.filter(
        (profile) =>
          profile.Ident_SAPProfile.value.toLocaleLowerCase().includes(searchValue) ||
          profile.Ident_SAPAuthObject.value.toLocaleLowerCase().includes(searchValue) ||
          profile.Ident_SAPField.value.toLocaleLowerCase().includes(searchValue) ||
          profile.LowerLimit.value.toLocaleLowerCase().includes(searchValue) ||
          profile.UpperLimit.value.toLocaleLowerCase().includes(searchValue)
      );
    } else {
      this.dstSettings.dataSource.Data = this.defaultData;
    }
    this.dstSettings = { ...this.dstSettings, navigationState: { ...this.dstSettings.navigationState, search: searchValue } };
  }

  /**
   * Updates the selected group data. Called when group action is emitted.
   * @param groupKey selected grouping key
   */
  public onGroupingChange(groupInfo: { key: string; isInitial: boolean }): void {
    const groupedData = this.groupData[groupInfo.key];
    let filter = groupedData.navigationState?.filter;
    groupedData.data = this.getFilteredData(filter[0]);
    groupedData.settings = {
      displayedColumns: this.dstSettings.displayedColumns,
      dataModel: this.dstSettings.dataModel,
      dataSource: {
        Data: groupedData.data,
        totalCount: groupedData.data.length,
      },
      entitySchema: this.dstSettings.entitySchema,
      navigationState: groupedData.navigationState,
    };
  }

  /**
   * Called when navigaiton state changed. Here is called when search badge is removed.
   */
  public onNavigationStateChanged(params: CollectionLoadParameters): void {
    this.onSearch(params.search);
  }

  /**
   * Build the data source and the data source toolbar settings.
   */
  private buildDataSource(items: SAPUserFunctionSrcFLD[]): void {
    this.dataSource = this.sapComplianceByAbilityBuilder.build(this.sapComplianceByAbilityBuilder.buildEntityCollectionData(items));
    this.defaultData = this.dataSource.Data;
    this.dstSettings = {
      dataSource: this.dataSource,
      entitySchema: this.entitySchema,
      navigationState: {},
      displayedColumns: [
        this.entitySchema.Columns.Ident_SAPProfile,
        this.entitySchema.Columns.Ident_SAPAuthObject,
        this.entitySchema.Columns.Ident_SAPField,
        this.entitySchema.Columns.LowerLimit,
        this.entitySchema.Columns.UpperLimit,
        this.entitySchema.Columns.DisplaySapFunctionInstance,
        this.entitySchema.Columns.DisplaySapTransaction,
      ],
      groupData: this.createGroupData(),
    };
  }

  /**
   * Creating data source toolbar group setting.
   * @returns Data source toolbar group setting.
   */
  private createGroupData(): DataSourceToolbarGroupData {
    const groups: DataSourceToolBarGroup[] = [
      {
        property: {
          Property: {
            Type: ValType.String,
            ColumnName: 'DisplaySapFunctionInstance',
            Display: this.translateService.instant('#LDS#SAP function instance'),
          },
        },
        getData: async () => await this.groupingData('DisplaySapFunctionInstance'),
      },
      {
        property: {
          Property: {
            Type: ValType.String,
            ColumnName: 'DisplaySapTransaction',
            Display: this.translateService.instant('#LDS#SAP transaction'),
          },
        },
        getData: async () => await this.groupingData('DisplaySapTransaction'),
      },
    ];
    return { groups };
  }

  /**
   * The method generating the group info data from the group column key.
   * @param groupColumn
   * @returns Generated group info data.
   */
  public async groupingData(groupColumn: string): Promise<GroupInfoData> {
    const Groups: GroupInfo[] = [];
    this.dataSource.Data?.map((item, index) => {
      if (Groups.every((groupItem) => item[groupColumn].value !== groupItem.Display[0].Display)) {
        const groupItems = this.dataSource.Data.filter((row) => row[groupColumn].value === item[groupColumn].value);
        Groups.push({
          Display: [{ Display: item[groupColumn].value }],
          Filters: [{ ColumnName: groupColumn, Values: groupItems.map((groupItem) => groupItem[groupColumn].value) }],
          Count: groupItems.length,
        });
      }
    });
    return {
      TotalCount: Groups.length,
      Groups,
    };
  }

  /**
   * The method filter the data source with the filter column name.
   * @param filter
   * @returns Filtered data source.
   */
  private getFilteredData(filter: FilterData): SapComplianceByAbilityEntity[] {
    return this.dataSource.Data.filter((dataRow) => filter.Values.indexOf(dataRow[filter.ColumnName].value) >= 0);
  }
}
