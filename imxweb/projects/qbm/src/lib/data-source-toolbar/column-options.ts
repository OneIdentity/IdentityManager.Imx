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

import { EventEmitter, Injector } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DataModel, DataModelViewConfig, EntitySchema, IClientProperty, ValType } from 'imx-qbm-dbts';
import { ClassloggerService } from '../classlogger/classlogger.service';
import { StorageService } from '../storage/storage.service';
import { AdditionalInfosComponent } from './additional-infos/additional-infos.component';
import { DataSourceToolbarSettings } from './data-source-toolbar-settings';
import _ from 'lodash';

export interface ShownClientPropertiesArg {
  properties: IClientProperty[];
  needsReload: boolean;
}
export class ColumnOptions {

  /**
   * A list of client properties, that will be shown in the DataTable
   */
  public shownClientProperties: IClientProperty[] = [];

  /**
   * List of possible addable columns
   */
  public optionalColumns: IClientProperty[] = [];

  /**
   * A list of client properties, that should be shown in the main column
   */
  public additionalListElements: IClientProperty[] = [];

  public selectedOptionals: IClientProperty[] = [];

  /**
   * currently used view settings
   */
  public currentViewSettings: DataModelViewConfig;

  /**
   * Event, that emits, when the shownClientProperies Property changes
   */
  public shownColumnsSelectionChanged = new EventEmitter<ShownClientPropertiesArg>();

  /**
   * Event, that emits, when the additionalListElements Property changes
   */
  public additionalListElementsChanged = new EventEmitter<IClientProperty[]>();

  /**
   * Indicates whether there are optional columns or not
   */
  public get hasOptionalColumns(): boolean {
    return this.currentViewSettings && this.optionalColumns?.length > 0;
  }

  public get additionalColumns(): IClientProperty[] {
    return this.currentViewSettings?.AdditionalTableColumns?.map(elem =>
      ColumnOptions.getClientProperty(ColumnOptions.findKey(elem, this.entitySchema), this.dataModel, this.entitySchema)) ?? [];
  }

  // private services
  private store: StorageService;
  private dialog: MatDialog;
  private logger: ClassloggerService;

  // getter for settings
  private get dataModel(): DataModel { return this.settings.dataModel; }
  private entitySchema: EntitySchema;
  private get displayedColumns(): IClientProperty[] { return this.settings.displayedColumns; }

  private originalEntitySchema;

  constructor(
    public settings: DataSourceToolbarSettings,
    injector: Injector
  ) {
    this.currentViewSettings = this.dataModel.Configurations?.
      find(elem => elem.Id === this.dataModel.DefaultConfigId);

    if (this.currentViewSettings) {
      // Clean up settings, if there are null or empty columnsnames attached
      if (this.currentViewSettings.AdditionalListColumns
        && this.currentViewSettings.AdditionalListColumns.some(elem => elem == null || elem === '')) {
        (this.currentViewSettings.AdditionalListColumns as any) =
          this.currentViewSettings.AdditionalListColumns.filter(elem => elem != null && elem !== '');
      }

      if (this.currentViewSettings.AdditionalTableColumns
        && this.currentViewSettings.AdditionalTableColumns.some(elem => elem == null || elem === '')) {
        (this.currentViewSettings.AdditionalTableColumns as any) =
          this.currentViewSettings.AdditionalTableColumns.filter(elem => elem != null && elem !== '');
      }
    }

    // initializing of services
    this.store = injector.get(StorageService);
    this.dialog = injector.get(MatDialog);
    this.logger = injector.get(ClassloggerService);
    this.entitySchema = _.cloneDeep(this.settings.entitySchema);
    this.originalEntitySchema = _.cloneDeep(this.entitySchema);
  }

  public getPropertiesForNavigation(): string[] {
    const additional = this.additionalColumns;
    return this.shownClientProperties.filter(elem =>
      this.displayedColumns.findIndex(disp => disp.ColumnName === elem.ColumnName) === -1 &&
      additional.findIndex(disp => disp.ColumnName === elem.ColumnName) === -1
    ).map(elem => elem.ColumnName);
  }

