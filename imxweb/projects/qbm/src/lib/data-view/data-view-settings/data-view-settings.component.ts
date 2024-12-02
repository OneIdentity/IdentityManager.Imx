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

import { Component, EventEmitter, Input, Output, Signal, computed } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EuiSidesheetService } from '@elemental-ui/core';
import { FilterType, IClientProperty } from '@imx-modules/imx-qbm-dbts';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { calculateSidesheetWidth } from '../../base/sidesheet-helper';
import { ConfirmationService } from '../../confirmation/confirmation.service';
import { DataExportComponent } from '../../data-export/data-export.component';
import { AdditionalInfosComponent } from '../../data-source-toolbar/additional-infos/additional-infos.component';
import { DataSourceToolbarSettings } from '../../data-source-toolbar/data-source-toolbar-settings';
import { DSTViewConfig } from '../../data-source-toolbar/data-source-toolbar-view-config.interface';
import { SaveConfigDialogComponent } from '../../data-source-toolbar/save-config-dialog/save-config-dialog.component';
import { SnackBarService } from '../../snackbar/snack-bar.service';
import { DataViewSource } from '../data-view-source';

@Component({
  selector: 'imx-data-view-settings',
  templateUrl: './data-view-settings.component.html',
})
export class DataViewSettingsComponent {
  /**
   * Input the dataViewSource service. It handles all the action and the data loading. This input property is required.
   */
  @Input({ required: true }) public dataSource: DataViewSource;
  /**
   * Event to emit a DSTViewConfig for post/put via the viewConfig.putViewConfig function.
   */
  @Output() public updateConfig = new EventEmitter<DSTViewConfig>();
  /**
   * Event to emit an DSTViewConfig.Id for delete via the viewConfig.deleteViewConfig function.
   */
  @Output() public deleteConfigById = new EventEmitter<string>();
  /**
   * Checks if we have any saved configs at all in settings.viewConfig.viewConfigs.
   */
  public hasSavedConfigs: Signal<boolean> = computed(
    () => !!this.dataSource.viewConfig()?.viewConfigs && !!this.dataSource.viewConfig()?.viewConfigs?.length,
  );

  constructor(
    private readonly sidesheetService: EuiSidesheetService,
    private readonly translateService: TranslateService,
    private dialog: MatDialog,
    private readonly confirm: ConfirmationService,
    private readonly snackbar: SnackBarService,
  ) {}

  /**
   * Opens the dataExportSidesheet component with the required settings.
   */
  public openExportSidesheet(): void {
    const settings: DataSourceToolbarSettings = {
      dataSource: this.dataSource.collectionData(),
      navigationState: this.dataSource.state(),
      entitySchema: this.dataSource.entitySchema(),
      dataModel: this.dataSource.dataModel(),
      exportMethod: this.dataSource.exportFunction,
      displayedColumns: this.dataSource.columnsToDisplay(),
    };
    this.sidesheetService.open(DataExportComponent, {
      title: this.translateService.instant('#LDS#Heading Export Data'),
      padding: '0px',
      width: calculateSidesheetWidth(),
      icon: 'export',
      data: settings,
    });
  }

  /**
   * Call DataViewSource resetView on reset view button click.
   */
  public onResetViewAndTree(): void {
    this.dataSource.resetView();
  }

  /**
   * Opens AdditionalInfosComponent dialog to add/remove columns and change column order.
   */
  public async updateAdditionalColumns(): Promise<void> {
    this.dialog
      .open(AdditionalInfosComponent, {
        width: 'min(1200px,70%)',
        autoFocus: false,
        height: 'min(700px,70%)',
        data: {
          dataModel: this.dataSource.dataModel(),
          entitySchema: this.dataSource.entitySchema(),
          displayedColumns: this.dataSource.initialColumnsToDisplay,
          additionalPropertyNames: this.dataSource.optionalColumns(),
          additionalColumns: [],
          preselectedProperties: [...this.dataSource.columnsToDisplay()],
        },
        panelClass: 'imx-toolbar-dialog',
      })
      .afterClosed()
      .subscribe(async (result: { all: IClientProperty[]; optionals: IClientProperty[] }) => {
        if (result) {
          const needsReload = result.optionals.some(
            (res) => this.dataSource.additionalColumns().find((sel) => sel.ColumnName === res.ColumnName) == null,
          );
          if (needsReload) {
            const additionalColumnNames = result.optionals.map((column) => column.ColumnName || '');
            this.dataSource.updateEntitySchema(additionalColumnNames);
            this.dataSource.state.update((state) => ({ ...state, withProperties: additionalColumnNames.join(',') }));
            await this.dataSource.updateState(true);
          }
          this.dataSource.additionalColumns.set(result.optionals);
          this.dataSource.columnsToDisplay.set(result.all);
        }
      });
  }

