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

import { Component, OnInit } from '@angular/core';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';

import { ListReportDefinitionRead, PortalReports, PortalReportsEdit } from '@imx-modules/imx-api-rps';
import {
  CollectionLoadParameters,
  DisplayColumns,
  ExtendedTypedEntityCollection,
  IClientProperty,
  StaticSchema,
  TypedEntityCollectionData,
} from '@imx-modules/imx-qbm-dbts';

import {
  BusyService,
  calculateSidesheetWidth,
  ConfirmationService,
  DataViewInitParameters,
  DataViewSource,
  HELP_CONTEXTUAL,
  HelpContextualComponent,
  HelpContextualService,
  SnackBarService,
} from 'qbm';
import { RpsPermissionsService } from '../admin/rps-permissions.service';
import { EditReportSidesheetComponent } from './edit-report-sidesheet/edit-report-sidesheet.component';
import { EditReportService } from './edit-report.service';

@Component({
  templateUrl: './edit-report.component.html',
  styleUrls: ['./edit-report.component.scss'],
  providers: [DataViewSource],
})
export class EditReportComponent implements OnInit {
  public readonly DisplayColumns = DisplayColumns;
  public selectedReports: PortalReports[] = [];
  public displayedColumns: IClientProperty[];
  public busyService = new BusyService();
  public entitySchema: StaticSchema<string>;
  private isRpsAdmin: boolean;

  constructor(
    private readonly reportService: EditReportService,
    private readonly busy: EuiLoadingService,
    private readonly sidesheet: EuiSidesheetService,
    private readonly translate: TranslateService,
    private readonly confirmationService: ConfirmationService,
    private readonly rpsPermissionService: RpsPermissionsService,
    private readonly snackBarService: SnackBarService,
    private readonly helpContextualService: HelpContextualService,
    public dataSource: DataViewSource<PortalReports>,
  ) {
    this.entitySchema = this.reportService.reportSchema;
  }

  public async ngOnInit(): Promise<void> {
    this.isRpsAdmin = await this.rpsPermissionService.isRpsAdmin();
    this.displayedColumns = [this.entitySchema.Columns[DisplayColumns.DISPLAY_PROPERTYNAME]];
    this.getData();
  }

  public getData(): void {
    const dataViewInitParameters: DataViewInitParameters<PortalReports> = {
      execute: (params: CollectionLoadParameters, signal: AbortSignal): Promise<TypedEntityCollectionData<PortalReports>> =>
        this.isRpsAdmin ? this.reportService.getAllReports(params, signal) : this.reportService.getReportsOwnedByUser(params, signal),
      schema: this.entitySchema,
      columnsToDisplay: this.displayedColumns,
      highlightEntity: (entity: PortalReports) => {
        this.viewDetails(entity);
      },
      selectionChange: (selection: PortalReports[]) => this.onSelectionChanged(selection),
    };
    this.dataSource.init(dataViewInitParameters);
  }

  public onSelectionChanged(items: PortalReports[]): void {
    this.selectedReports = items;
  }

  public async createNew(): Promise<void> {
    const overlay = this.busy.show();
    let report;
    try {
      report = await this.reportService.createNew();
    } finally {
      this.busy.hide(overlay);
    }

    if (report) {
      await this.openSidesheet(report, true, false);
    }
  }

  public async viewDetails(selectedReport: PortalReports): Promise<void> {
    const overlay = this.busy.show();
    const entity = selectedReport.GetEntity();
    const report = await this.reportService.getReport(entity.GetKeys()[0]);
    this.busy.hide(overlay);

    if (report) {
      await this.openSidesheet(report, false, entity.GetColumn('IsOob').GetValue());
    }
  }

  private async openSidesheet(
    report: ExtendedTypedEntityCollection<PortalReportsEdit, ListReportDefinitionRead>,
    isNew: boolean,
    isReadonly: boolean,
  ): Promise<void> {
    this.helpContextualService.setHelpContextId(isNew ? HELP_CONTEXTUAL.ReportsCreate : HELP_CONTEXTUAL.ReportsEdit);
    const result = await this.sidesheet
      .open(EditReportSidesheetComponent, {
        title: await this.translate.get(isNew ? '#LDS#Heading Create Report' : '#LDS#Heading Edit Report').toPromise(),
        subTitle: isNew ? '' : report.Data[0].GetEntity().GetDisplay(),
        panelClass: 'imx-sidesheet',
        disableClose: true,
        padding: '0',
        width: calculateSidesheetWidth(1100, 0.7),
        testId: isNew ? 'report-create-sidesheet' : 'report-details-sidesheet',
        data: {
          report,
          isNew,
          isReadonly,
        },
        headerComponent: HelpContextualComponent,
      })
      .afterClosed()
      .toPromise();

    if (result) {
      this.dataSource.updateState();
    }
  }

  public canDeleteSelected(): boolean {
    return this.selectedReports.length > 0 && this.selectedReports.filter((i) => i.GetEntity().GetColumn('IsOob').GetValue()).length == 0;
  }

  public async deleteSelected(): Promise<void> {
    if (
      await this.confirmationService.confirm({
        Title: '#LDS#Heading Delete Reports',
        Message: '#LDS#Are you sure you want to delete the selected reports?',
        identifier: 'report-confirm-delete',
      })
    ) {
      const overlay = this.busy.show();
      try {
        for (var report of this.selectedReports) {
          await this.reportService.deleteReport(report);
        }

        this.snackBarService.open({ key: '#LDS#The reports have been successfully deleted.' }, '#LDS#Close');
        this.dataSource.selection.clear();
        this.dataSource.updateState();
        await this.getData();
      } finally {
        this.busy.hide(overlay);
      }
    }
  }
}
