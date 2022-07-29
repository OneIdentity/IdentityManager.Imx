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
 * Copyright 2022 One Identity LLC.
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

import { Component, Output, EventEmitter, Input, OnDestroy, ViewChild, OnChanges, SimpleChanges, ContentChild, TemplateRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';

import { CollectionLoadParameters, IEntity } from 'imx-qbm-dbts';
import { TreeDatabase } from './tree-database';
import { ClassloggerService } from '../classlogger/classlogger.service';
import { TreeSelectionListComponent } from './tree-selection-list/tree-selection-list.component';
import { CheckableTreeComponent } from './checkable-tree/checkable-tree.component';
import { DataTreeSearchResultsComponent } from './data-tree-search-results/data-tree-search-results.component';

@Component({
  selector: 'imx-data-tree',
  templateUrl: './data-tree.component.html',
  styleUrls: ['./data-tree.component.scss', './data-tree-no-results.scss']
})
/**
 * A tree component consinsting of a {@link CheckableTreeComponent|checkable tree component}, an
 *  {@link EuiSearchComponent|elemental UI search control} an a {@link DataTreeSearchResultsComponent|result list}
 */
export class DataTreeComponent implements OnChanges, OnDestroy {

  /**
   * This text will be displayed when there is no data on the datasource (and a search/filter is not applied)
   * Defaults to a generic message when not supplied
   */
  @Input() public noDataText = '#LDS#No data';

  /**
   * This icon will be displayed when there is no data on the datasource (and a search is not applied)
   * Defaults to the 'table' icon when not supplied
   */
  @Input() public noDataIcon = 'table';

  @Input() public withSelectedNodeHighlight: boolean;

  /** currently selected entities */
  @Input() public selectedEntities: IEntity[] = [];

  /** the service providing the data for the {@link TreeDatasource| TreeDatasource} */
  @Input() public database: TreeDatabase;

  /** the caption displaying when an empty node is added at the top of the tree  */
  @Input() public emptyNodeCaption: string;

  /** determines whether the control allows multiselect or not  */
  @Input() public withMultiSelect: boolean;

  @Input() public navigationState: CollectionLoadParameters;

  @Input() public hideSelection = false;

  /**
   * Event, that will fire when the a node was selected and emitting a list of
   * {@link IEntity| Entities} of the selected node and it's parents.
   */
  @Output() public nodeSelected = new EventEmitter<IEntity>();

  /** Ebvent, that will fire, if the checked nodes ware updated */
  @Output() public checkedNodesChanged = new EventEmitter();

  public hasTreeData = true;

  /** @ignore The actual tree control */
  @ViewChild(CheckableTreeComponent) public simpleTree: CheckableTreeComponent;

  /** @ignore the search resulst */
  @ViewChild(DataTreeSearchResultsComponent) public searchResults: DataTreeSearchResultsComponent;

  @ContentChild(TemplateRef, { static: true }) public templateRef: TemplateRef<any>;

  private subscriptions: Subscription[] = [];

  constructor(
    public dialog: EuiSidesheetService,
    private readonly logger: ClassloggerService,
    private readonly translator: TranslateService
  ) {
  }

  public async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes['database']) {
      this.hasTreeData = true; // because of 298890: (await this.database.getData(true, { PageSize: -1 })).totalCount > 0;
    }
  }

  public ngOnDestroy(): void {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }

  /** @ignore redirects the checkedNodesChanged event from the {@link CheckableTreeComponent|checkable tree component} */
  public selectedNodesChanged(): void {
    this.checkedNodesChanged.emit();
  }

  /** @ignore redirects the nodeSelected event from the {@link CheckableTreeComponent|checkable tree component} */
  public async onNodeSelected(entity: IEntity): Promise<void> {
    this.nodeSelected.emit(entity);
  }

  /** clears all selected nodes for the tree and listings */
  public clearSelection(): void {
    this.selectedEntities = [];
    this.simpleTree?.clearSelection();
    this.searchResults?.clearSelection();
  }

  /** reloads data for the tree and the result list */
  public reload(): void {
    this.simpleTree?.reload();
  }

  /** @ignore opens a side sheet containing the  {@link TreeSelectionListComponent|selected elements} */
  public async onOpenSelectionDialog(): Promise<void> {
    const dialogRef = this.dialog.open(TreeSelectionListComponent, {
      title: await this.translator.get('#LDS#Heading Selected Items').toPromise(),
      headerColour: 'iris-blue',
      panelClass: 'imx-sidesheet',
      padding: '0',
      width: '50%',
      testId: 'data-tree-selected-elements-sidesheet',
      data: this.selectedEntities
    });

    this.subscriptions.push(dialogRef.afterClosed().subscribe(result => {
      this.logger.log(this, 'The dialog was closed', result);
    }));
  }

  public hasSearchResults(): boolean {
    return this.navigationState?.search && this.navigationState?.search !== null && this.navigationState?.search !== '';
  }
}
