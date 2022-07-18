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

import { Component, OnInit, Inject } from "@angular/core";
import { EuiLoadingService, EuiSidesheetRef, EUI_SIDESHEET_DATA } from "@elemental-ui/core";
import { MetadataService, SnackBarService } from "qbm";
import { StepperSelectionEvent } from "@angular/cdk/stepper";
import { QerApiService } from "../../qer-api-client.service";
import { HistoryComparisonData, UiActionData } from "imx-api-qer";
import { SelectionModel } from "@angular/cdk/collections";

type ComparisonItem = (HistoryComparisonData & { TypeDisplay?: string });

@Component({
  templateUrl: "./rollback.component.html",
  styleUrls: ["./rollback.component.scss"]
})
export class RollbackComponent implements OnInit {

  constructor(private readonly sidesheetRef: EuiSidesheetRef,
    private readonly snackbar: SnackBarService,
    private readonly api: QerApiService,
    private readonly busySvc: EuiLoadingService,
    private readonly metadata: MetadataService,
    @Inject(EUI_SIDESHEET_DATA) private readonly data: {
      tableName: string,
      uid: string
    }
  ) { }

  public busy = false;
  public completed = false;
  public actions: UiActionData[] = [];
  public uidActions: string[] = [];
  public compareDate: Date;
  public maxDate: Date = new Date();
  public comparisonItems: ComparisonItem[] = [];

  public displayedColumns = ['select', 'Object', 'Then', 'Now'];
  public selection = new SelectionModel<ComparisonItem>(true, []);

  public ngOnInit(): void {
  }

  public async loadCompareItems(): Promise<void> {
    this.busy = true;

    this.comparisonItems = [];
    try {
      this.comparisonItems = (await this.api.client.portal_history_comparison_get(this.data.tableName, this.data.uid, { CompareDate: this.compareDate }))
        // only take the items that have changed
        .filter(item => item.HasChanged);

      await this.enhanceWithTypeDisplay(this.comparisonItems);
    }
    finally {
      this.busy = false;
    }
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.comparisonItems.length;
    return numSelected == numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.comparisonItems.forEach(row => this.selection.select(row));
  }

  private async enhanceWithTypeDisplay(obj: ComparisonItem[]) {
    await this.metadata.updateNonExisting(obj.map(i => i.TableName));
    obj.forEach(element => {
      element.TypeDisplay = this.metadata.tables[element.TableName].DisplaySingular;
    });
  }

  public async selectedStepChanged(event: StepperSelectionEvent): Promise<void> {
    if (this.completed)
      return;
    if (event.selectedIndex === 1 && event.previouslySelectedIndex === 0) {
      await this.LoadActions();
    }
  }

  private async LoadActions(): Promise<void> {

    // load actions
    this.actions = [];
    this.uidActions = [];
    this.busy = true;
    try {
      this.actions = await this.api.client.portal_history_rollback_get(this.data.tableName, this.data.uid, {
        CompareDate: this.compareDate,
        CompareId: this.selection.selected.map(s => s.Id).reduce((a, b) => a + "," + b)
      });
      this.uidActions = this.actions.filter(a => a.CanExecute).map(a => a.Id);
    } finally {
      this.busy = false;
    }
  }

  public async Execute(): Promise<void> {
    const b = this.busySvc.show();
    try {
      await this.api.client.portal_history_rollback_post(this.data.tableName, this.data.uid,
        {
          ActionId: this.uidActions
        },
        {
          CompareDate: this.compareDate,
          CompareId: this.selection.selected.map(s => s.Id).reduce((a, b) => a + "," + b)
        });
      this.completed = true;

      this.sidesheetRef.close(true);
      this.snackbar.open({ key: this.LdsChangesQueued });
    } finally {
      this.busySvc.hide(b);
    }
  }

  public LdsChangesQueued = '#LDS#Your changes have been saved. The changes may take a couple of minutes to take effect.';

  public LdsPickComparisonDate = '#LDS#Select a point in time to view the changes since that date.';

  public LdsNoChanges = '#LDS#No changes during selected time period.';

  public LdsActionList = '#LDS#The following actions will be taken to roll back the role to the previous state.';

  public LdsSelectItems = '#LDS#The following properties have changed. Select the properties that you want to roll back to the previous state.';
}
