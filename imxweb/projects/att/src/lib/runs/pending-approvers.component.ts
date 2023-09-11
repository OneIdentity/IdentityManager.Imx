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

import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ApiService } from '../api.service';

import { PortalAttestationRunApprovers } from 'imx-api-att';
import { TypedEntityCollectionData } from 'imx-qbm-dbts';

import { DataSourceToolbarSettings } from 'qbm';

@Component({
  selector: 'imx-attestation-run-approvers',
  templateUrl: './pending-approvers.component.html',
  styleUrls: ['./pending-approvers.component.scss']
})
export class PendingApproversComponent implements OnChanges {
  public dstSettings: DataSourceToolbarSettings;

  public selected: PortalAttestationRunApprovers[] = [];

  public showHelper = true;

  @Input() public dataSource: TypedEntityCollectionData<PortalAttestationRunApprovers>;

  @Output() public readonly sendReminder = new EventEmitter<PortalAttestationRunApprovers[]>();

  constructor(private readonly attApiService: ApiService) {
  }

  public async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes.dataSource && this.dataSource) {
      const entitySchema = this.attApiService.typedClient.PortalAttestationRunApprovers.GetSchema();

      this.dstSettings = {
        displayedColumns: [
          entitySchema.Columns.UID_PersonHead,
          entitySchema.Columns.PendingCases,
          entitySchema.Columns.ClosedCases
        ],
        dataSource: this.dataSource,
        entitySchema,
        navigationState: {}
      };
    }
  }

  public onSelectionChanged(items: PortalAttestationRunApprovers[]): void {
    this.selected = items;
  }

  public onHelperDismissed(): void {
    this.showHelper = false;
  }
}
