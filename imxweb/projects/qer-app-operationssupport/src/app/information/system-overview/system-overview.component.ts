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

import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, OnInit } from '@angular/core';
import { OverlayRef } from '@angular/cdk/overlay';
import { EuiLoadingService } from '@elemental-ui/core';

import { UserActionService } from 'qbm';
import { OpsupportSystemoverview } from 'imx-api-qbm';
import { SystemOverviewService } from './system-overview.service';
import { SystemTreeNode } from './system-tree/system-tree-node';
import { SystemTreeDatabase } from './system-tree/system-tree-database';
import { SystemTreeDataSource } from './system-tree/system-tree-datasource';

const recommendValClass = 'imx-recommendedValue-exceeded';
const tresholdExceededClass = 'imx-treshold-exceeded';

@Component({
  selector: 'imx-system-overview',
  templateUrl: './system-overview.component.html'
})
export class SystemOverviewComponent implements OnInit {
  public treeControl: FlatTreeControl<SystemTreeNode>;
  public dataSource: SystemTreeDataSource;

  public systemEmail: string;
  public systemName: string;
  private exportData: string;

  constructor(
    private systemOverviewService: SystemOverviewService,
    private userActionService: UserActionService,
    private busyService: EuiLoadingService,
    private database: SystemTreeDatabase) {
    this.treeControl = new FlatTreeControl<SystemTreeNode>(this.getLevel, this.isExpandable);
    this.dataSource = new SystemTreeDataSource(this.treeControl, database);

  }
  public async ngOnInit(): Promise<void> {
    let overlayRef: OverlayRef;
    setTimeout(() => overlayRef = this.busyService.show());
    try {
      const entity = await this.systemOverviewService.ItemsProvider();
      this.dataSource.data = this.database.initialize(entity);
      this.systemName = this.database.CustomerName;
      this.systemEmail = this.database.CustomerEmail;
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
  }

  public getLevel = (node: SystemTreeNode): number => node.level;

  public isExpandable = (node: SystemTreeNode): boolean => node.expandable;

  public hasChild = (index: number, nodeData: SystemTreeNode): boolean => nodeData.expandable;
  get exceededTresholdsCounter(): number {
    return this.database.ExceededTresholdsCounter;
  }

  public qualityOfValueClass(node: OpsupportSystemoverview): string {
    const qualityValue = node.QualityOfValue.value;
    return qualityValue <= 0.2 ? tresholdExceededClass : qualityValue <= 0.5 ? recommendValClass : '';
  }

  public disableTooltip(node: OpsupportSystemoverview): boolean {
    return node.RecommendedValue.value.length === 0;
  }

  public getExportedData(): string {
    if (!this.exportData) {
      this.exportData = this.database.export();
    }
    return this.exportData;
  }

  public copy2Clipboard(): void {
    const data = this.getExportedData();
    this.userActionService.copy2Clipboard(data);
  }

  public export2CSV(): void {
    const csvData = this.getExportedData();
    this.userActionService.downloadData(csvData, 'Export_SystemInformation.csv', 'text/csv');
  }
}
