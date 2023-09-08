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
import { TranslateService } from '@ngx-translate/core';
import {
  DataModelFilterOption,
  DbObjectKey,
  DisplayColumns,
  EntitySchema,
  IClientProperty,
  TypedEntity
} from 'imx-qbm-dbts';
import { MetadataService } from '../../base/metadata.service';
import { CdrFactoryService } from '../../cdr/cdr-factory.service';
import { DataSourceToolbarFilter } from '../../data-source-toolbar/data-source-toolbar-filters.interface';
import { DataSourceToolbarSettings } from '../../data-source-toolbar/data-source-toolbar-settings';
import { CandidateEntity } from '../../fk-advanced-picker/candidate-entity';
import { SelectedElementsDialogParameter } from './selected-elements-dialog.model';
import { TypedEntityTableFilter } from './selected-elements-dialog.model';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

/**
 * A component, that can be shown inside a MatDialogComponent. It contains a table of entities with their display value as a column
 * If the entities, that are displayed, originated from different tables, the table name is displayed as a column as well
 * To use this, some {@link SelectedElementsDialogParameter | dialog parameter } has to be injected
 * 
 * Example: 
 *  this.dialog.open(SelectedElementsDialog, {
 *     data: { entities: [array of entities], tables: [array of table names], header: 'translated header text' },
 *   });
 */
@Component({
  templateUrl: './selected-elements-dialog.component.html',
  styleUrls: ['./selected-elements-dialog.component.scss'],
})
export class SelectedElementsDialog implements OnInit {
  public readonly DisplayColumns = DisplayColumns; // Enables use of this static class in Angular Templates.
  public dstSettings: DataSourceToolbarSettings;
  public readonly entitySchemaCandidates: EntitySchema;

  private navigationState: TypedEntityTableFilter = { StartIndex: 0, PageSize: 20 };
  private readonly displayedColumns: IClientProperty[];
  private readonly sortedEntities: TypedEntity[];
  private searchedEntities: TypedEntity[];
  private filters: DataSourceToolbarFilter[];

  constructor(
    @Inject(MAT_DIALOG_DATA) public readonly data: SelectedElementsDialogParameter,
    private translate: TranslateService,
    private metaData: MetadataService
  ) {
    this.entitySchemaCandidates = CandidateEntity.GetEntitySchema();
    this.displayedColumns = [this.entitySchemaCandidates.Columns[DisplayColumns.DISPLAY_PROPERTYNAME]];
    this.sortedEntities = data.entities?.sort((a, b) => a.GetEntity().GetDisplay()?.localeCompare(b.GetEntity()?.GetDisplay()));
  }

  public async ngOnInit(): Promise<void> {
    this.searchedEntities = [...this.sortedEntities];
    if (this.data.tables && this.data.tables.length > 1) {
      this.metaData.update(this.data.tables);
    }
    this.filters =
      this.data.tables && this.data.tables.length > 1
        ? [
            {
              Name: 'table',
              Description: await this.translate.get('#LDS#Type').toPromise(),
              Options: this.getOptionsForFilter(),
            },
          ]
        : [];
    this.navigate(this.navigationState);
  }

  /**
   * Filters the table for entities for captions, that contain a search value
   * @param key the value that should be searched
   */
  public search(key: string): void {
    if (key === '') {
      this.searchedEntities = [...this.sortedEntities];
    } else {
      this.searchedEntities = this.sortedEntities.filter((elem) =>
        elem.GetEntity().GetDisplay().toLocaleLowerCase().includes(key.toLocaleLowerCase())
      );
    }
    this.navigate({ StartIndex: 0, search: key });
  }

  /**
   * A local navigation method, that handles the navigation inside the datas source
   * @param source A {@link TypedEntityTableFilter | table filter}, that contains navigation information
   */
  public navigate(source: TypedEntityTableFilter): void {
    this.navigationState = { ...this.navigationState, ...source };
    const possible = source.table
      ? this.searchedEntities.filter((elem) =>
          CdrFactoryService.tryGetColumn(elem.GetEntity(), 'XObjectKey')?.GetValue()?.includes(source.table)
        )
      : this.searchedEntities;

    const data = possible.slice(this.navigationState.StartIndex, this.navigationState.StartIndex + this.navigationState.PageSize);
    this.dstSettings = {
      displayedColumns: this.displayedColumns,
      dataSource: {
        Data: data,
        totalCount: possible.length,
      },
      filters: this.filters,
      entitySchema: this.entitySchemaCandidates,
      navigationState: this.navigationState,
    };
  }

  /**
   * Gets the table name that is stored inside the XObjectKey of an entity
   * @param entity the entity, which table should be requested
   * @returns  the name of the table associated with the entity
   */
  public getTable(entity: TypedEntity): string {
    if (!this.data.tables || this.data.tables.length <= 1) {
      return '';
    }
    const column = CdrFactoryService.tryGetColumn(entity.GetEntity(), 'XObjectKey');
    if (!column) {
      return '';
    }
    const tableName = DbObjectKey.FromXml(column.GetValue()).TableName;
    return this.metaData.tables[tableName]?.DisplaySingular;
  }

  private getOptionsForFilter(): DataModelFilterOption[] {
    return this.data.tables
      .map((elem) => ({ Value: elem, Display: this.metaData.tables[elem]?.DisplaySingular }))
      .filter((elem) =>
        this.data.entities.some((entity) =>
          CdrFactoryService.tryGetColumn(entity.GetEntity(), 'XObjectKey')?.GetValue().includes(elem.Value)
        )
      );
  }
}
