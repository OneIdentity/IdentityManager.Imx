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

import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { PortalApplication, PortalApplicationIdentities } from 'imx-api-aob';
import {
  CollectionLoadParameters,
  DisplayColumns,
  EntitySchema,
  ExtendedTypedEntityCollection,
  IClientProperty,
  TypedEntity,
} from 'imx-qbm-dbts';
import { BusyService, DataSourceToolbarSettings, DataTableComponent, DataTileMenuItem } from 'qbm';
import { IdentityDetailData } from './identity-detail-data';
import { IdentityDetailComponent } from './identity-detail/identity-detail.component';
import { IdentityService } from './identity.service';

@Component({
  selector: 'imx-aob-identities',
  templateUrl: './identities.component.html',
  styleUrls: ['./identities.component.scss'],
})
export class IdentitiesComponent implements OnChanges {
  /**
   * The {@link PortalApplication | application} associated with the idenitities
   */
  @Input() public application: PortalApplication;

  @ViewChild('dataTable') public dataTable: DataTableComponent<any>;

  public dstSettings: DataSourceToolbarSettings;
  public navigationState: CollectionLoadParameters;
  public selectedView = 'cardlist';
  public DisplayColumns = DisplayColumns;
  public entitySchema: EntitySchema;
  public displayedColumns: IClientProperty[];
  public busyService = new BusyService();

  constructor(
    private readonly identityService: IdentityService,
    private readonly sidesheetService: EuiSidesheetService,
    private readonly translateService: TranslateService
  ) {
    this.entitySchema = this.identityService.getSchema();
    this.initNavigationState();
    this.displayedColumns = [
      this.entitySchema.Columns[DisplayColumns.DISPLAY_PROPERTYNAME],
      this.entitySchema.Columns['DefaultEmailAddress'],
    ];
  }

  public async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes.application?.currentValue?.UID_AOBApplication.value === changes.application?.previousValue?.UID_AOBApplication.value) {
      return;
    }
    const isBusy = this.busyService.beginBusy();
    try {
      this.initNavigationState();
      await this.setDst();
    } finally {
      isBusy.endBusy();
    }
  }

  public async onNavigationStateChanged(navigationState: CollectionLoadParameters): Promise<void> {
    this.navigationState = navigationState;
    await this.setDst();
  }

  public onViewSelectionChanged(selectedView: string): void {
    this.selectedView = selectedView;
  }

  /**
   * Method that is triggered by the (search) output of the data table
   * Reinits the data source
   * @param keywords the search value
   */
  public async onSearch(keywords: string): Promise<void> {
    this.navigationState.StartIndex = 0;
    this.navigationState.search = keywords;
    await this.setDst();
  }

  /**
   * Method that is triggered by the (highlightedEntityChanged) output of the data table
   * opens the details
   * @param selectedItem the TypedEntity that is selected
   */
  public async onHighlightedEntityChanged(selectedItem: TypedEntity): Promise<void> {
    await this.onOpenDetails(selectedItem);
  }

  /**
   * Method that is triggered by the (actionSelected) output of the data tile component
   * opens the details
   * @param selectedItem the TypedEntity that is selected
   */
  public async onSelectedTileChanged(selectedItem: DataTileMenuItem): Promise<void> {
    await this.onOpenDetails(selectedItem.typedEntity);
  }

  /**
   * Opens a side sheet that displays identity details
   * @param item the identity, that details should be opened
   */
  public async onOpenDetails(item: TypedEntity): Promise<void> {
    const data: IdentityDetailData = {
      application: this.application,
      selectedItem: item,
    };

    this.sidesheetService.open(IdentityDetailComponent, {
      title: await this.translateService.get('#LDS#Heading View Application Entitlements').toPromise(),
      subTitle: data.selectedItem.GetEntity().GetDisplay(),
      width: 'max(768px, 70%)',
      testId: 'identity-view-application-entitlements',
      data: data,
    });
  }

  /**
   * Loads the data for the table
   * @returns an {@link ExtendedTypedEntityCollection | extended typed entity collection} of {@link PortalApplicationIdentities | application identities}
   */
  private async getData(): Promise<ExtendedTypedEntityCollection<PortalApplicationIdentities, unknown>> {
    const isBusy = this.busyService.beginBusy();
    try {
      return await this.identityService.get(this.application.GetEntity().GetKeys()[0], this.navigationState);
    } finally {
      isBusy.endBusy();
    }
  }

  private async setDst(): Promise<void> {
    this.dstSettings = {
      dataSource: await this.getData(),
      entitySchema: this.entitySchema,
      navigationState: this.navigationState,
      displayedColumns: this.displayedColumns,
    };
  }

  private initNavigationState(): void {
    this.navigationState = {
      PageSize: 25,
      StartIndex: 0,
      search: null,
    };
  }
}
