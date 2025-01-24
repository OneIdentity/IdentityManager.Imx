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

import { Component, Inject, Input, OnInit } from '@angular/core';
import { EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';

import { PortalPersonAll, PortalPickcategoryItems } from 'imx-api-qer';
import {
  CollectionLoadParameters,
  CompareOperator,
  DbObjectKey,
  DisplayColumns,
  FilterData,
  FilterType,
  IClientProperty,
  TypedEntity,
} from 'imx-qbm-dbts';

import { BusyService, DataSourceToolbarSettings, DataSourceWrapper, MetadataService } from 'qbm';
import { IdentitiesService } from 'qer';

@Component({
  selector: 'imx-pick-category-select-identities',
  templateUrl: './pick-category-select-identities.component.html',
  styleUrls: ['./pick-category-select-identities.component.scss'],
})
export class PickCategorySelectIdentitiesComponent implements OnInit {
  public readonly dstWrapper: DataSourceWrapper<PortalPersonAll>;
  public dstSettings: DataSourceToolbarSettings;
  public displayColumns: IClientProperty[];
  public selection: TypedEntity[];  
  public busyService = new BusyService();

  @Input() public embeddedMode = false;

  constructor(
    @Inject(EUI_SIDESHEET_DATA) public selectedItems: PortalPickcategoryItems[],
    private readonly sidesheetRef: EuiSidesheetRef,
    private readonly identityService: IdentitiesService,
    private readonly metadataService: MetadataService
  ) {
    const entitySchema = this.identityService.personAllSchema;

    this.dstWrapper = new DataSourceWrapper(
      (state, requestOpts, isInitial) =>
        isInitial ? Promise.resolve({ totalCount: 0, Data: [] }) : this.identityService.getAllPerson(state),
      [entitySchema.Columns[DisplayColumns.DISPLAY_PROPERTYNAME]],
      entitySchema
    );
  }

  public async ngOnInit(): Promise<void> {
    await this.getData(undefined, true);
  }

  public async getData(navigationState?: CollectionLoadParameters, isInitialLoad: boolean = false): Promise<void> {
    const isBusy = this.busyService.beginBusy();

    try {
      navigationState = {
        ...navigationState,
        ...{ filter: await this.getFilter() },
      };
      this.dstSettings = await this.dstWrapper.getDstSettings(navigationState, undefined, isInitialLoad);
    } finally {
      isBusy.endBusy();
    }
  }

  public onSelectionChanged(selection: TypedEntity[]): void {
    this.selection = selection;
  }

  public onAssign(): void {
    this.sidesheetRef.close(this.selection);
  }

  private async getFilter(): Promise<FilterData[]> {
    if (this.selectedItems && this.selectedItems.length > 0) {
      const tableName = DbObjectKey.FromXml(this.selectedItems[0].ObjectKeyItem.value).TableName;
      await this.metadataService.updateNonExisting([tableName]);

      const tableMetadata = this.metadataService.tables[tableName];

      return this.selectedItems.map((item) => {
        return {
          ColumnName: tableMetadata.PrimaryKeyColumns[0],
          Type: FilterType.Compare,
          CompareOp: CompareOperator.NotEqual,
          Value1: DbObjectKey.FromXml(item.ObjectKeyItem.value).Keys[0],
        };
      });
    }
  }
}
