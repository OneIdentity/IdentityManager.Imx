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

import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ApiService } from '../api.service';

import { PortalAttestationRunApprovers } from '@imx-modules/imx-api-att';
import { EntitySchema, TypedEntityCollectionData } from '@imx-modules/imx-qbm-dbts';

import { DataViewInitParameters, DataViewSource } from 'qbm';

@Component({
  selector: 'imx-attestation-run-approvers',
  templateUrl: './pending-approvers.component.html',
  styleUrls: ['./pending-approvers.component.scss'],
  providers: [DataViewSource],
})
export class PendingApproversComponent implements OnChanges {
  public selected: PortalAttestationRunApprovers[] = [];
  public entitySchema: EntitySchema;
  public showHelper = true;

  @Input() public dataSource: TypedEntityCollectionData<PortalAttestationRunApprovers>;

  @Output() public readonly sendReminder = new EventEmitter<PortalAttestationRunApprovers[]>();

  constructor(
    private readonly attApiService: ApiService,
    public dataViewSource: DataViewSource<PortalAttestationRunApprovers>,
  ) {
    this.entitySchema = this.attApiService.typedClient.PortalAttestationRunApprovers.GetSchema();
  }

  public async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes.dataSource && this.dataSource) {
      console.log(this.dataSource);
      const dataViewInitParameters: DataViewInitParameters<PortalAttestationRunApprovers> = {
        execute: () => Promise.resolve(this.dataSource),
        schema: this.entitySchema,
        columnsToDisplay: [
          this.entitySchema.Columns.UID_PersonHead,
          this.entitySchema.Columns.PendingCases,
          this.entitySchema.Columns.ClosedCases,
        ],
        localSource: true,
        selectionChange: (selection: PortalAttestationRunApprovers[]) => this.onSelectionChanged(selection),
      };
      this.dataViewSource.init(dataViewInitParameters);
    }
  }

  public onSelectionChanged(items: PortalAttestationRunApprovers[]): void {
    this.selected = items;
  }

  public onHelperDismissed(): void {
    this.showHelper = false;
  }

  public LdsKeyAttestorOverview =
    '#LDS#Here you can get an overview of attestors who still have to approve attestation cases in the selected attestation run. Additionally, you can select attestors and send them reminders.';
}
