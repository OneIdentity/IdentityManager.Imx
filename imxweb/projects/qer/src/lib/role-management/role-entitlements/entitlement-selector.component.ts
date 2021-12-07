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
 * Copyright 2021 One Identity LLC.
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
import { RoleAssignmentData } from 'imx-api-qer';
import { EntityCollectionData, FkProviderItem, IEntity, TypedEntity } from 'imx-qbm-dbts';
import { RoleService } from '../role.service';

export interface SelectedEntitlements {
  assignmentType: RoleAssignmentData;
  entities: IEntity[];
}

@Component({
  selector: 'imx-entitlement-selector',
  templateUrl: './entitlement-selector.component.html',
  styleUrls: ['./entitlement-selector.component.scss']
})
export class EntitlementSelectorComponent {

  public selectedItems: TypedEntity[] = [];

  private empty: EntityCollectionData = {
    TotalCount: 0,
    Entities: []
  };

  public selectedType: RoleAssignmentData;

  constructor(
    public readonly dialogRef: MatDialogRef<EntitlementSelectorComponent, SelectedEntitlements>,
    private readonly roleService: RoleService,
    @Inject(MAT_DIALOG_DATA) private sidesheetData: {
      entitlementTypes: RoleAssignmentData[],
      roleEntity: IEntity
    }
  ) {
    this.ReinitData();
  }

  public get types(): RoleAssignmentData[] {
    return this.sidesheetData.entitlementTypes;
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
        const fkObj = {};
        fkObj[this.selectedType.RoleFk] = this.sidesheetData.roleEntity.GetKeys()[0];
        return this.fk.load(this.fkEntity, { ...parameters, ...fkObj })
      },
      hasSearchParameter: true,
      isMultiValue: true
    };
  }

  public async optionSelected(newType: RoleAssignmentData) {
    this.selectedType = newType;
    this.fkEntity = this.roleService.createEntitlementAssignmentEntity(this.sidesheetData.roleEntity, newType);
    this.fk = this.fkEntity.GetFkCandidateProvider().getProviderItem(newType.EntitlementFk, newType.TableName);
    this.ReinitData();
    this.selectedItems = [];
  }


  public applySelection(selected?: TypedEntity): void {
    if (selected) {
      this.selectedItems = [selected];
    }
    this.dialogRef.close({
      assignmentType: this.selectedType,
      entities: this.selectedItems.map(t => t.GetEntity())
    });
  }

  public GetLdsNoData() {
    if (this.selectedType) {
      return null; // use fallback nodata text
    }
    return "#LDS#Select the type of entitlement that you want to assign to this role.";
  }
}
