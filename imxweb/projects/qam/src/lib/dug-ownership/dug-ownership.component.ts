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

import { Component, OnInit } from '@angular/core';
import { BusyService, calculateSidesheetWidth, DataSourceToolbarSettings, DataViewInitParameters, DataViewSource, HelpContextualValues, SideNavigationComponent, HELP_CONTEXTUAL } from 'qbm';

import { EuiSidesheetService } from '@elemental-ui/core';
import { CollectionLoadParameters, DataModel, DisplayColumns, EntitySchema, IClientProperty, TypedEntityCollectionData, ValType } from '@imx-modules/imx-qbm-dbts';
import { TranslateService } from '@ngx-translate/core';
import { DugSidesheetComponent } from '../dug/dug-sidesheet.component';
import { PortalDgeResources, PortalDgeResourcesPerceivedowners } from '../TypedClient';
import { DugAssignOwnershipSidesheetComponent } from './dug-assign-ownership-sidesheet/dug-assign-ownership-sidesheet.component';
import { DugOwnershipService } from './dug-ownership.service';

@Component({
  selector: 'imx-dug-ownership',
  templateUrl: './dug-ownership.component.html',
  styleUrls: ['./dug-ownership.component.scss'],
  providers: [DataViewSource],
})
export class DugOwnershipComponent implements OnInit {
  public data?: PortalDgeResources;
  private dataModel: DataModel;

  public busyService = new BusyService();
  public navigationState: CollectionLoadParameters = {};
  public dstSettings: DataSourceToolbarSettings;
  public entitySchema: EntitySchema;
  private displayedColumns: IClientProperty[] = [];
  public readonly DisplayColumns = DisplayColumns;
  public perceivedOwners: PortalDgeResourcesPerceivedowners;
  public selectedItems: PortalDgeResources[] = [];

  constructor(
    private readonly ownershipService: DugOwnershipService,
    private readonly sideSheet: EuiSidesheetService,
    private readonly translate: TranslateService,
    public dataSource: DataViewSource<PortalDgeResources>
  ) {
    this.entitySchema = ownershipService.DugResourceSchema;
    this.displayedColumns = [
      this.entitySchema.Columns.DisplayName,
      {
        ColumnName: "assignOwner",
        Type: ValType.String
      },
      // this.entitySchema.Columns.UID_QAMResourceType,
      this.entitySchema.Columns.RiskIndexCalculated,
      this.entitySchema.Columns.RequiresOwnership
    ];
  }

  public async ngOnInit(): Promise<void> {
    const isBusy = this.busyService.beginBusy();
    try {
      this.dataModel = await this.ownershipService.getDataModel();
      await this.getData();
    } finally {
      isBusy.endBusy();
    }
  }

  public async perceivedOwner(resource: PortalDgeResources): Promise<void> {
    const sidesheetRef = this.sideSheet.open(DugSidesheetComponent, {
      title: this.translate.instant('#LDS#Heading Perceived Owners'),
      subTitle: resource.GetEntity().GetDisplay(),
      width: calculateSidesheetWidth(),
      disableClose: true,
      padding: '0',
      testId: 'assign-dug-resource-sidesheet',
      data: { uid: resource.GetEntity().GetKeys()[0], identifier:'perceivedOwner' },
    });
    sidesheetRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getData();
      }
    });
  }

  public async assignOwner(resources: PortalDgeResources[]): Promise<void> {
    if (resources.length === 0) {
      return;
    }
    const uidResources: string[] = resources.map((resource) => resource.GetEntity().GetKeys()[0]);
    const sidesheetRef = this.sideSheet.open(DugAssignOwnershipSidesheetComponent, {
      title: this.translate.instant('#LDS#Heading Assign Owner'),
      subTitle: resources.map((res)=> res.GetEntity().GetDisplay()).join(', '),
      width: calculateSidesheetWidth(),
      disableClose: true,
      padding: '0',
      testId: 'assign-dug-owner-sidesheet',
      data: { uid:uidResources, identifier:'dug-assign-ownership' }
    });
    sidesheetRef.afterClosed().subscribe((result) => {
      if (result) {
        this.dataSource.selection.clear();
        this.getData();
      }
    });
}

  public onSelectionChanged(items: PortalDgeResources[]): void {
    this.selectedItems = items;
  }

  private async getData(): Promise<void> {
    const isBusy = this.busyService.beginBusy();
    try {
      const dataViewInitParameters: DataViewInitParameters<PortalDgeResources> = {
        execute: async (params: CollectionLoadParameters,
          signal: AbortSignal,): Promise<TypedEntityCollectionData<PortalDgeResources>> => {
          params= { ...params, withoutowner: '1' };
          const data = await this.ownershipService.getData(params,signal)
          return data;
        },
        dataModel: this.dataModel,
        schema: this.entitySchema,
        columnsToDisplay: this.displayedColumns,
        selectionChange: (assign: PortalDgeResources[]) => this.onSelectionChanged(assign),
      };
      this.dataSource.init(dataViewInitParameters);
    } finally {
      isBusy.endBusy();
    }
  }
}