  /**
   * Opens the SaveConfigDialogComponent dialog and setup the a new config than emit that.
   */
  public async saveConfig(): Promise<void> {
    const displayName = await firstValueFrom(this.dialog.open(SaveConfigDialogComponent).afterClosed());
    if (!displayName) {
      return;
    }
    const existingConfig = this.dataSource.viewConfig()?.viewConfigs?.find((config) => config.DisplayName === displayName);
    if (existingConfig && existingConfig.Id === 'Default') {
      this.snackbar.open({
        key: '#LDS#You cannot overwrite the default view.',
      });
      return;
    }
    if (
      existingConfig &&
      !(await this.confirm.confirmDelete(
        '#LDS#Heading Overwrite View',
        '#LDS#A view with the entered name already exists. Do you want to overwrite the already existing view with the new view?',
      ))
    ) {
      return;
    }
    const config: DSTViewConfig = {
      Id: existingConfig?.Id,
      ViewId: this.dataSource.viewConfig()?.viewId,
      DisplayName: displayName,
      Filter: [
        ...(this.dataSource.state().filter || []),
        ...(this.dataSource.state().search ? [{ Type: FilterType.Search, Value1: this.dataSource.state().search }] : []),
      ],
      GroupBy: this.dataSource.groupByColumn()?.ColumnName,
      OrderBy: this.dataSource.state()?.OrderBy,
      AdditionalTableColumns: this.dataSource.additionalColumns().map((column) => column.ColumnName || ''),
      AdditionalParameters: this.dataSource
        .predefinedFilters()
        .filter((filter) => !!filter.CurrentValue)
        .reduce(
          (prevFilters: { [key: string]: string }, filter) => ({ ...prevFilters, [filter.Name || '']: filter.CurrentValue || '' }),
          {},
        ),
      UseAsDefault: false,
    };
    this.snackbar.open({
      key: '#LDS#The view has been successfully saved.',
    });
    this.updateConfig.emit(config);
  }

  /**
   * Checks the required config is dafault or not.
   * @param config The selected DSTViewConfig.
   * @returns Is config default.
   */
  public isDefaultId(config: DSTViewConfig): boolean {
    return config?.Id == 'Default';
  }

  /**
   * Checks the required config is used as favourite or not.
   * @param config The selected DSTViewConfig
   * @returns Config is favourite.
   */
  public isConfigDefault(config: DSTViewConfig): boolean {
    return config.UseAsDefault;
  }

  /**
   * Changes the default icons on screen to reflect which config is default, emits a updateConfig signal to change the data on the server
   * @param config the selected DSTViewConfig
   */
  public toggleDefaultConfig(config: DSTViewConfig): void {
    // Find the currently chosen default
    const lastDefaultConfig = this.dataSource.viewConfig()?.viewConfigs?.find((config) => config.UseAsDefault);
    if (!config.UseAsDefault) {
      if (lastDefaultConfig && lastDefaultConfig.Id !== config.Id) {
        // Set the previous config to false, as long as it isn't the same as the incoming config
        lastDefaultConfig.UseAsDefault = false;
      }
    }
    config.UseAsDefault = !config.UseAsDefault;
    if (!config?.IsReadOnly) {
      // We can safely update the chosen config as default, API will handle the others
      this.updateConfig.emit(config);
    }
    if (config?.IsReadOnly && lastDefaultConfig) {
      // We need to update the last config to be not-default, we cannot update the chosen as it is read-sonly
      lastDefaultConfig?.IsReadOnly ? null : this.updateConfig.emit(lastDefaultConfig);
    }
  }

  /**
   * Opens the SaveConfigDialogComponent dialog and update the selected config DisplayName.
   * @param config the selected DSTViewConfig
   */
  public async changeConfigName(config: DSTViewConfig): Promise<void> {
    await this.dialog
      .open(SaveConfigDialogComponent, {
        data: {
          currentName: config.DisplayName,
        },
      })
      .afterClosed()
      .subscribe((displayName) => {
        if (displayName) {
          config.DisplayName = displayName;
          this.updateConfig.emit(config);
        }
      });
  }

  /**
   * Remove the selected config after show confirm dialog by the id of the config.
   * @param id The id of the config.
   */
  public async removeConfigIndex(id?: string): Promise<void> {
    if (id && !(await this.confirm.confirmDelete('#LDS#Heading Delete View', '#LDS#Are you sure you want to delete the view?'))) {
      return;
    }
    this.deleteConfigById.emit(id);
  }
}
