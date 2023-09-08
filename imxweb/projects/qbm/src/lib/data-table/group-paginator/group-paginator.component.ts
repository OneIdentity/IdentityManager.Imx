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

import { Component, Input, Output, EventEmitter, OnChanges, ViewChild, OnDestroy } from '@angular/core';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { Subscription } from 'rxjs';

import { CollectionLoadParameters, GroupInfoData } from 'imx-qbm-dbts';

export interface GroupPaginatorInformation {
  currentData: GroupInfoData;
  navigationState: CollectionLoadParameters;
}

/**
 * Paginator for navigating groups of a type {@link DataSourceToolbarComponent| datasource toolbar component}.
 *
 * @example
 * A paginator with a corresponding dst.
 *
 * <imx-data-source-toolbar #dst
 *                [settings]="mySettings"
 *                (navigationStateChanged)="myNavigationStateChanged($event)"></imx-data-source-toolbar>
 * <imx-group-paginator [groupPaginatorInformation]="informationForGroupSettings"></imx-group-paginator>
 */
@Component({
  selector: 'imx-group-paginator',
  templateUrl: './group-paginator.component.html',
  styleUrls: ['../../data-source-toolbar/data-source-paginator.component.scss'],
})
export class GroupPaginatorComponent implements OnChanges, OnDestroy {
  @Input() public groupPaginatorInformation: GroupPaginatorInformation;
  /**
   * Add in first/last buttons
   */
  @Input() public showFirstLastButtons: boolean = false;

  /**
   * List of options for the page size.
   */
  @Input() public pageSizeOptions: number[] = [20, 50, 100];

  /**
   * Emits new navigation state (e.g. users clicks next/previous page button or changes the page size ).
   */
  @Output() public navigationStateChanged = new EventEmitter<CollectionLoadParameters>();

  /**
   * @ignore Used internally in components template.
   * The internally used mat paginator.
   */
  @ViewChild(MatPaginator, { static: true }) public paginator: MatPaginator;

  @Input() public navigationState: CollectionLoadParameters = {};

  public get dataSourceHasData() {
    return this.groupPaginatorInformation?.currentData?.TotalCount > 0;
  }

  /**
   * @ignore
   * List of subscriptions.
   */
  private subscriptions: Subscription[] = [];

  /**
   * @ignore Used internally.
   * Configures the paginator and subscribes to events from the attached datasource toolbar.
   */
  public ngOnChanges(): void {
    this.navigationState = this.groupPaginatorInformation?.navigationState ?? { StartIndex: 0 };
    this.setPaginator();
  }

  /**
   * @ignore Used internally.
   * Unsubscribes all listeners.
   */
  public ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  /**
   * @ignore Receives the new navigation state (e.g. page size etc) of the paginator and emits it.
   */
  public onPaginatorStateChanged(newState: PageEvent): void {
    this.navigationState = {
      ...this.navigationState,
      ...{ PageSize: newState.pageSize, StartIndex: newState.pageIndex * newState.pageSize },
    };
    this.navigationStateChanged.emit(this.navigationState);
  }

  /**
   * @ignore Configures the internal mat paginator.
   */
  private setPaginator(): void {
    this.paginator.length = this.groupPaginatorInformation?.currentData?.TotalCount ?? 0;
    if (this.navigationState) {
      this.paginator.pageSize = this.navigationState.PageSize;
      this.paginator.pageIndex = this.navigationState.StartIndex / this.navigationState.PageSize;
    }
  }
}
