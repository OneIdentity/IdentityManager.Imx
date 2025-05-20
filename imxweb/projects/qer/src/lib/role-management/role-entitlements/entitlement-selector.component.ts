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

import { Component, Inject, ViewChild } from '@angular/core';
import { EUI_SIDESHEET_DATA, EuiSidesheetRef } from '@elemental-ui/core';
import { RoleAssignmentData } from '@imx-modules/imx-api-qer';
import { ApiRequestOptions, EntityCollectionData, FkProviderItem, IEntity, IForeignKeyInfo, TypedEntity } from '@imx-modules/imx-qbm-dbts';
import { TranslateService } from '@ngx-translate/core';
import { FkCandidatesComponent } from 'qbm';
import { RoleService } from '../role.service';

export interface SelectedEntitlement {
  assignmentType: RoleAssignmentData;
  entity: IEntity;
}

@Component({
  selector: 'imx-entitlement-selector',
  templateUrl: './entitlement-selector.component.html',
  styleUrls: ['./entitlement-selector.component.scss'],
})
export class EntitlementSelectorComponent {
  public selectedItems: TypedEntity[] = [];
  public selectedType: RoleAssignmentData;
  public selectedFkTable: IForeignKeyInfo;
  public data;

  @ViewChild(FkCandidatesComponent) private fkCandidatesComponent: FkCandidatesComponent;

  private fkEntity: IEntity | undefined;
  private fk: FkProviderItem | undefined;
  private empty: EntityCollectionData = {
    TotalCount: 0,
    Entities: [],
  };

  constructor(
    public readonly dialogRef: EuiSidesheetRef,
    private readonly roleService: RoleService,
    private readonly translate: TranslateService,
    @Inject(EUI_SIDESHEET_DATA)
    private sidesheetData: {
      entitlementTypes: RoleAssignmentData[];
      roleEntity: IEntity;
    },
  ) {
    // Choose first element, otherwise only init
    this.sidesheetData?.entitlementTypes.at(0) ? this.optionSelected(this.sidesheetData.entitlementTypes[0]) : this.reinitData();
  }

  public get types(): RoleAssignmentData[] {
    return this.sidesheetData.entitlementTypes;
  }

  public selectionChanged(items: TypedEntity[]): void {
    this.selectedItems = items;
  }

  public async optionSelected(newType: RoleAssignmentData): Promise<void> {
    this.selectedType = newType;
    this.fkEntity = this.roleService.createEntitlementAssignmentEntity(this.sidesheetData.roleEntity, newType);
    this.fk = this.fkEntity?.GetFkCandidateProvider().getProviderItem(newType.EntitlementFk || '', newType.TableName || '');
    this.reinitData();
    this.selectedItems = [];
    this.fkCandidatesComponent?.clearSelection();
    this.fkCandidatesComponent?.clearTreeFilter();
  }

  public applySelection(selected?: TypedEntity): void {
    if (selected) {
      this.selectedItems = [selected];
    }
    const result: SelectedEntitlement[] = this.selectedItems.map((item) => {
      return {
        assignmentType: this.selectedType,
        entity: item.GetEntity(),
      };
    });
    this.dialogRef.close(result);
  }

  public GetLdsNoData(): string {
    if (this.selectedType) {
      return '#LDS#No data'; // use fallback nodata text
    }
    return '#LDS#Select the type of entitlement that you want to assign to this role.';
  }

  /**
   * Sets the data object to trigger the changes event on the Fk candidate selector
   */
  private reinitData(): void {
    this.data = {
      Get: (parameters, opts?: ApiRequestOptions) => {
        if (!this.fk || !this.selectedType.RoleFk || !this.fkEntity) {
          return this.empty;
        }
        const fkObj = {};
        fkObj[this.selectedType.RoleFk] = this.sidesheetData.roleEntity.GetKeys()[0];
        return this.fk.load(this.fkEntity, { ...parameters, ...fkObj }, opts);
      },
      GetDataModel: (opts?: ApiRequestOptions) => {
        if (!this.fk || !this.fk.getDataModel || !this.fkEntity) {
          return undefined;
        }
        return this.fk.getDataModel(this.fkEntity, opts);
      },
      GetFilterTree: (parentKey, opts?: ApiRequestOptions) => {
        if (!this.fk || !this.fkEntity || !this.fk.getFilterTree) {
          return { Elements: [] };
        }
        return this.fk.getFilterTree(this.fkEntity, parentKey, opts);
      },
      isMultiValue: true,
    };
    if (!!this.selectedType) {
      this.selectedFkTable = { ...this.selectedType, ...this.data, fkColumnName: this.selectedType.TableName };
    }
  }
}
