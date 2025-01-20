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

import { OverlayRef } from '@angular/cdk/overlay';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { OwnershipInformation, ViewConfigData } from '@imx-modules/imx-api-qer';
import { TranslateService } from '@ngx-translate/core';

import {
  CollectionLoadParameters,
  DataModel,
  DisplayColumns,
  EntitySchema,
  IClientProperty,
  IEntity,
  IEntityColumn,
  TypedEntity,
  TypedEntityCollectionData,
} from '@imx-modules/imx-qbm-dbts';
import {
  BusyService,
  calculateSidesheetWidth,
  ClassloggerService,
  DataSourceToolbarViewConfig,
  DataViewInitParameters,
  DataViewSource,
  HelpContextualValues,
  LdsReplacePipe,
  MetadataService,
  SideNavigationComponent,
} from 'qbm';
import { ViewConfigService } from '../view-config/view-config.service';
import { ResourceSidesheetComponent } from './resource-sidesheet/resource-sidesheet.component';
import { ResourcesService } from './resources.service';

@Component({
  templateUrl: './resources.component.html',
  styleUrls: ['./resources.component.scss'],
  providers: [DataViewSource],
})
export class ResourcesComponent implements OnInit, SideNavigationComponent {
  @Input() public data: OwnershipInformation;
  @Input() public contextId: HelpContextualValues;
  public isAdmin?: boolean;
  public tablename: string;
  public viewConfigPath: string;
  public busyService = new BusyService();

  public tablenameDisplay: string;
  public tablenameDisplaySingular: string;
  public entitySchema: EntitySchema;
  public DisplayColumns = DisplayColumns;

  private displayColumns: IClientProperty[];
  private dataModel: DataModel;
  private viewConfig: DataSourceToolbarViewConfig;

  constructor(
    private readonly resourceProvider: ResourcesService,
    private readonly route: ActivatedRoute,
    private readonly metadata: MetadataService,
    private readonly viewConfigService: ViewConfigService,
    private readonly sidesheet: EuiSidesheetService,
    private readonly busy: EuiLoadingService,
    private readonly ldsReplace: LdsReplacePipe,
    private readonly translate: TranslateService,
    private readonly logger: ClassloggerService,
    public dataSource: DataViewSource,
  ) {}

  public async ngOnInit(): Promise<void> {
    const isBusy = this.busyService.beginBusy();
    this.tablename = this.data?.TableName ?? this.route.snapshot?.url[this.route.snapshot?.url.length - 1]?.path;

    try {
      await this.metadata.updateNonExisting([this.tablename]);
    } catch (error) {
      this.logger.error(this, error);
    }

    this.tablenameDisplay = this.metadata.tables[this.tablename]?.Display || '';
    this.tablenameDisplaySingular = this.metadata.tables[this.tablename]?.DisplaySingular || '';

    this.isAdmin = this.route.snapshot?.url[0]?.path === 'admin';
    this.viewConfigPath = (this.isAdmin ? 'admin/resources/' : 'resources/') + this.tablename.toLowerCase();

    this.entitySchema = this.resourceProvider.getSchema(this.tablename, this.isAdmin, false);
    this.displayColumns = [this.entitySchema.Columns[DisplayColumns.DISPLAY_PROPERTYNAME]];
    if (this.entitySchema.Columns.Requestable) {
      this.displayColumns.splice(1, 0, this.entitySchema.Columns.Requestable);
    }

    try {
      this.dataModel = await this.resourceProvider.getDataModel(this.tablename, this.isAdmin, undefined);
      this.viewConfig = await this.viewConfigService.getInitialDSTExtension(this.dataModel, this.viewConfigPath);
    } finally {
      isBusy.endBusy();
    }
    await this.getData();
  }

  public async showDetails(item: TypedEntity): Promise<void> {
    let overlay: OverlayRef;
    let entity: IEntity;
    let accProduct: IEntity | undefined;
    let editableFields: string[];
    let title: string;

    if (this.busy.overlayRefs.length === 0) {
      this.busy.show();
    }
    try {
      const column = this.tryGetColumn(item, 'UID_AccProduct')?.GetValue();
      entity = (await this.resourceProvider.getInteractive(this.tablename, item.GetEntity().GetKeys()[0], this.isAdmin)).GetEntity();
      accProduct = column ? (await this.resourceProvider.getServiceItem(this.tablename, column))?.GetEntity() : undefined;
      editableFields = await this.resourceProvider.getEditableFields(this.tablename, entity);
      title = await this.translate.get(this.resourceProvider.editTexts[this.tablename]).toPromise();
    } finally {
      this.busy.hide();
    }

    const sidesheetRef = this.sidesheet.open(ResourceSidesheetComponent, {
      title,
      subTitle: item.GetEntity().GetDisplay(),
      padding: '0px',
      width: calculateSidesheetWidth(1000),
      disableClose: true,
      testId: `${this.tablename}-detail-sidesheet`,
      data: {
        entity,
        isAdmin: this.isAdmin,
        accProduct,
        tablename: this.tablename,
        editableFields,
      },
    });

    sidesheetRef.afterClosed().subscribe(async (result) => {
      if (result) {
        await this.dataSource.updateState();
      }
    });
  }

  private async getData(): Promise<void> {
    const dataViewInitParameters: DataViewInitParameters<TypedEntity> = {
      execute: (params: CollectionLoadParameters): Promise<TypedEntityCollectionData<TypedEntity> | undefined> =>
        this.resourceProvider.get(this.tablename, this.isAdmin ?? false, params),
      schema: this.entitySchema,
      columnsToDisplay: this.displayColumns,
      dataModel: this.dataModel,
      exportFunction: this.resourceProvider.getExportMethod(this.tablename, this.isAdmin ?? false),
      viewConfig: this.viewConfig,
      highlightEntity: (entity: TypedEntity) => {
        this.showDetails(entity);
      },
    };
    this.dataSource.init(dataViewInitParameters);
  }

  private tryGetColumn(entity: TypedEntity, name: string): IEntityColumn | undefined {
    try {
      return entity.GetEntity().GetColumn(name);
    } catch {
      return undefined;
    }
  }

  public async updateConfig(config: ViewConfigData): Promise<void> {
    await this.viewConfigService.putViewConfig(config);
    this.viewConfig = await this.viewConfigService.getDSTExtensionChanges(this.viewConfigPath);
    this.dataSource.viewConfig.set(this.viewConfig);
  }

  public async deleteConfigById(id: string): Promise<void> {
    await this.viewConfigService.deleteViewConfig(id);
    this.viewConfig = await this.viewConfigService.getDSTExtensionChanges(this.viewConfigPath);
    this.dataSource.viewConfig.set(this.viewConfig);
  }
}
