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

import { Component, Inject, Input, OnInit } from '@angular/core';
import { EUI_SIDESHEET_DATA, EuiSidesheetRef } from '@elemental-ui/core';

import { PortalPersonAll, PortalPickcategoryItems } from '@imx-modules/imx-api-qer';
import {
  CollectionLoadParameters,
  CompareOperator,
  DbObjectKey,
  DisplayColumns,
  EntitySchema,
  FilterData,
  FilterType,
  IClientProperty,
  TypedEntityCollectionData,
} from '@imx-modules/imx-qbm-dbts';

import { DataViewInitParameters, DataViewSource, MetadataService } from 'qbm';
import { IdentitiesService } from 'qer';

@Component({
  selector: 'imx-pick-category-select-identities',
  templateUrl: './pick-category-select-identities.component.html',
  styleUrls: ['./pick-category-select-identities.component.scss'],
  providers: [DataViewSource],
})
export class PickCategorySelectIdentitiesComponent implements OnInit {
  public displayColumns: IClientProperty[];
  public selection: PortalPersonAll[];
  public entitySchema: EntitySchema;
  public DisplayColumns = DisplayColumns;

  @Input() public embeddedMode = false;

  constructor(
    @Inject(EUI_SIDESHEET_DATA) public selectedItems: PortalPickcategoryItems[],
    private readonly sidesheetRef: EuiSidesheetRef,
    private readonly identityService: IdentitiesService,
    private readonly metadataService: MetadataService,
    public dataSource: DataViewSource<PortalPersonAll>,
  ) {
    this.entitySchema = this.identityService.personAllSchema;
  }

  public async ngOnInit(): Promise<void> {
    await this.getData();
  }

  public async getData(): Promise<void> {
    const dataViewInitParameters: DataViewInitParameters<PortalPersonAll> = {
      execute: async (params: CollectionLoadParameters, signal: AbortSignal): Promise<TypedEntityCollectionData<PortalPersonAll>> => {
        const filters = await this.getFilter();
        return this.identityService.getAllPerson({ ...params, filter: [...(params.filter || []), ...filters] }, signal);
      },
      schema: this.entitySchema,
      columnsToDisplay: [this.entitySchema.Columns[DisplayColumns.DISPLAY_PROPERTYNAME]],
      selectionChange: (selection: Array<PortalPersonAll>) => this.onSelectionChanged(selection),
    };
    this.dataSource.init(dataViewInitParameters);
  }

  public onSelectionChanged(selection: PortalPersonAll[]): void {
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
          ColumnName: tableMetadata?.PrimaryKeyColumns?.[0] || '',
          Type: FilterType.Compare,
          CompareOp: CompareOperator.NotEqual,
          Value1: DbObjectKey.FromXml(item.ObjectKeyItem.value).Keys[0],
        };
      });
    }
    return [];
  }
}
