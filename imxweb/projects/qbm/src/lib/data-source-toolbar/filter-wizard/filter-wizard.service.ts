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

import { EventEmitter, Injectable } from '@angular/core';
import { CollectionLoadParameters } from 'imx-qbm-dbts';
import { DataSourceToolbarSelectedFilter } from '../data-source-toolbar-filters.interface';
import { FilterFormState, FilterTypeIdentifier } from './filter-wizard.interfaces';
import { SqlWizardApiService } from '../../sqlwizard/sqlwizard-api.service';

@Injectable({
  providedIn: 'root'
})
export class FilterWizardService {
  public navigationStateChanged = new EventEmitter<selectedFiltersParams>();
  public applyFiltersEvent = new EventEmitter<boolean>();
  public clearFiltersEvent = new EventEmitter<boolean>();
  public filterFormStateEvent = new EventEmitter<FilterFormState>();
  public filterTabChangedEvent = new EventEmitter<FilterTypeIdentifier>();

  constructor(public readonly sqlWizardSvc: SqlWizardApiService) { }

  public get isSqlWizardImplemented(): boolean {
    return this.sqlWizardSvc.implemented;
  }

  public updateNavigation(id: string, params: CollectionLoadParameters, selectedFilters: DataSourceToolbarSelectedFilter[]): void {
    this.navigationStateChanged.emit({ id: id, params: params, selectedFilters: selectedFilters });
  }

  public applyFilters(): void {
    this.applyFiltersEvent.emit();
  }

  public clearFilters(): void {
    this.clearFiltersEvent.emit();
  }

  public formStatusChanged(formState: FilterFormState): void {
    this.filterFormStateEvent.emit(formState);
  }

  public filterTabChanged(tabIdentifier: FilterTypeIdentifier): void {
    this.filterTabChangedEvent.emit(tabIdentifier);
  }
}

export interface selectedFiltersParams {
  id:  string;
  params: CollectionLoadParameters;
  selectedFilters: DataSourceToolbarSelectedFilter[];
}
