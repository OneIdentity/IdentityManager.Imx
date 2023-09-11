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

import { Component, Input, Output, EventEmitter, SimpleChanges, OnChanges, ViewChild, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { Subscription } from 'rxjs';

import { CollectionLoadParameters } from 'imx-qbm-dbts';
import { DataSourceToolbarComponent } from './data-source-toolbar.component';
import { DataSourceToolbarSettings } from './data-source-toolbar-settings';


/**
 * Paginator for navigating the datasource of the {@link DataSourceToolbarComponent| datasource toolbar component}.
 *
 * @example
 * A paginator with a corresponding dst.
 *
 * <imx-data-source-toolbar #dst
 *                [settings]="mySettings"
 *                (navigationStateChanged)="myNavigationStateChanged($event)"></imx-data-source-toolbar>
 * <imx-data-source-paginator [dst]="myDst"></imx-data-source-paginator>
 */
@Component({
  selector: 'imx-data-source-paginator',
  templateUrl: './data-source-paginator.component.html',
  styleUrls: ['./data-source-paginator.component.scss']
})
export class DataSourcePaginatorComponent implements OnChanges, OnDestroy {
  /**
   * The datasource toolbar component.
   */
  @Input() public dst: DataSourceToolbarComponent;

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

  /**
   *  @ignore Used internally in components template.
   *  Hides the paginator, if there is not data, a group is applied or the control is loading new content
   */
  public get hidePaginator() {
    return !this.dst?.dataSourceHasData  || this.dst.settings?.groupData?.currentGrouping != null || this.isLoading;
  }
  public isLoading = true;

  constructor (private readonly changeDetector: ChangeDetectorRef){}

  /**
   * @ignore
   * List of subscriptions.
   */
  private subscriptions: Subscription[] = [];

  /**
   * @ignore Used internally.
   * Configures the paginator and subscribes to events from the attached datasource toolbar.
   */
  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['dst'] && changes['dst'].currentValue) {
      this.setPaginator();

      this.subscriptions.push(this.dst.settingsChanged.subscribe((value: DataSourceToolbarSettings) => {
        this.dst.settings = value;
        this.setPaginator();
      }));

      if(this.dst.busyService){
        this.dst.busyService.busyStateChanged.subscribe((value:boolean) =>{
          this.isLoading = value;
          this.changeDetector.detectChanges();
        })
      } else {
        this.isLoading = false;
      }
    }
  }

  /**
   * @ignore Used internally.
   * Unsubscribes all listeners.
   */
  public ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  /**
   * @ignore Receives the new navigation state (e.g. page size etc) of the paginator and emits it.
   */
  public onPaginatorStateChanged(newState: PageEvent): void {
    if (this.dst && this.dst.settings && this.dst.settings.navigationState) {
      this.dst.settings.navigationState.PageSize = newState.pageSize;
      this.dst.settings.navigationState.StartIndex = newState.pageIndex * newState.pageSize;
      this.dst.navigationChanged(this.dst.settings.navigationState);
    }
  }

  /**
   * @ignore Configures the internal mat paginator.
   */
  private setPaginator(): void {
    if (this.dst && this.dst.settings) {
      if (this.dst.settings.dataSource) {
        this.paginator.length = this.dst.settings.dataSource.totalCount;
      }

      if (this.dst.settings.navigationState) {
        this.paginator.pageSize = this.dst.settings.navigationState.PageSize;
        this.paginator.pageIndex = this.dst.settings.navigationState.StartIndex / this.dst.settings.navigationState.PageSize;
      }
    }
  }
}
