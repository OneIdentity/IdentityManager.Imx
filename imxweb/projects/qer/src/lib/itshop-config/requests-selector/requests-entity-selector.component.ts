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

import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EntityCollectionData, FkProviderItem, IEntity, TypedEntity } from 'imx-qbm-dbts';
import { MetadataService } from 'qbm';
import { IRequestableEntitlementType } from '../irequestable-entitlement-type';
import { RequestableEntitlementTypeService } from '../requestable-entitlement-type.service';
import { RequestsService } from '../requests.service';

@Component({
  selector: 'imx-requests-selector',
  templateUrl: './requests-entity-selector.component.html',
  styleUrls: ['./requests-entity-selector.component.scss']
})
export class RequestsEntitySelectorComponent {

  public selectedItems: TypedEntity[] = [];

  private empty: EntityCollectionData = {
    TotalCount: 0,
    Entities: []
  };

  constructor(
    public readonly dialogRef: MatDialogRef<RequestsEntitySelectorComponent, string[]>,
    @Inject(MAT_DIALOG_DATA) private sidesheetData: {
      shelfId: string;
    },
    public readonly requestsService: RequestsService,
    metadata: MetadataService,
    requestTypeService: RequestableEntitlementTypeService,
  ) {
    requestsService.selectedEntitlementType = null;
    this.ReinitData();

    const rtypes = requestTypeService.GetTypes();
    rtypes.then(async t => {
      for (const type of t) {
        const display = (await metadata.GetTableMetadata(type.getTableName())).Display;
        this.displays.set(type.getTableName(), display);
      }
      this.types = t.sort((a, b) => (this.displays.get(a.getTableName()) > this.displays.get(b.getTableName()) ? 1 : -1));
    });
  }

  public types: IRequestableEntitlementType[];

  private displays: Map<string, string> = new Map();
  public getDisplay(tableName: string) {
    return this.displays.get(tableName);
  }

  public selectionChanged(items: TypedEntity[]): void {
    this.selectedItems = items;
  }

  public data;
  private fkEntity: IEntity;
  private fk: FkProviderItem;

  /** Sets the data object to trigger the changes event on the Fk candidate selector*/
  private ReinitData() {
    this.data = {
      get: parameters => {
        if (!this.fk) {
          return this.empty;
        }
        return this.fk.load(this.fkEntity, { ...parameters, ...{ UID_ITShopOrg: this.sidesheetData.shelfId } });
      },
      GetFilterTree: parentKey => {
        if (!this.fk) {
          return { Elements: [] };
        }
        return this.fk.getFilterTree(this.fkEntity, parentKey);
      },
      isMultiValue: true
    };
  }

  public async optionSelected(newType: IRequestableEntitlementType) {
    this.fkEntity = newType.createAssignmentEntity(this.sidesheetData.shelfId).GetEntity();
    const property = newType.getSchema().Columns[newType.getFkColumnName()];
    this.fk = this.fkEntity.GetFkCandidateProvider()
      .getProviderItem(property.FkRelation.ParentColumnName, property.FkRelation.ParentTableName);
    this.ReinitData();
    this.selectedItems = [];
  }

  public applySelection(selected?: TypedEntity): void {
    if (selected) {
      this.selectedItems = [selected];
    }
    const selectedValues = [];
    this.selectedItems.forEach((typedEntity) => {
      const keys = typedEntity.GetEntity().GetKeys();
      const val = keys?.length ? keys[0] : undefined;
      selectedValues.push(val);
    });
    this.dialogRef.close(selectedValues);
  }

}
