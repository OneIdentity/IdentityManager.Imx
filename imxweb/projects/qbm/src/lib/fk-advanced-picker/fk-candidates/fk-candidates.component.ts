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
import { Component, EventEmitter, Input, OnChanges, Output, ViewChild } from '@angular/core';
import { EuiLoadingService } from '@elemental-ui/core';

import {
  CollectionLoadParameters,
  DataModel,
  DisplayColumns,
  EntitySchema,
  FilterData,
  IForeignKeyInfo,
  TypedEntity,
  ValType,
} from '@imx-modules/imx-qbm-dbts';
import { BusyService } from '../../base/busy.service';
import { ClientPropertyForTableColumns } from '../../data-source-toolbar/client-property-for-table-columns';
import { DataSourceToolbarSettings } from '../../data-source-toolbar/data-source-toolbar-settings';
import { DataSourceToolbarComponent } from '../../data-source-toolbar/data-source-toolbar.component';
import { DataTableComponent } from '../../data-table/data-table.component';
import { TypedEntityFkData } from '../../entity/typed-entity-select/typed-entity-fk-data.interface';
import { SettingsService } from '../../settings/settings-service';
import { CandidateEntity } from '../candidate-entity';
import { FkCandidateEntityBuilderService } from './fk-candidate-entity-builder.service';
import { FkCandidatesData } from './fk-candidates-data.interface';

@Component({
  selector: 'imx-fk-candidates',
  templateUrl: './fk-candidates.component.html',
  styleUrls: ['./fk-candidates.component.scss'],
})
export class FkCandidatesComponent implements OnChanges {
  @Input() public data: FkCandidatesData | TypedEntityFkData;
  @Input() public selectedFkTable: IForeignKeyInfo;
  @Input() public showLongDisplay = false;
  @Input() public showSelectedItemsMenu = true;
  @Input() public noDataText: string;
  @Input() public busyService: BusyService;

  @Output() public readonly itemPicked = new EventEmitter<TypedEntity>();
  @Output() public readonly selectionChanged = new EventEmitter<TypedEntity[]>();

  public readonly DisplayColumns = DisplayColumns; // Enables use of this static class in the Angular Template.

  public settings: DataSourceToolbarSettings;
  public entitySchema: EntitySchema;
  public dataModel: DataModel | undefined;

  @ViewChild(DataTableComponent) private readonly table: DataTableComponent<TypedEntity>;
  @ViewChild(DataSourceToolbarComponent) private readonly dst: DataSourceToolbarComponent;

  private busyIndicator: OverlayRef | undefined;
  private abortController: AbortController = new AbortController();

  constructor(
    private readonly busyServiceElemental: EuiLoadingService,
    private readonly settingsService: SettingsService,
    private readonly candidateBuilder: FkCandidateEntityBuilderService,
  ) {}

  public async ngOnChanges(): Promise<void> {
    await this.getData({ StartIndex: 0, PageSize: this.settingsService.DefaultPageSize });
  }

  public async search(keywords: string): Promise<void> {
    return this.getData({ search: keywords });
  }

  /**
   * @ignore
   */
  public clearSelection(): void {
    this.table.clearSelection();
  }

  /**
   * @ignore
   */
  public clearTreeFilter(): void {
    this.dst.clearTreeFilter();
  }

  public get showToolbar(): boolean {
    return !!this.settings?.navigationState?.filter?.length;
  }

  public async filterByTree(filters: FilterData[]): Promise<void> {
    return this.getData({ StartIndex: 0, filter: filters });
  }

  /**
   * @ignore
   * updates the data source
   * @param newState the state of the data source
   */
  public async getData(newState?: CollectionLoadParameters): Promise<void> {
    // Abort any previous calls
    this.abortController.abort();
    this.abortController = new AbortController();

    let isBusy;
    if (this.busyService) {
      isBusy = this.busyService.beginBusy();
    } else {
      if (!this.busyIndicator) {
        this.busyIndicator = this.busyServiceElemental.show();
      }
    }
    try {
      let navigationState = this.settings?.navigationState
        ? { ...this.settings.navigationState, ...newState }
        : { PageSize: this.settingsService.DefaultPageSize, StartIndex: 0 };

      const dataSource = this.data.getTyped
        ? await this.data.getTyped(navigationState, { signal: this.abortController.signal })
        : this.candidateBuilder.build(
            this.selectedFkTable
              ? await this.selectedFkTable.Get(navigationState, { signal: this.abortController.signal })
              : this.data.Get
                ? await this.data.Get(navigationState, { signal: this.abortController.signal })
                : { TotalCount: 0 },
            this.selectedFkTable?.fkColumnName,
            this.selectedFkTable?.TableName,
          );
      const displayedColumns: ClientPropertyForTableColumns[] = [DisplayColumns.DISPLAY_PROPERTY];

      if (!this.data.isMultiValue) {
        displayedColumns.push({
          Type: ValType.String,
          ColumnName: 'Actions',
          untranslatedDisplay: '#LDS#Selection',
        });
      }
      this.entitySchema = CandidateEntity.GetEntitySchema(
        this.selectedFkTable?.fkColumnName ?? this.selectedFkTable?.ColumnName,
        this.selectedFkTable?.TableName,
      );
      this.settings = {
        dataSource,
        displayedColumns,
        entitySchema: this.entitySchema,
        navigationState,
        dataModel: this.data.GetDataModel ? await this.data.GetDataModel({ signal: this.abortController.signal }) : undefined,
        filterTree: {
          filterMethode: async (parentKey) => {
            return this.selectedFkTable
              ? this.selectedFkTable.GetFilterTree(parentKey, { signal: this.abortController.signal })
              : this.data.GetFilterTree
                ? this.data.GetFilterTree(parentKey, { signal: this.abortController.signal })
                : { Elements: [] };
          },
          multiSelect: false,
        },
      };
    } finally {
      setTimeout(() => {
        isBusy?.endBusy();
        if (this.busyIndicator) {
          this.busyServiceElemental.hide(this.busyIndicator);
          this.busyIndicator = undefined;
        }
      });
    }
  }
}
