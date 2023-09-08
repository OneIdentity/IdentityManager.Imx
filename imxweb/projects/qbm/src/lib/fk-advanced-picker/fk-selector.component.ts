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

import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';

import {
  TypedEntityBuilder,
  CollectionLoadParameters,
  DisplayColumns, ValType,
  TypedEntity,
  IForeignKeyInfo,
  FilterType,
  CompareOperator,
  DbObjectKey,
  DataModelFilter,
  FilterData,
  DataModel
} from 'imx-qbm-dbts';
import { ClassloggerService } from '../classlogger/classlogger.service';
import { MetadataService } from '../base/metadata.service';
import { DataSourceToolbarSettings } from '../data-source-toolbar/data-source-toolbar-settings';
import { CandidateEntity } from './candidate-entity';
import { DataTableComponent } from '../data-table/data-table.component';
import { ForeignKeyPickerData } from './foreign-key-picker-data.interface';
import { SettingsService } from '../settings/settings-service';
import { ClientPropertyForTableColumns } from '../data-source-toolbar/client-property-for-table-columns';
import { BusyService } from '../base/busy.service';

@Component({
  selector: 'imx-fk-selector',
  templateUrl: './fk-selector.component.html',
  styleUrls: ['./fk-selector.component.scss']
})
export class FkSelectorComponent implements OnInit {
  public settings: DataSourceToolbarSettings;
  public selectedTable: IForeignKeyInfo;
  public selectedCandidates: TypedEntity[] = [];
  public preselectedEntities: TypedEntity[];

  public readonly DisplayColumns = DisplayColumns; // Enables use of this static class in Angular Templates.

  @ViewChild(DataTableComponent) public dataTable: DataTableComponent<TypedEntity>;
  @Input() public data: ForeignKeyPickerData;
  @Output() public elementSelected = new EventEmitter<TypedEntity>();
  @Output() public tableselected = new EventEmitter<IForeignKeyInfo>();
  @Output() public selectedCandidatesChanges = new EventEmitter();

  public busyService = new BusyService();

  private readonly builder = new TypedEntityBuilder(CandidateEntity);
  private readonly entitySchema = CandidateEntity.GetEntitySchema();
  private filters: DataModelFilter[];
  private dataModel: DataModel;

  constructor(
    public readonly metadataProvider: MetadataService,
    private readonly settingsService: SettingsService,
    private readonly logger: ClassloggerService) {
  }

  public async ngOnInit(): Promise<void> {
    const isBusy = this.busyService.beginBusy();

    if (this.data.fkRelations && this.data.fkRelations.length > 0) {
      this.logger.trace(this, 'Pre-select the first candidate table');
      this.selectedTable = this.data.fkRelations.find(fkr => fkr.TableName === this.data.selectedTableName) || this.data.fkRelations[0];
      this.dataModel = await this.selectedTable.GetDataModel();
      this.filters = this.dataModel.Filters;
    }

    if (this.data.fkRelations && this.data.fkRelations.length > 0) {
      await this.metadataProvider.update(this.data.fkRelations.map(fkr => fkr.TableName));
    }
    await this.loadTableData();
    await this.getPreselectedEntities();
    if (this.preselectedEntities) {
      this.selectedCandidates = this.preselectedEntities;
    }
    this.logger.debug(this, 'Pre selected elements', this.selectedCandidates.length);

    isBusy.endBusy();    
  }

  public search(keywords: string): void {
    this.logger.debug(this, 'Search - keywords', keywords);
    this.loadTableData({ search: keywords });
  }

  public amIDisabled(item: TypedEntity): boolean {
    return this.data.disabledIds?.find( x => x === item.GetEntity().GetKeys()[0]) ? true : false;
  }

  /**
   * @ignore
   */
  public setSelectedClass(item: TypedEntity): any {
    if (this.data.isMultiValue || this.selectedCandidates.length === 0) {
      return;
    }

    return this.selectedCandidates[0] === item ?  {'imx-selected-row': true} : {};
  }

