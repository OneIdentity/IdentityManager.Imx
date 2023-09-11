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

import { Component, Inject, OnInit } from '@angular/core';
import { EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';

import { DisplayColumns, EntitySchema, TypedEntityCollectionData } from 'imx-qbm-dbts';
import { DataSourceToolbarSettings } from 'qbm';
import { EntitlementToAddTyped } from '../entitlement-to-add-typed';

@Component({
  templateUrl: './mapped-entitlements-preview.component.html',
  styleUrls: ['./mapped-entitlements-preview.component.scss']
})
export class MappedEntitlementsPreviewComponent implements OnInit {

  public settings: DataSourceToolbarSettings;
  public readonly DisplayColumns = DisplayColumns;
  public entitySchema: EntitySchema;

  public alertText = '#LDS#Here you can get an overview of application entitlements that will be added to this application by the conditions. Application entitlements that are already assigned to an application will be skipped.';
  public speedupText = '#LDS#In addition, you can specify whether the application entitlements should be assigned immediately after the conditions are saved. However, you can also have the application entitlements added later.'

  constructor(
    @Inject(EUI_SIDESHEET_DATA) public data: {
      withSave: boolean,
      entitlementToAdd: TypedEntityCollectionData<EntitlementToAddTyped>
    },
    private readonly sidesheetRef: EuiSidesheetRef,
  ) { }

  public apply(map: boolean): void {
    this.sidesheetRef.close({ save: true, map });
  }

  public getCount(type: '' | 'add' | 'assigned' | 'conflicted'): number {

    switch (type) {
      case 'conflicted': return this.data.entitlementToAdd.Data.filter(elem => elem.IsAssignedToOther.value).length;
      case 'add': return this.data.entitlementToAdd.Data.filter(elem => !elem.IsAssignedToMe.value && !elem.IsAssignedToOther.value).length;
      case 'assigned': return this.data.entitlementToAdd.Data.filter(elem => elem.IsAssignedToMe.value).length;
    }

    return this.data.entitlementToAdd.totalCount;
  }

  public async ngOnInit(): Promise<void> {
    this.entitySchema = EntitlementToAddTyped.GetEntitySchema();

    const displayedColumns = [
      this.entitySchema.Columns.DisplayName,
      this.entitySchema.Columns.IsAssignedToMe,
      this.entitySchema.Columns.UID_AOBApplicationConflicted
    ];

    this.settings = {
      dataSource: this.data.entitlementToAdd,
      entitySchema: this.entitySchema,
      displayedColumns,
      navigationState: {}
    };
  }
}
