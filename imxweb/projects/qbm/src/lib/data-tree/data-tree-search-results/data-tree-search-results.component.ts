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

import { Component, ContentChild, EventEmitter, Input, OnChanges, Output, SimpleChanges, TemplateRef } from '@angular/core';
import { MatSelectionListChange } from '@angular/material/list';
import { PageEvent } from '@angular/material/paginator';

import { CollectionLoadParameters, IEntity } from 'imx-qbm-dbts';
import { ClassloggerService } from '../../classlogger/classlogger.service';
import { TreeDatabase } from '../tree-database';

@Component({
  selector: 'imx-data-tree-search-results',
  templateUrl: './data-tree-search-results.component.html',
  styleUrls: ['./data-tree-search-results.component.scss', '../data-tree-no-results.scss']
})

/** A component, that can display the search result for a{@link DataTreeComponent|data tree} */
export class DataTreeSearchResultsComponent implements OnChanges {

  /** determines whether the control allows multiselect or not  */
  @Input() public withMultiSelect: boolean;
  /** currently selected entities */
  @Input() public selectedEntities: IEntity[] = [];

  /**
   * This text will be displayed when a search or filter is applied but there is no data as a result
   * Defaults to a generic message when not supplied
   */
  @Input() public noMatchingDataText = '#LDS#There is no data matching your search.';

  /**
   * This icon will be displayed along with the 'noMatchingDataTranslationKey' text when a search or filter
   * is applied but there is no data as a result
   * Defaults to the 'search' icon when not supplied
   */
  @Input() public noMatchingDataIcon = 'search';

  /** @ignore the search results */
  public searchResults: IEntity[] = [];

  /** the service providing the data for the {@link TreeDatasource| TreeDatasource} */
  @Input() public database: TreeDatabase;

  @Input() public navigationState: CollectionLoadParameters;

  @Input() public withSelectedNodeHighlight: boolean;

  @ContentChild(TemplateRef, { static: true }) public templateRef: TemplateRef<any>;

  /** @ignore list of options, that are shown as selected */
  public selectedOptions: IEntity[] = [];

  /** @ignore the length for the paginator */
  public paginatorLength: number;

  /** @ignore the pagesiuze for the paginator */
  public paginatorPageSize = 25;

  public loading = true;
  public selectedEntity: IEntity;

  /**
   * Event, that will fire when the a node was selected and emitting a list of
   * {@link IEntity| Entities} of the selected node and it's parents.
   */
  @Output() public nodeSelected = new EventEmitter<IEntity>();

  /** event, that fires, after the checked nodes list has been updated */
  @Output() public checkedNodesChanged = new EventEmitter();

  constructor(private readonly logger: ClassloggerService) { }

  public async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes['navigationState']) {
      await this.reload();
    }
  }

  /** @ignore compares two items of the mat-selection-list */
  public compareFunction = (o1: any, o2: any) => {
    this.logger.log(this, 'compare', o1, o2);
    return this.getId(o1) === this.getId(o2);
  }

  /**
   * clears all selected nodes for the tree and listings
   */
  public clearSelection(): void {
    this.selectedOptions = [];
  }

  public async reload(): Promise<void> {
    this.loading = true;
    const data = await this.database.getData(true, this.navigationState);
    this.loading = false;
    this.paginatorLength = data.totalCount;
    this.searchResults = data.entities;
    this.selectedOptions = this.searchResults.filter(elem => this.entityIsChecked(elem));
  }


  /** @ignore updates the selection list an emits the according events */
  public onSelectionChanged(selection: MatSelectionListChange): void {
    this.updateSelectedEntities(selection.options[0].value, selection.options[0].selected);
    this.checkedNodesChanged.emit();
  }

  public resultClicked(entity: IEntity): void {
    this.selectedEntity = entity;
    this.nodeSelected.emit(entity);
  }

  /**
   * @ignore Receives the new navigation state (e.g. page size etc) of the paginator and emits it.
   */
  public async onPaginatorStateChanged(newState: PageEvent): Promise<void> {
    this.paginatorPageSize = newState.pageSize;
    this.loading = true;

    const state = {
      ...this.navigationState,
      ...{
        StartIndex: newState.pageIndex * newState.pageSize,
        PageSize: newState.pageSize,
      }
    };
    const data = await this.database.getData(true, state);
    this.loading = false;
    this.searchResults = data.entities;
    this.selectedOptions = this.searchResults.filter(elem => this.entityIsChecked(elem));
    this.paginatorLength = data.totalCount;
  }

  /** @ignore checks, if an element is selected or not */
  public isSelected(value: IEntity): boolean {
    if (this.withMultiSelect) { return false; }
    return this.selectedEntities.some(elem => this.getId(elem) === this.getId(value));
  }

  private updateSelectedEntities(current: IEntity, checked: boolean): void {
    if (checked) {
      this.selectedEntities.push(current);
    } else {
      const index = this.selectedEntities.findIndex(elem => this.getId(elem) === this.getId(current));
      this.selectedEntities.splice(index, 1);
    }
  }

  private entityIsChecked(entity: IEntity): boolean {
    this.logger.log(this, 'Keys',
      this.selectedEntities,
      this.getId(entity), this.selectedEntities.some(elem => this.getId(entity) === this.getId(elem)));
    return this.selectedEntities.some(elem => this.getId(entity) === this.getId(elem));
  }

  private getId(entity: IEntity): string {
    return TreeDatabase.getId(entity);
   }

}
