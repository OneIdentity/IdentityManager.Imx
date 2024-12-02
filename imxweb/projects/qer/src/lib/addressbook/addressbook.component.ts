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
import { EuiLoadingService, EuiSidesheetConfig, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';

import { PersonConfig, PortalPersonAll, ViewConfigData } from '@imx-modules/imx-api-qer';
import {
  CollectionLoadParameters,
  DataModel,
  DisplayColumns,
  EntitySchema,
  IClientProperty,
  TypedEntityCollectionData,
} from '@imx-modules/imx-qbm-dbts';
import {
  BusyService,
  ClassloggerService,
  DataSourceToolbarViewConfig,
  DataViewInitParameters,
  DataViewSource,
  SettingsService,
  calculateSidesheetWidth,
} from 'qbm';

import { PersonService } from '../person/person.service';
import { ProjectConfigurationService } from '../project-configuration/project-configuration.service';
import { ViewConfigService } from '../view-config/view-config.service';
import { AddressbookDetailComponent } from './addressbook-detail/addressbook-detail.component';
import { AddressbookService } from './addressbook.service';

/**
 * White pages view. Contains a person details view.
 */
@Component({
  selector: 'imx-addressbook',
  templateUrl: './addressbook.component.html',
  styleUrls: ['./addressbook.component.scss'],
  providers: [DataViewSource],
})
export class AddressbookComponent implements OnInit {
  public displayedColumns: IClientProperty[];
  public dataModel: DataModel;
  public entitySchema: EntitySchema;
  public busyService = new BusyService();

  private viewConfig: DataSourceToolbarViewConfig;
  private personConfig: PersonConfig | undefined;
  private viewConfigPath = 'person/all';

  constructor(
    private readonly euiBusyService: EuiLoadingService,
    private readonly logger: ClassloggerService,
    private readonly configService: ProjectConfigurationService,
    private readonly settingsService: SettingsService,
    private readonly addressbookService: AddressbookService,
    private readonly sidesheet: EuiSidesheetService,
    private readonly translateService: TranslateService,
    private readonly personService: PersonService,
    private readonly viewConfigService: ViewConfigService,
    public dataSource: DataViewSource<PortalPersonAll>,
  ) {}

  public async ngOnInit(): Promise<void> {
    const isBusy = this.busyService.beginBusy();

    try {
      this.personConfig = (await this.configService.getConfig()).PersonConfig;
      this.dataModel = await this.personService.getDataModel();
      this.entitySchema = this.personService.schemaPersonAll;
      this.displayedColumns = [
        this.entitySchema.Columns[DisplayColumns.DISPLAY_PROPERTYNAME],
        ...(this.personConfig?.VI_MyData_WhitePages_ResultAttributes ?? [])
          .filter((columnName) => this.entitySchema.Columns[columnName])
          .map((columnName) => this.entitySchema.Columns[columnName]),
      ];
      this.viewConfig = await this.viewConfigService.getInitialDSTExtension(this.dataModel, this.viewConfigPath);
      const dataViewInitParameters: DataViewInitParameters<PortalPersonAll> = {
        execute: (params: CollectionLoadParameters, signal: AbortSignal): Promise<TypedEntityCollectionData<PortalPersonAll>> =>
          this.personService.getAll(params, signal),
        schema: this.entitySchema,
        columnsToDisplay: this.displayedColumns,
        dataModel: this.dataModel,
        highlightEntity: (entity: PortalPersonAll) => {
          this.onHighlightedEntityChanged(entity);
        },
        groupExecute: (columnName: string, parameters: CollectionLoadParameters, signal: AbortSignal) =>
          this.personService.getGroupInfo({ ...parameters, by: columnName }),
        viewConfig: this.viewConfig,
      };
      this.dataSource.init(dataViewInitParameters);
    } finally {
      isBusy.endBusy();
    }
  }

  /**
   * Occurs when user selects a person.
   *
   * @param personAll Selected person.
   */
  public async onHighlightedEntityChanged(personAll: PortalPersonAll): Promise<void> {
    this.logger.debug(this, `Selected person changed`);
    this.logger.trace(this, 'New selected person', personAll);

    if (this.euiBusyService.overlayRefs.length === 0) {
      this.euiBusyService.show();
    }

    let config: EuiSidesheetConfig;

    try {
      config = {
        title: this.translateService.instant('#LDS#Heading View Identity Details'),
        subTitle: personAll.GetEntity().GetDisplay(),
        padding: '0',
        width: calculateSidesheetWidth(),
        testId: 'addressbook-view-identity-details',
        data: await this.addressbookService.getDetail(personAll, this.personConfig?.VI_MyData_WhitePages_DetailAttributes ?? []),
      };
    } finally {
      this.euiBusyService.hide();
    }

    this.sidesheet.open(AddressbookDetailComponent, config);
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