  /**
   *  Shows a dialog for adding/removing optional columns
   */
  public async updateAdditional(): Promise<void> {
    const additional = this.additionalColumns;
    const displayedColumns = [
      ...this.displayedColumns,
      ...additional];
    this.logger.trace(this, 'unchangeable columns', displayedColumns);
    const result: { all: IClientProperty[], optionals: IClientProperty[] }
      = await this.dialog.open(AdditionalInfosComponent, {
        width: 'min(1200px,70%)',
        autoFocus: false,
        height: 'min(700px,70%)',
        data: {
          dataModel: this.dataModel,
          entitySchema: this.entitySchema,
          displayedColumns,
          additionalPropertyNames: this.optionalColumns,
          preselectedProperties: [...this.shownClientProperties]
        },
        panelClass: 'imx-toolbar-dialog'
      }).afterClosed().toPromise();
    if (result) {
      if (JSON.stringify(this.shownClientProperties) === JSON.stringify(result.all)) { return; }

      this.shownClientProperties = result.all;

      const needsReload = result.optionals.length > this.selectedOptionals.length
        || result.optionals.some(res => this.selectedOptionals.find(sel => sel.ColumnName === res.ColumnName) == null);
      this.selectedOptionals = result.optionals;
      this.logger.trace(this, 'new displayed columns', result.all, 'new optional columns', result.optionals, 'needs reload', needsReload);

      this.shownColumnsSelectionChanged.emit({ properties: this.shownClientProperties, needsReload });

      if (this.settings.identifierForSessionStore) {
        this.store.storeProperties('columns-' + this.settings.identifierForSessionStore,
          this.shownClientProperties.map(elem => elem.ColumnName));
        this.store.storeProperties('columns-additional-' + this.settings.identifierForSessionStore,
          this.currentViewSettings?.AdditionalTableColumns ?? []);
        this.logger.trace(this, `properties stored under ${'columns-' + this.settings.identifierForSessionStore}:`
          , this.shownClientProperties.map(elem => elem.ColumnName));
      }
    }
  }

  /**
   * resets the view by removing all optional columns and restoring the initial order
   */
  public resetView(): void {
    if (this.currentViewSettings == null) { return; }

    const addition = this.additionalColumns;
    const properties = [...this.displayedColumns, ...addition];
    this.selectedOptionals = [];
    this.shownClientProperties = properties;

    this.shownColumnsSelectionChanged.emit({ properties, needsReload: false });
    this.logger.trace(this, 'shown client properties resetted to', this.shownClientProperties);

    if (this.settings.identifierForSessionStore) {
      this.store.removeKeys(
        'columns-additional-' + this.settings.identifierForSessionStore,
        'columns-' + this.settings.identifierForSessionStore
      );
    }
  }

  /**
   * updates the entity schema by adding optional columns
   * @returns the updated entity schema
   */
  public updateEntitySchema(): EntitySchema {
    this.entitySchema = _.cloneDeep(this.originalEntitySchema);
    const elements = this.getPropertiesForNavigation();

    if (this.currentViewSettings?.AdditionalTableColumns) {
      elements.push(...this.currentViewSettings.AdditionalTableColumns);
    }
    if (this.currentViewSettings?.AdditionalListColumns) {
      elements.push(...this.currentViewSettings.AdditionalListColumns);
    }

    if (elements.length > 0) {
      this.logger.trace(this, 'properties, that have to be updated', elements);
      // hack for adding the new columns to to entitySchema
      elements.forEach(element => {
        const key = ColumnOptions.findKey(element, this.entitySchema);
        (this.entitySchema.Columns[key] as any) = ColumnOptions.getClientProperty(key, this.dataModel, this.entitySchema);
      });
    }

    this.logger.trace(this, 'new entitySchema', this.entitySchema);
    return this.entitySchema;
  }

  /**
   * inits the the optional columns, the shown client properties and the additional information for the display columns
   */
  public initColumnsAndAdditionalInformation(): void {
    this.initOptionalColumns();

    if (this.shownClientProperties.length === 0) {
      this.initShownClientProperties();
    }

    this.loadShownClientPropertiesFromStore();

    this.initAdditionalListElements();

    this.shownColumnsSelectionChanged.emit({ properties: this.shownClientProperties, needsReload: true });
  }

