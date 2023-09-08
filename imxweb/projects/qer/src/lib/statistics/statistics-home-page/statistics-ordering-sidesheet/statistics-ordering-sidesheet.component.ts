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

import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { EuiSidesheetRef, EuiTheme, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { isEqual } from 'lodash';
import { ConfirmationService, DataSourceToolbarSettings } from 'qbm';
import { Subscription } from 'rxjs';
import { GenericStatisticEntity, StatisticsDataService, StatisticsToolbarSettings } from '../statistics-data.service';
import { StatisticsOrderingSidesheetDialogComponent } from './statistics-ordering-sidesheet-dialog/statistics-ordering-sidesheet-dialog.component';


@Component({
  selector: 'imx-statistics-ordering-sidesheet',
  templateUrl: './statistics-ordering-sidesheet.component.html',
  styleUrls: ['./statistics-ordering-sidesheet.component.scss'],
})
export class StatisticsOrderingSidesheetComponent implements OnInit, OnDestroy {
  public dstSettings: DataSourceToolbarSettings;
  public orderStats: GenericStatisticEntity[];
  public searchStats: GenericStatisticEntity[] = [];
  public checkboxes: {
    [id: string]: boolean;
  } = {};
  public isSearch = false;
  public isSortDescending: boolean;

  private subscriptions$: Subscription[] = [];
  constructor(
    @Inject(EUI_SIDESHEET_DATA)
    public data: {
      orderStatIds: string[];
    },
    public dataService: StatisticsDataService,
    public sidesheetRef: EuiSidesheetRef,
    private dialogService: MatDialog,
    private confirmService: ConfirmationService
  ) {}

  public get dataHasntChanged(): boolean {
    const currentData = this.orderStats.map((stat) => this.dataService.getId(stat));
    return isEqual(this.data.orderStatIds, currentData);
  }

  public get chosenStats(): boolean {
    return this.orderStats && this.orderStats.length > 0;
  }

  public get hasData(): boolean {
    return this.dstSettings.dataSource.Data.length > 0;
  }

  public get searchHasData(): boolean {
    return this.searchStats.length > 0;
  }

  public get isMobile(): boolean {
    return document.body.offsetWidth <= 768;
  }

  public get theme(): string {
    const bodyClasses = document.body.classList;
    return bodyClasses.contains(EuiTheme.LIGHT) ? EuiTheme.LIGHT : (bodyClasses.contains(EuiTheme.DARK) ? EuiTheme.DARK : (bodyClasses.contains(EuiTheme.CONTRAST) ? EuiTheme.CONTRAST : ''));
  }

  public ngOnInit(): void {
    this.subscriptions$.push(
      this.sidesheetRef.closeClicked().subscribe(async () => {
        if (this.dataHasntChanged || (await this.confirmService.confirmLeaveWithUnsavedChanges())) {
          this.sidesheetRef.close();
        }
      })
    );
    this.dstSettings = {
      dataSource: this.dataService.dataSourceCopy,
      entitySchema: this.dataService.getGenericSchema(),
      navigationState: {
        PageSize: 500,
        StartIndex: 0,
      },
    };
    this.initalizeData();
  }

  public ngOnDestroy(): void {
    this.subscriptions$.forEach((sub) => sub.unsubscribe());
  }

  public initalizeData(): void {
    // Determine which sort the data is in, since we clone the data ahead of time
    this.isSortDescending =
      this.dstSettings.dataSource.totalCount > 1 ? this.dstSettings.dataSource.Data[0].GetEntity().GetDisplay() < this.dstSettings.dataSource.Data[1].GetEntity().GetDisplay() : true;

    // Here we create a new list of favorites and set the associated checkboxes based on if its already a favorite or not
    this.orderStats = Array<GenericStatisticEntity>(this.data.orderStatIds.length);
    this.dstSettings.dataSource.Data.forEach((entity: GenericStatisticEntity) => {
      const id = this.dataService.getId(entity);
      const index = this.data.orderStatIds.findIndex((favId) => favId === id);
      if (index !== -1) {
        // This stat is already a favorite, add it in it's order
        this.orderStats[index] = entity;
        this.checkboxes[id] = true;
      } else {
        this.checkboxes[id] = false;
      }
    });
  }

  public async showInfo(): Promise<void> {
    await this.dialogService
      .open(StatisticsOrderingSidesheetDialogComponent, {
        width: '420px',
      })
      .afterClosed()
      .toPromise();
  }

  public closeWithData(): void {
    this.sidesheetRef.close(this.orderStats);
  }

  public onSettingsChanged(settings: StatisticsToolbarSettings): void {
    this.isSearch = settings.navigationState.search?.length > 0;
    this.searchStats = this.isSearch ? (settings.dataSource.Data) : [];
  }

  public toggleStat(stat: GenericStatisticEntity, event: MatCheckboxChange): void {
    const id = this.dataService.getId(stat);
    this.checkboxes[id] = event.checked;
    if (event.checked) {
      this.orderStats.push(stat);
    } else {
      this.orderStats = this.orderStats.filter((favStat) => this.dataService.getId(favStat) !== id);
    }
  }

  public unselectAll(): void {
    this.orderStats.forEach((stat) => {
      const id = this.dataService.getId(stat);
      this.checkboxes[id] = false;
    });
    this.orderStats = [];
  }

  public toggleSort(): void {
    this.isSortDescending = !this.isSortDescending;
    this.dstSettings.dataSource.Data.reverse();
    this.searchStats.reverse();
  }

  public drop(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.orderStats, event.previousIndex, event.currentIndex);
  }
}
