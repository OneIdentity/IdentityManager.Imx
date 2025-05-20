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
import { BusyService, calculateSidesheetWidth, DataSourceToolbarSettings, HelpContextualValues, SideNavigationComponent } from 'qbm';

import { EuiSidesheetService } from '@elemental-ui/core';
import { CollectionLoadParameters, DataModel, DisplayColumns, EntitySchema, IClientProperty, TypedEntity, ValType } from '@imx-modules/imx-qbm-dbts';
import { TranslateService } from '@ngx-translate/core';
import { DugSidesheetComponent } from '../dug/dug-sidesheet.component';
import { DugOwnershipService } from './dug-ownership.service';
import { PortalDgeResourcesPerceivedowners } from '../TypedClient';

@Component({
  selector: 'imx-dug-ownership',
  templateUrl: './dug-ownership.component.html',
  styleUrls: ['./dug-ownership.component.scss'],
})
export class DugOwnershipComponent implements OnInit, SideNavigationComponent {
  public data?: any;
  public contextId?: HelpContextualValues;
  private dataModel: DataModel;

  public busyService = new BusyService();
  public navigationState: CollectionLoadParameters = {};
  public dstSettings: DataSourceToolbarSettings;
  public entitySchema: EntitySchema;
  private displayedColumns: IClientProperty[] = [];
  public readonly DisplayColumns = DisplayColumns;
  public perceivedOwners: PortalDgeResourcesPerceivedowners;

  constructor(
    private readonly ownershipService: DugOwnershipService,
    private readonly sideSheet: EuiSidesheetService,
    private readonly translate: TranslateService,
  ) {
    this.entitySchema = ownershipService.DugResourceSchema;
    this.displayedColumns = [
      this.entitySchema.Columns[DisplayColumns.DISPLAY_PROPERTYNAME],
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

  /**
   * Occurs when the navigation state has changed - e.g. users clicks on the next page button.
   *
   */
  public async onNavigationStateChanged(newState?: CollectionLoadParameters): Promise<void> {
    await this.getData(newState);
  }

  /**
   * Occurs when user triggers search.
   *
   * @param keywords Search keywords.
   */
  public async onSearch(keywords: string): Promise<void> {
    await this.getData({ ...this.navigationState, StartIndex: 0, search: keywords });
  }

  public async perceivedOwner(resource: TypedEntity): Promise<void> {
    const sidesheetRef = this.sideSheet.open(DugSidesheetComponent, {
      title: this.translate.instant('#LDS#Heading Assign OwnerShip'),
      subTitle: resource.GetEntity().GetDisplay(),
      width: calculateSidesheetWidth(),
      disableClose: true,
      padding: '0',
      testId: 'assign-dug-resource-sidesheet',
      data: { uid: resource.GetEntity().GetKeys()[0], identifier:'perceivedOwner' },
    });
    sidesheetRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getData(this.navigationState);
      }
    });
  }

  private async getData(parameter: CollectionLoadParameters = {}): Promise<void> {
    const isBusy = this.busyService.beginBusy();
    this.navigationState = { ...parameter, withoutowner: '1' };
    try {
      const data = await this.ownershipService.getData(this.navigationState);
     
      this.dstSettings = {
        displayedColumns: this.displayedColumns,
        dataSource: data,
        dataModel: this.dataModel,
        filters: this.dataModel?.Filters ?? [],
        entitySchema: this.entitySchema,
        navigationState: this.navigationState,
      };
    } finally {
      isBusy.endBusy();
    }
  }
}
