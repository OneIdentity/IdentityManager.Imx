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

import { Component, Input, Signal, computed } from '@angular/core';
import { EuiSidesheetService } from '@elemental-ui/core';
import { FilterType, SqlWizardExpression } from '@imx-modules/imx-qbm-dbts';
import { TranslateService } from '@ngx-translate/core';
import { calculateSidesheetWidth } from '../../base/sidesheet-helper';
import { DataSourceToolbarFilter, DataSourceToolbarSelectedFilter } from '../../data-source-toolbar/data-source-toolbar-filters.interface';
import { FilterWizardComponent } from '../../data-source-toolbar/filter-wizard/filter-wizard.component';
import { FilterWizardResult, FilterWizardSidesheetData } from '../../data-source-toolbar/filter-wizard/filter-wizard.interfaces';
import { FilterWizardService } from '../../data-source-toolbar/filter-wizard/filter-wizard.service';
import { DataViewSource } from '../data-view-source';
import { ExpressionFilter, SelectedFilter, SelectedFilterType } from '../data-view.interface';

@Component({
  selector: 'imx-data-view-filter',
  templateUrl: './data-view-filter.component.html',
  styleUrls: ['./data-view-filter.component.scss'],
})
export class DataViewFilterComponent {
  /**
   * Input the DataViewSource service. It handles all the action and the data loading. This input property is required.
   */
  @Input({ required: true }) public dataSource: DataViewSource;
  /**
   * This unique id is required to use only the related navigationStateChanged events from FilterWizardService.
   */
  private id: string = new Date().toString();
  /**
   * Signal, that computes the SqlWizardExpression from the DataSourceToolbarCustomComponent.SelectedFilters signal.
   */
  private filterExpressions: Signal<SqlWizardExpression> = computed(
    () =>
      this.dataSource
        .selectedFilters()
        .filter((item) => item.type === SelectedFilterType.Custom)
        .map((filter: ExpressionFilter) => filter.value)[0],
  );
  /**
   * Signal, that computed the selected predefined filters from DataViewSource predefinedFilters signal.
   */
  private getSelectedPredefinedFilters: Signal<DataSourceToolbarSelectedFilter[]> = computed(() => {
    let selectedFilters: DataSourceToolbarSelectedFilter[] = [];
    this.dataSource.predefinedFilters().forEach((item) =>
      selectedFilters.push({
        filter: item,
        selectedOption: { Value: item.CurrentValue },
      }),
    );
    return selectedFilters;
  });

  /**
   * Signal, that computed the selected external filters from DataViewSource externalFilters signal.
   */
  private getSelectedExternalFilters: Signal<DataSourceToolbarSelectedFilter[]> = computed(() => {
    let selectedFilters: DataSourceToolbarSelectedFilter[] = [];
    this.dataSource.externalFilters().forEach((item) =>
      selectedFilters.push({
        filter: item,
        selectedOption: { Value: item.CurrentValue },
      }),
    );
    return selectedFilters;
  });

  private filterType: Signal<string> = computed(() => this.dataSource.filterTreeData().Description || '');

  constructor(
    public readonly filterService: FilterWizardService,
    private readonly sidesheetService: EuiSidesheetService,
    readonly translate: TranslateService,
  ) {
    // Updates the predefined and external filters from the filterWizardService
    this.filterService.navigationStateChanged.subscribe((state) => {
      if (state.id === this.id) {
        this.dataSource.state.set(state.params);
        this.dataSource.predefinedFilters.update((predefinedFilters) =>
          predefinedFilters.map((predefinedFilter) => ({
            ...predefinedFilter,
            CurrentValue: state.selectedFilters?.find((filter) => filter.filter?.Name === predefinedFilter.Name)?.filter?.CurrentValue,
          })),
        );
        const extFilters: DataSourceToolbarFilter[] = state.externalFilters.map((extFilter) => {
          const filter = state.externalFilters?.find((filter) => filter.isCustom);
          return {
            ...extFilter,
            CurrentValue: filter?.selectedOption?.Display,
            Name: filter?.filter?.Name,
          };
        });
        this.dataSource.externalFilters.update(() => extFilters);
      }
    });
  }

  /**
   * Show the filter wizard sidesheet component and update the state and the related signals in dataViewSource service.
   */
  public async onShowFilterWizard(): Promise<void> {
    const componentData: FilterWizardSidesheetData = {
      id: this.id,
      customIdentifier: this.dataSource.customIdentifier,
      settings: {
        dataSource: this.dataSource.collectionData(),
        navigationState: this.dataSource.state(),
        entitySchema: this.dataSource.entitySchema(),
        filters: this.dataSource.predefinedFilters(),
        dataModel: this.dataSource.dataModel(),
      },
      filterExpression: this.filterExpressions(),
      selectedFilters: this.getSelectedPredefinedFilters(),
      externalFilters: this.getSelectedExternalFilters(),
      isDataSourceLocal: false,
      filterTreeParameter: {
        filterTreeParameter: this.dataSource.filterTree,
        preSelection: this.dataSource.filterTreeSelection() || {},
        type: this.filterType(),
      },
    };
    const sidesheetRef = this.sidesheetService.open(FilterWizardComponent, {
      title: await this.translate.instant('#LDS#Heading Filter Data'),
      icon: 'filter',
      width: calculateSidesheetWidth(800, 0.5),
      padding: '0px',
      testId: 'filter-wizard-sidesheet',
      disableClose: true,
      data: componentData,
    });

    sidesheetRef.afterClosed().subscribe((result: FilterWizardResult) => {
      if (!result) {
        return;
      }
      if (!!result?.treeFilter && !!result?.treeFilter?.filter) {
        const otherFilter = (this.dataSource.state().filter ?? []).filter(
          (elem) => elem.ColumnName !== result.treeFilter?.filter?.ColumnName,
        );
        this.dataSource.filterTreeSelection.set(result.treeFilter);
        const filter = result.treeFilter.filter != null ? [result.treeFilter.filter].concat(otherFilter) : otherFilter;
        this.dataSource.state.update((state) => ({ ...state, filter }));
      } else {
        this.dataSource.state.update((state) => {
          const filter =
            state.filter?.filter((filter) => filter.ColumnName !== this.dataSource.filterTreeSelection()?.filter?.ColumnName) || [];
          return { ...state, filter };
        });
        this.dataSource.filterTreeSelection.set(undefined);
      }
      if (result?.expression?.Expression?.Expressions?.length === 0) {
        this.removeFilterWizard();
        return;
      }
      this.dataSource.state.update((state) => {
        const filter = state.filter?.filter((filter) => filter.Type !== FilterType.Expression) || [];
        filter.push({ Type: FilterType.Expression, Expression: result?.expression.Expression });
        return {
          ...state,
          filter,
        };
      });
      this.dataSource.selectedFilters.update((filters) => {
        const updatedFilters: SelectedFilter[] = filters.filter((filter) => filter.type !== SelectedFilterType.Custom);
        updatedFilters.push({ type: SelectedFilterType.Custom, value: result.expression });
        return updatedFilters;
      });
      this.dataSource.updateState();
    });
  }

  /**
   * Remove the filter wizard expression from the DataViewSource state signal and update calls DataViewSource updateState function.
   */
  public removeFilterWizard(): void {
    this.dataSource.state.update((state) => ({ ...state, filter: state.filter?.filter((x) => x.Expression == null) }));
    this.dataSource.updateState();
  }
}
