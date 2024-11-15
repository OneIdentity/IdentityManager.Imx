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

import { Component, Inject, OnInit } from '@angular/core';
import { EUI_SIDESHEET_DATA, EuiSidesheetRef } from '@elemental-ui/core';

import { EntityCollectionData, FilterTreeData, FkProviderItem, IEntity, TypedEntity } from '@imx-modules/imx-qbm-dbts';
import { BusyService, FkCandidatesData, MetadataService, TypedEntityFkData } from 'qbm';
import { IRequestableEntitlementType } from '../irequestable-entitlement-type';
import { RequestableEntitlementTypeService } from '../requestable-entitlement-type.service';
import { RequestsService } from '../requests.service';

@Component({
  selector: 'imx-requests-selector',
  templateUrl: './requests-entity-selector.component.html',
  styleUrls: ['../request-config-sidesheet-common.scss'],
})
export class RequestsEntitySelectorComponent implements OnInit {
  public selectedItems: TypedEntity[] = [];
  public busyService = new BusyService();

  private empty: EntityCollectionData = {
    TotalCount: 0,
    Entities: [],
  };

  constructor(
    public readonly dialogRef: EuiSidesheetRef,
    @Inject(EUI_SIDESHEET_DATA)
    private sidesheetData: {
      shelfId: string;
    },
    public readonly requestsService: RequestsService,
    private metadata: MetadataService,
    private requestTypeService: RequestableEntitlementTypeService,
  ) {
    requestsService.selectedEntitlementType = null;
    this.ReinitData();
  }

  public async ngOnInit(): Promise<void> {
    const isBusy = this.busyService.beginBusy();
    try {
      const rtypes = await this.requestTypeService.GetTypes();
      for (const type of rtypes) {
        const display = (await this.metadata.GetTableMetadata(type.getTableName()))?.Display;
        this.displays.set(type.getTableName(), display);
      }
      this.types = rtypes.sort((a, b) =>
        (this.displays.get(a.getTableName()) || '') > (this.displays.get(b.getTableName()) || '') ? 1 : -1,
      );
    } finally {
      isBusy.endBusy();
    }
  }

  public types: IRequestableEntitlementType[];

  private displays: Map<string, string> = new Map();
  public getDisplay(tableName: string) {
    return this.displays.get(tableName);
  }

  public selectionChanged(items: TypedEntity[]): void {
    this.selectedItems = items;
  }

  public data: FkCandidatesData | TypedEntityFkData;
  private fkEntity: IEntity;
  private fk: FkProviderItem;

  /** Sets the data object to trigger the changes event on the Fk candidate selector*/
  private ReinitData() {
    this.data = {
      Get: (parameters: any) => {
        if (!this.fk) {
          return this.empty;
        }
        return this.fk.load(this.fkEntity, { ...parameters, ...{ UID_ITShopOrg: this.sidesheetData.shelfId } });
      },
      GetFilterTree: (parentKey: string) => {
        const emptyResult: FilterTreeData = { Elements: [] };
        if (!this.fk) {
          return Promise.resolve(emptyResult);
        }
        return this.fk.getFilterTree?.(this.fkEntity, parentKey) || Promise.resolve(emptyResult);
      },
      isMultiValue: true,
    };
  }

  public async optionSelected(newType: IRequestableEntitlementType) {
    this.fkEntity = newType.createAssignmentEntity(this.sidesheetData.shelfId).GetEntity();
    const property = newType.getSchema().Columns[newType.getFkColumnName()];
    const fkProviderItem = this.fkEntity
      .GetFkCandidateProvider()
      .getProviderItem(property.FkRelation?.ParentColumnName || '', property.FkRelation?.ParentTableName || '');
    if (fkProviderItem) {
      this.fk = fkProviderItem;
    }
    this.ReinitData();
    this.selectedItems = [];
  }

  public applySelection(selected?: TypedEntity): void {
    if (selected) {
      this.selectedItems = [selected];
    }
    const selectedValues: string[] = [];
    this.selectedItems.forEach((typedEntity) => {
      const keys = typedEntity.GetEntity().GetKeys();
      const val = !!keys?.length ? keys[0] : '';
      selectedValues.push(val);
    });
    this.dialogRef.close(selectedValues);
  }
}
