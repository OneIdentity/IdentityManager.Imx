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

import { Component, Input, OnInit } from '@angular/core';
import { EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';

import { CollectionLoadParameters, DataModel, DisplayColumns, EntitySchema, IClientProperty, TypedEntity } from 'imx-qbm-dbts';
import { BusyService, DataSourceToolbarSettings, HelpContextualValues, LdsReplacePipe, MetadataService, SideNavigationComponent } from 'qbm';
import { SoftwareSidesheetComponent } from './software-sidesheet/software-sidesheet.component';
import { SoftwareService } from './software.service';

@Component({
  templateUrl: './software.component.html',
  styleUrls: ['./software.component.scss'],
})
export class SoftwareComponent implements OnInit, SideNavigationComponent {
  @Input() public contextId: HelpContextualValues;
  public tablenameDisplay: string;
  public dstSettings: DataSourceToolbarSettings;
  public entitySchema: EntitySchema;
  public DisplayColumns = DisplayColumns;
  public busyService = new BusyService();

  private displayColumns: IClientProperty[];
  private navigationState: CollectionLoadParameters = {};
  private dataModel: DataModel;

  public isAdmin = false;

  constructor(
    private readonly resourceProvider: SoftwareService,
    private readonly metadata: MetadataService,
    private readonly sidesheet: EuiSidesheetService,
    private readonly ldsReplace: LdsReplacePipe,
    private readonly translate: TranslateService
  ) {}

  public async ngOnInit(): Promise<void> {
    const isBusy = this.busyService.beginBusy();
    try {
      this.entitySchema = this.resourceProvider.getSchema(false);
      await this.metadata.update(['Application']);
      this.dataModel = await this.resourceProvider.getDataModel(undefined);
    } finally {
      isBusy.endBusy();
    }

    this.tablenameDisplay = this.metadata.tables['Application'].Display;
    this.displayColumns = [this.entitySchema.Columns[DisplayColumns.DISPLAY_PROPERTYNAME]];

    if (this.entitySchema.Columns.Requestable) {
      this.displayColumns.splice(1, 0, this.entitySchema.Columns.Requestable);
    }

    this.navigate();
  }

  public async onNavigationStateChanged(newState?: CollectionLoadParameters): Promise<void> {
    if (newState) {
      this.navigationState = newState;
    }
    await this.navigate();
  }

  public async onSearch(keywords: string): Promise<void> {
    this.navigationState.StartIndex = 0;
    this.navigationState.search = keywords;
    await this.navigate();
  }

  public async showDetails(item: TypedEntity): Promise<void> {
    const sidesheetRef = this.sidesheet.open(SoftwareSidesheetComponent, {
      title: this.ldsReplace.transform(await this.translate.get('#LDS#Heading Edit {0}').toPromise(), this.tablenameDisplay),
      headerColour: 'blue',
      padding: '0px',
      width: 'max(600px, 60%)',
      disableClose: true,
      testId: 'software-sidesheet',
      data: {
        uidSoftware: item.GetEntity().GetKeys()[0],
      },
    });

    sidesheetRef.afterClosed().subscribe(async (result) => {
      if (result) {
        await this.navigate();
      }
    });
  }

  private async navigate(): Promise<void> {
    const isBusy = this.busyService.beginBusy();
    try {
      this.dstSettings = {
        dataSource: await this.resourceProvider.get(this.navigationState),
        entitySchema: this.entitySchema,
        navigationState: this.navigationState,
        displayedColumns: this.displayColumns,
        filters: this.dataModel.Filters,
        dataModel: this.dataModel,
      };
    } finally {
      isBusy.endBusy();
    }
  }
}