  private initOptionalColumns(): void {
    const optional = this.dataModel.Properties?.filter(elem => elem.IsAdditionalColumn).map(elem => elem.Property);

    this.optionalColumns = optional?.filter((value, index, categoryArray) =>
        this.isAdditional(value.ColumnName)
        && categoryArray.indexOf(value) === index);


    this.logger.trace(this, 'optional columns', this.optionalColumns);
  }

  private initShownClientProperties(): void {
    const current = this.currentViewSettings?.AdditionalTableColumns?.
      map(elem => ColumnOptions.getClientProperty(elem, this.dataModel)) ?? [];

    this.shownClientProperties = [
      ...this.displayedColumns,
      ...current,
    ];
    if (this.selectedOptionals?.length) {
      this.shownClientProperties.push(...this.selectedOptionals);
    }

    this.logger.trace(this, 'shown client properties initialized with', this.shownClientProperties);
  }

  private loadShownClientPropertiesFromStore(): void {
    if (!this.settings.identifierForSessionStore) {
      return;
    }

    const columns = this.store.getProperties('columns-' + this.settings.identifierForSessionStore);
    const addColumns = this.store.getProperties('columns-additional-' + this.settings.identifierForSessionStore);
    const showsAdditionals =
      (this.currentViewSettings?.AdditionalTableColumns ?? []).length === addColumns.length &&
      (this.currentViewSettings?.AdditionalTableColumns ?? []).every(add => addColumns.includes(add));

    if (columns?.length > 0 && showsAdditionals) {
      this.shownClientProperties = columns.map(column =>
        ColumnOptions.getClientProperty(column, this.dataModel, this.entitySchema));

      this.selectedOptionals = this.shownClientProperties.filter(elem => this.isAdditional(elem.ColumnName));

      this.shownColumnsSelectionChanged.emit({ properties: this.shownClientProperties, needsReload: true });
      this.logger.trace(this, 'columns loaded from store', this.shownClientProperties);
    } else {
      this.store.removeKeys(
        'columns-additional-' + this.settings.identifierForSessionStore,
        'columns-' + this.settings.identifierForSessionStore
      );
    }
  }

  private initAdditionalListElements(): void {
    const lists = this.currentViewSettings?.AdditionalListColumns;
    if (lists?.length > 0) {
      this.additionalListElements = lists.map(elem =>
        ColumnOptions.getClientProperty(ColumnOptions.findKey(elem, this.entitySchema), this.dataModel, this.entitySchema));
      this.additionalListElementsChanged.emit(this.additionalListElements);
      this.logger.trace(this, 'additional list elements from viewSettings', this.additionalListElements);
    }
  }

  private isAdditional(key: string): boolean {
    return this.displayedColumns.find(elem => elem.ColumnName.toLocaleLowerCase() === key.toLocaleLowerCase()) == null
      &&
      this.currentViewSettings?.AdditionalListColumns?.find(elem => elem.toLocaleLowerCase() === key.toLocaleLowerCase()) == null
      &&
      this.currentViewSettings?.AdditionalTableColumns?.find(elem => elem.toLocaleLowerCase() === key.toLocaleLowerCase()) == null
  }

  public static getClientProperty(name: string, dataModel: DataModel, entitySchema?: EntitySchema): IClientProperty {
    let property: IClientProperty;
    if (entitySchema) {
      const key = ColumnOptions.findKey(name, entitySchema);
      property = key != null ? entitySchema.Columns[key] : null;
    }
    if (property == null) {
      property = dataModel?.Properties?.
        find(elem => elem?.Property?.ColumnName?.toLocaleLowerCase() === name?.toLocaleLowerCase())?.Property;
    }
    if (property == null) {
      property = { ColumnName: name, Type: ValType.String };
    }
    return property;
  }

  private static findKey(key: string, schema: EntitySchema): string {
    const keyVariant = Object.keys(schema.Columns).find(elem => elem.toLocaleLowerCase() === key.toLocaleLowerCase());
    return keyVariant ?? key;
  }
}
