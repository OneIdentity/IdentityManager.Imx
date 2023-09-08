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
import { Component, Inject, OnInit } from '@angular/core';
import { EuiLoadingService, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { BaseCdr, ColumnDependentReference} from 'qbm';
import { PortalCallsHistory } from 'imx-api-hds';

@Component({
  selector: 'imx-calls-history-sidesheet',
  templateUrl: './calls-history-sidesheet.component.html',
  styleUrls: ['./calls-history-sidesheet.component.scss']
})
export class CallsHistorySidesheetComponent implements OnInit {

  public readonly detailsFormGroup: UntypedFormGroup;
  public cdrList: ColumnDependentReference[] = [];

  constructor( 
    @Inject(EUI_SIDESHEET_DATA) public portalCallsHistory: PortalCallsHistory,
    private readonly euiLoadingService: EuiLoadingService,
    public formBuilder: UntypedFormBuilder,
  ) {
    this.detailsFormGroup = new UntypedFormGroup({ formArray: formBuilder.array([]) });
   }

   public async ngOnInit(): Promise<void> {
    await this.setup();
  }

  public async setup(): Promise<void> {
    let entity = this.portalCallsHistory.GetEntity();
    let columnNames = await this.getColumnNames();
    columnNames.forEach(columnName => {
      let column = entity.GetColumn(columnName);
      if (column)
        this.cdrList.push(new BaseCdr(column));
    });
  }

  public async getColumnNames(): Promise<string[]> {
    let columnNames: string[] = [];
    columnNames.push('UID_TroubleTicket');
    columnNames.push('TroubleHistoryDate');
    columnNames.push('ActionHotline');
    columnNames.push('ObjectKeyPerson');
    columnNames.push('UID_TroubleCallState');
    columnNames.push('ObjectKeySupporter');
    return columnNames;
  }
}
