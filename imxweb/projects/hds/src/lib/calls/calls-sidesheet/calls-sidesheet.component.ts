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

import { Component, ErrorHandler, Inject, OnInit } from '@angular/core';
import { EuiLoadingService, EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { PortalCalls } from 'imx-api-hds';
import { BaseCdr, ColumnDependentReference, SnackBarService, ConfirmationService, TextContainer, HELP_CONTEXTUAL } from 'qbm';
import { ProjectConfigurationService } from 'qer';
import { HdsApiService } from '../../hds-api-client.service';

export interface CallsSidesheetData {
  isNew: boolean;
  ticket: PortalCalls
}

@Component({
  selector: 'imx-calls-sidesheet',
  templateUrl: './calls-sidesheet.component.html',
  styleUrls: ['./calls-sidesheet.component.scss']
})
export class CallsSidesheetComponent implements OnInit {

  public readonly detailsFormGroup: UntypedFormGroup;
  public cdrList: ColumnDependentReference[] = [];
  public ticket: PortalCalls;
  public contextId = HELP_CONTEXTUAL.HelpDeskSupportTicketsEdit;

  constructor(
    @Inject(EUI_SIDESHEET_DATA) public sidesheetData: CallsSidesheetData,
    private readonly errorHandler: ErrorHandler,
    private readonly sidesheetRef: EuiSidesheetRef,
    private readonly snackBarService: SnackBarService,
    private readonly euiLoadingService: EuiLoadingService,
    private projectConfigurationService: ProjectConfigurationService,
    public formBuilder: UntypedFormBuilder,
    private readonly confirmationService: ConfirmationService,
    private readonly hdsApiService: HdsApiService,
  ) {
    this.detailsFormGroup = new UntypedFormGroup({ formArray: formBuilder.array([]) });

    this.sidesheetRef.closeClicked().subscribe(async () => {
	    if (!this.detailsFormGroup.dirty || await this.confirmationService.confirmLeaveWithUnsavedChanges()) {
        this.sidesheetRef.close();
      }
    });
  }

  public async ngOnInit(): Promise<void> {
    await this.setup();
  }

  public async setup(): Promise<void> {
    this.ticket = this.sidesheetData.ticket;
    let entity = this.sidesheetData.ticket.GetEntity();
    let columnNames = await this.getColumnNames();
    columnNames.forEach(columnName => {
      let column = entity.GetColumn(columnName);

      if (column)
        this.cdrList.push(new BaseCdr(column));
    });
  }

  public async getColumnNames(): Promise<string[]> {
    let columnNames: string[] = [];
    let overlayRef = this.euiLoadingService.show();
    try {
      let config = await this.projectConfigurationService.getConfig();

      if (this.sidesheetData.isNew)
        columnNames = config.OwnershipConfig.PrimaryFields['TroubleTicket'];
      else
        columnNames = config.OwnershipConfig.EditableFields['TroubleTicket'];
    }
    catch (error) {
      this.errorHandler.handleError(error);
    }
    finally {
      this.euiLoadingService.hide(overlayRef);
    }
    return columnNames;
  }

  public async save(): Promise<void> {
    if (this.detailsFormGroup.valid) {
      let overlayRef = this.euiLoadingService.show();
      try {
        await this.sidesheetData.ticket.GetEntity().Commit(true).then(() => {
          this.detailsFormGroup.markAsPristine();
          this.sidesheetRef.close();
          let textContainer: TextContainer;

          if (this.sidesheetData.isNew)
            textContainer = { key: '#LDS#The ticket with the number {0} has been successfully created.', parameters: [this.sidesheetData.ticket.CallNumber.value.toString()] };
          else
            textContainer = { key: '#LDS#The ticket has been successfully saved.', parameters: [this.sidesheetData.ticket.CallNumber.value.toString()] };

          this.snackBarService.open(textContainer, '#LDS#Close', { duration: 6000 });
        });
      }
      catch (error) {
        this.errorHandler.handleError(error);
      }
      finally {
        this.euiLoadingService.hide(overlayRef);
      }
    }
  }

  public cancel(): void {
    this.sidesheetRef.close();
  }

  private get getTicketId():string{
    return !!this.sidesheetData.ticket.EntityKeysData.Keys ? this.sidesheetData.ticket.EntityKeysData.Keys[0] : '';
  }
}
