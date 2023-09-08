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

import { Overlay } from '@angular/cdk/overlay';
import { HttpClient } from '@angular/common/http';
import { Component, Injector, OnInit } from '@angular/core';
import { EuiDownloadDirective, EuiLoadingService } from '@elemental-ui/core';

import { IEntity } from 'imx-qbm-dbts';
import { FilterTreeEntityWrapperService, FilterTreeDatabase, ElementalUiConfigService } from 'qbm';
import { AccountsReportsService } from '../accounts-reports.service';
import { AccountsService } from '../accounts.service';

@Component({
  selector: 'imx-target-system-report',
  templateUrl: './target-system-report.component.html',
  styleUrls: ['./target-system-report.component.scss']
})
export class TargetSystemReportComponent implements OnInit {

  public showHelperAlert = true;
  public database: FilterTreeDatabase;
  public selectedEntity: IEntity;

  constructor(
    private busyService: EuiLoadingService,
    private readonly entityWrapper: FilterTreeEntityWrapperService,
    private readonly accountsService: AccountsService,
    private readonly accountReport: AccountsReportsService,
    private readonly elementalUiConfigService: ElementalUiConfigService,
    private readonly http: HttpClient,
    private readonly injector: Injector,
    private readonly overlay: Overlay,
  ) { }

  public async ngOnInit(): Promise<void> {
    this.database = new FilterTreeDatabase(this.entityWrapper,
      async (parentkey) => {
        return this.accountsService.getFilterTree({
          parentkey,
          container: undefined,
          system: undefined,
          filter: undefined
        });
      }
      , this.busyService);
  }

  public onHelperDismissed(): void {
    this.showHelperAlert = false;
  }

  public onNodeSelected(entity: IEntity): void {
      this.selectedEntity = entity;
  }

  public loadReport(): void {
    let url: string;
    const val = this.selectedEntity?.GetColumn('Filter')?.GetValue();
    if (!val) {
      return;
    }

    const columnName = val.ColumnName;
    if (columnName === 'UID_UNSRoot') {
      url = this.accountReport.accountsByRootReport(30, val.Value1);
    }
    else if (columnName === 'UID_UNSContainer') {
      url = this.accountReport.accountsByContainerReport(30, val.Value1);
    }
    const directive = new EuiDownloadDirective(null, this.http, this.overlay, this.injector);

    if (directive && url !== '') {
      directive.downloadOptions = {
        ... this.elementalUiConfigService.Config.downloadOptions,
        url,
        fileName: `${this.selectedEntity.GetDisplay()}.pdf`,
        disableElement: false
      };
      directive.onClick();
    }
  }
}
