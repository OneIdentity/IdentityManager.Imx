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

import { Component, ErrorHandler, OnInit } from '@angular/core';
import { EuiLoadingService, EuiSidesheetConfig, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { PortalCalls } from 'imx-api-hds';
import { HdsApiService } from '../hds-api-client.service';
import { CallsSidesheetComponent, CallsSidesheetData } from './calls-sidesheet/calls-sidesheet.component';
import {
  DataSourceToolbarSettings,
  SettingsService,
  DataSourceToolbarFilter,
  LdsReplacePipe,
  HelpContextualComponent,
  HelpContextualService,
  HELP_CONTEXTUAL, BusyService } from 'qbm';
import { CollectionLoadParameters, EntitySchema, FilterData, IClientProperty, ValType, DataModel } from 'imx-qbm-dbts';

@Component({
  selector: 'imx-calls',
  templateUrl: './calls.component.html',
  styleUrls: ['./calls.component.scss'],
})
export class CallsComponent implements OnInit {
  public entitySchema: EntitySchema;
  public dstSettings: DataSourceToolbarSettings;
  public displayedColumns: IClientProperty[] = [];
  public collectionLoadParameters: CollectionLoadParameters;
  public filterOptions: DataSourceToolbarFilter[] = [];
  public dataModel: DataModel;

  public busyService = new BusyService();

  constructor(
    private readonly errorHandler: ErrorHandler,
    private readonly sidesheet: EuiSidesheetService,
    private readonly translate: TranslateService,
    private readonly hdsApiService: HdsApiService,
    private readonly euiLoadingService: EuiLoadingService,
    private readonly settingsService: SettingsService,
    private replacePipe: LdsReplacePipe,
    private readonly helpContextualService: HelpContextualService
  ) {
    this.collectionLoadParameters = { PageSize: this.settingsService.DefaultPageSize, StartIndex: 0, OrderBy: 'XDateInserted desc' };
    this.entitySchema = this.hdsApiService.typedClient.PortalCalls.GetSchema();
  }

  public async ngOnInit() {
    const isBusy = this.busyService.beginBusy();
    try {
      this.displayedColumns = [
        this.entitySchema.Columns.CallNumber,
        {
          ColumnName: 'description',
          Type: ValType.String,
        },
        this.entitySchema.Columns.IsClosed,
        this.entitySchema.Columns.IsHistory,
        this.entitySchema.Columns.IsHold,
        this.entitySchema.Columns.UID_PersonHotline,
        this.entitySchema.Columns.UID_PersonInTrouble,
        this.entitySchema.Columns.UID_PersonInTroubleAdditional,
        this.entitySchema.Columns.UID_TroubleCallState,
        this.entitySchema.Columns.UID_TroubleEscalationLevel_E,
        this.entitySchema.Columns.UID_TroubleProduct,
        this.entitySchema.Columns.UID_TroubleSeverity,
        this.entitySchema.Columns.UID_TroubleTypeHotline,
        {
          ColumnName: 'actionHotLine',
          Type: ValType.String,
        },
      ];
      await this.setFilter();
      await this.loadTickets();
    } finally {
      isBusy.endBusy();
    }
  }

  public async createTicket() {
    let ticket = await this.getNewTicket();
    if (ticket) await this.viewTicket(ticket, true);
  }

  public async viewTicket(ticket: PortalCalls, isNew: boolean) {
    if (ticket) {
      let title = isNew
        ? await this.translate.get('#LDS#Heading Create Ticket').toPromise()
        : await this.translate.get('#LDS#Heading Edit Ticket').toPromise();
      let sidesheetData: CallsSidesheetData = {
        isNew: isNew,
        ticket: ticket,
      };
      let euiSidesheetConfig: EuiSidesheetConfig = {
        testId: 'calls-sidesheet',
        title: title,
        padding: '0px',
        width: 'max(600px, 60%)',
        data: sidesheetData,
        disableClose: true,
        headerComponent: isNew ? HelpContextualComponent : undefined
      };

      if (!isNew){

        euiSidesheetConfig.subTitle = this.replacePipe.transform(
          await this.translate.get('#LDS#Heading Ticket Number: {0}').toPromise(),
          ticket.CallNumber.value.toString()
          );
          this.helpContextualService.setHelpContextId(HELP_CONTEXTUAL.HelpDeskSupportTicketsCreate);
      }
      let sidesheetRef = this.sidesheet.open(CallsSidesheetComponent, euiSidesheetConfig);
      sidesheetRef.afterClosed().subscribe(() => this.loadTickets());
    }
  }

  public async getNewTicket(): Promise<PortalCalls | undefined> {
    let overlayRef = this.euiLoadingService.show();
    try {
      let tickets = (await this.hdsApiService.typedClient.PortalCallsInteractive.Get()).Data;
      return tickets[0];
    } catch (error) {
      this.errorHandler.handleError(error);
    } finally {
      this.euiLoadingService.hide(overlayRef);
    }
  }

  private async loadTickets(): Promise<void> {
    const isBusy = this.busyService.beginBusy();
    try {
      let tickets = await this.hdsApiService.typedClient.PortalCalls.Get(this.collectionLoadParameters);
      this.dstSettings = {
        displayedColumns: this.displayedColumns,
        dataSource: tickets,
        entitySchema: this.entitySchema,
        navigationState: this.collectionLoadParameters,
        filters: this.filterOptions,
      };
    } catch (error) {
      this.errorHandler.handleError(error);
    } finally {
      isBusy.endBusy();
    }
  }

  public async onNavigationStateChanged(collectionLoadParameters?: CollectionLoadParameters): Promise<void> {
    if (collectionLoadParameters) {
      this.collectionLoadParameters = collectionLoadParameters;
    }
    await this.loadTickets();
  }

  public async onSearch(keywords: string): Promise<void> {
    this.collectionLoadParameters.StartIndex = 0;
    this.collectionLoadParameters.search = keywords;
    await this.loadTickets();
  }

  public async onSelected(ticket: PortalCalls): Promise<void> {
    let overlayRef = this.euiLoadingService.show();
    try {
      if (ticket.EntityKeysData?.Keys?.length > 0) {
        let interactiveTickets = (await this.hdsApiService.typedClient.PortalCallsInteractive.Get_byid(ticket.EntityKeysData.Keys[0])).Data;
        if (interactiveTickets?.length > 0) this.viewTicket(interactiveTickets[0], false);
      }
    } catch (error) {
      this.errorHandler.handleError(error);
    } finally {
      this.euiLoadingService.hide(overlayRef);
    }
  }

  public getTicketItemValue(ticket: PortalCalls, column: string): string {
    return ticket.GetEntity().GetColumn(column).GetValue();
  }

  private async setFilter(): Promise<void> {
    this.dataModel = await this.getDataModel();
    this.filterOptions = this.dataModel.Filters;
    this.filterOptions.map((filter) => {
      if (filter.Name === 'callstate') {
        filter.InitialValue = 'HDS-2B3E666A806E7CDC288CAE36AE8623DC';
      }
    });
  }

  private async getDataModel(groupFilter?: FilterData[]): Promise<DataModel> {
    return this.hdsApiService.client.portal_calls_datamodel_get({
      filter: groupFilter,
    });
  }
}