  /**
   * @ignore
   */
  public selectionChanged(selection: TypedEntity[]): void {
    this.logger.debug(this, 'Selected elements', selection.length);
    // TODO (TFS 806235): save selected object to MRU list
    this.selectedCandidates = selection;
    this.selectedCandidatesChanges.emit();
  }

  /**
   * @ignore
   */
  public selectObject(typedEntity: TypedEntity): void {
    this.selectionChanged([typedEntity]);
    this.elementSelected.emit(typedEntity);
  }

  /**
   * @ignore
   */
  public clearSelection(): void {
    this.dataTable.clearSelection();
  }

  /**
   * @ignore
   */
  public async tableChanged(): Promise<void> {
    await this.loadTableData({ StartIndex: 0, filter: undefined });
    this.tableselected.emit(this.selectedTable);
  }

  public async filterByTree(filters: FilterData[]): Promise<void> {
    return this.loadTableData({ StartIndex: 0, filter: filters });
  }

  /**
   * @ignore
   * updates the data source
   * @param newState the state of the data source
   */
  public async loadTableData(newState?: CollectionLoadParameters): Promise<void> {
    if (this.selectedTable) {
      const isBusy = this.busyService.beginBusy();
      try {
        let navigationState = this.settings && this.settings.navigationState ?
          this.settings.navigationState :
          { PageSize: this.settingsService.DefaultPageSize, StartIndex: 0 };

        if (newState) {
          navigationState = { ...navigationState, ...newState };
        }

        this.logger.debug(this, 'LoadTableData - loading with navigationState', navigationState);
        const displayedColumns: ClientPropertyForTableColumns[] = [];

        if (!this.data.isMultiValue) {
          displayedColumns.push({
            Type: ValType.String,
            ColumnName: 'Select',
            untranslatedDisplay: '#LDS#Selection'
      });
        }

        displayedColumns.push(DisplayColumns.DISPLAY_PROPERTY);

        this.settings = {
          dataSource: this.builder.buildReadWriteEntities(
            await this.selectedTable.Get(navigationState),
            this.entitySchema
          ),
          displayedColumns,
          entitySchema: this.entitySchema,
          filters: this.filters,
          dataModel: this.dataModel,
          navigationState,
          filterTree: {
            multiSelect: true,
            filterMethode: async (parentKey) => this.selectedTable.GetFilterTree(parentKey)
          }
        };
      } finally {
        isBusy.endBusy();
      }
    }
  }

  /**
   * @ignore
   * Gets the list of preselected entities.
   */
  private async getPreselectedEntities(): Promise<void> {
    if (this.data.fkRelations && this.data.fkRelations.length > 0 && this.data.idList && this.data.idList.length > 0) {
      const isBusy = this.busyService.beginBusy();
      try {
        const preselectedTemp: TypedEntity[] = [];
        this.preselectedEntities = null;

        this.logger.debug(this, 'Getting preselected entities');

        for (const key of this.data.idList) {
          let table: IForeignKeyInfo;
          if (this.data.fkRelations.length > 1) {
            const tableName = DbObjectKey.FromXml(key).TableName;
            table = this.data.fkRelations.find(fkr => fkr.TableName === tableName);
          }

          table = table || this.data.fkRelations[0];

          const navigationState: CollectionLoadParameters = {
            filter: [
              {
                ColumnName: table.ColumnName,
                Type: FilterType.Compare,
                CompareOp: CompareOperator.Equal,
                Value1: key
              }
            ]
          };
          this.logger.debug(this, 'Getting preselected entity with navigation state', navigationState);

          const result = this.builder.buildReadWriteEntities(
            await table.Get(navigationState),
            this.entitySchema
          );

          if (result.Data.length) {
            preselectedTemp.push(result.Data[0]);
          }
        }

        this.preselectedEntities = preselectedTemp;
        this.logger.debug(this, `Retrieved ${this.preselectedEntities.length} preselected entities`);
      } finally {
        isBusy.endBusy();
      }
    }
  }
}

