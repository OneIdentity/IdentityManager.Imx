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

import { computed, signal } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { CollectionLoadParameters, FilterTreeData, MethodDefinition, TypedEntity } from '@imx-modules/imx-qbm-dbts';
import { debounce } from 'lodash';
import { Observable, of } from 'rxjs';
import { ClassloggerService } from '../classlogger/classlogger.service';
import { ConfirmationService } from '../confirmation/confirmation.service';
import { DSTViewConfig } from '../data-source-toolbar/data-source-toolbar-view-config.interface';
import { SelectionModelWrapper } from '../data-source-toolbar/selection-model-wrapper';
import { SettingsService } from '../settings/settings-service';
import { SqlWizardApiService } from '../sqlwizard/sqlwizard-api.service';
import { DataViewSource } from './data-view-source';
import { DataViewInitParameters, GroupInfoRow, LocalDataViewInitParameters, WritableEntitySchema } from './data-view.interface';
export const FakeDataViewSource: Pick<DataViewSource, keyof DataViewSource> = {
  collectionData: signal({ totalCount: 0, Data: [] }),
  entitySchema: signal({ Columns: {}, LocalColumns: {} }),
  dataModel: signal(undefined),
  execute: () => Promise.resolve({ totalCount: 0, Data: [] }),
  entitySubject: signal([]),
  entitySubject$: of([]),
  count: 0,
  totalCount: signal(0),
  getAllSelectableEntities: signal([]),
  data: [],
  loading: signal(false),
  isLimitReached: signal(false),
  selection: new SelectionModelWrapper<TypedEntity>(),
  selectionChanged: signal(undefined),
  selectionChangeFunction: undefined,
  showOnlySelected: signal(false),
  columnsToDisplay: signal([]),
  initialColumnsToDisplay: [],
  optionalColumns: signal([]),
  additionalColumns: signal([]),
  additionalListColumns: signal(undefined),
  pageSizeOptions: [],
  sortId: signal(undefined),
  sortDirection: signal(''),
  state: signal({ undefined }),
  predefinedFilters: signal([]),
  externalFilters: signal([]),
  selectedFilters: signal([]),
  exportFunction: {
    getMethod: (withProperties: string, navigationState: CollectionLoadParameters, PageSize?: number) => ({}) as MethodDefinition<any>,
  },
  viewConfig: signal(undefined),
  showFilters: signal(false),
  currentSelectedEntityCount: signal(0),
  isAllSelected: signal(false),
  highlightedEntity: signal(undefined),
  highlightedExecute: undefined,
  itemStatus: {
    enabled: () => true,
  },
  groupOptions: [],
  groupByColumn: signal(null),
  groupData: signal(undefined),
  groupedDataSource: computed(() => ({}) as MatTableDataSource<GroupInfoRow>),
  nestedSelection: new Map(),
  filterTree: {
    filterMethode: (parentkey: string) => Promise.resolve({} as FilterTreeData),
  },
  filterTreeData: signal({}),
  filterTreeSelection: signal(undefined),
  settings: new SettingsService(),
  customIdentifier: '',
  log: {
    debug: () => {},
    info: () => {},
  } as unknown as ClassloggerService,
  confirmService: {} as ConfirmationService,
  sqlWizardApiService: {} as SqlWizardApiService,
  ngOnDestroy: function (): void {},
  connect: function (): Observable<readonly TypedEntity[]> {
    return of([]);
  },
  disconnect: function (): void {},
  init: async function (initParameters: DataViewInitParameters<TypedEntity>): Promise<void> {
    this.execute = initParameters.execute;
    await this.updateState();
    return Promise.resolve();
  },
  initLocal: async function (initParameters: LocalDataViewInitParameters<TypedEntity>): Promise<void> {
    return Promise.resolve();
  },
  isDataLocal: false,
  localDataCopy: [],
  getLocalPage: function (data: TypedEntity[]): TypedEntity[] {
    return [];
  },
  searchLocally: function (): void {},
  updateState: async function (): Promise<void> {
    let collectionData = await this.execute();
    console.log(collectionData);
    this.collectionData.set(collectionData);
    return Promise.resolve();
  },
  sortChange: function (sortState: Sort): void {},
  abortCall: function (): void {},
  resetView: function (): Promise<void> {
    return Promise.resolve();
  },
  applyConfig: function (config: DSTViewConfig): Promise<void> {
    return Promise.resolve();
  },
  setKeywords: function (keywords: string): void {},
  updateEntitySchema: function (additionalColumnNames: string[]): void {},
  debouncedHighlightRow: debounce((entity: TypedEntity, event?) => {}, 250),
  highlightRow: function (entity: TypedEntity, event?: MouseEvent): void {},
  isSortable: function (column: string | undefined): boolean {
    return false;
  },
  GetColumnDisplay: function (columnName: string, entitySchema?: WritableEntitySchema): string {
    return '';
  },
  // initOptionalColumns: function (): void {
  //
  // },
  initFilters: function (initParameters: DataViewInitParameters<TypedEntity>): Promise<void> {
    return Promise.resolve();
  },
};
