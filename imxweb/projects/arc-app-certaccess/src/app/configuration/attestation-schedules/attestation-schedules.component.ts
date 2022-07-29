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

import { Component, OnInit } from '@angular/core';
import { EuiSidesheetService } from '@elemental-ui/core';
import { PortalAttestationSchedules } from 'imx-api-arc';
import { CollectionLoadParameters, DisplayColumns, EntitySchema, IClientProperty } from 'imx-qbm-dbts';
import { ClassloggerService, DataSourceToolbarFilter, DataSourceToolbarSettings, HELPER_ALERT_KEY_PREFIX, SettingsService, StorageService } from 'qbm';
import { RequestsService } from '../requests.service';
import { AttestationScheduleSidesheetComponent } from './attestation-schedule-sidesheet/attestation-schedule-sidesheet.component';

const helperAlertKey = `${HELPER_ALERT_KEY_PREFIX}_attestationSchedules`;

@Component({
  selector: 'imx-attestation-schedules',
  templateUrl: './attestation-schedules.component.html',
  styleUrls: ['./attestation-schedules.component.scss'],
})
export class AttestationSchedulesComponent implements OnInit {

  public get showHelperAlert(): boolean {
    return !this.storageService.isHelperAlertDismissed(helperAlertKey);
  }

  public readonly entitySchemaAttestationSchedule: EntitySchema;
  public readonly DisplayColumns = DisplayColumns;
  public dstSettings: DataSourceToolbarSettings;
  public navigationState: CollectionLoadParameters;
  public filterOptions: DataSourceToolbarFilter[] = [];

  private readonly defaultPageSize: number;
  private displayedColumns: IClientProperty[] = [];

  constructor(
    private readonly sidesheet: EuiSidesheetService,
    private readonly logger: ClassloggerService,
    private readonly storageService: StorageService,
    settingsService: SettingsService,
    private readonly requestsService: RequestsService
  ) {
    this.defaultPageSize = settingsService.DefaultPageSize;
    this.navigationState = { PageSize: this.defaultPageSize, StartIndex: 0 };
    this.entitySchemaAttestationSchedule = requestsService.attestationSchedulesSchema;
  }

  public async ngOnInit(): Promise<void> {
    this.displayedColumns = [
      this.entitySchemaAttestationSchedule.Columns[DisplayColumns.DISPLAY_PROPERTYNAME],
      this.entitySchemaAttestationSchedule.Columns.LastRun,
      this.entitySchemaAttestationSchedule.Columns.NextRun,
      this.entitySchemaAttestationSchedule.Columns.FrequencyType,
    ];
    await this.navigate();
  }

  public onHelperDismissed(): void {
    this.storageService.storeHelperAlertDismissal(helperAlertKey);
  }

  public async onSearch(keywords: string): Promise<void> {
    this.logger.debug(this, `Searching for: ${keywords}`);
    this.navigationState.StartIndex = 0;
    this.navigationState.search = keywords;
    await this.navigate();
  }

  public onAttestationScheduleSelected(attSchedule: PortalAttestationSchedules): void {
    this.logger.debug(this, `Selected attestation schedule changed`);
    this.logger.trace(`New attestation schedule selected`, attSchedule);
    this.viewAttestationSchedule(attSchedule);
  }

  /**
   * Occurs when the navigation state has changed - e.g. users clicks on the next page button.
   *
   */
  public async onNavigationStateChanged(newState?: CollectionLoadParameters): Promise<void> {
    if (newState) {
      this.navigationState = newState;
    }
    await this.navigate();
  }

  private async viewAttestationSchedule(attSchedule: PortalAttestationSchedules): Promise<void> {
    const sidesheetRef = this.sidesheet.open(AttestationScheduleSidesheetComponent, {
      title: attSchedule.GetEntity().GetDisplay(),
      headerColour: 'blue',
      padding: '0px',
      width: '60%',
      data: attSchedule
    });
    // After the sidesheet closes, reload the current data to refresh any changes that might have been made
    sidesheetRef.afterClosed().subscribe(() => this.navigate());
  }

  private async navigate(): Promise<void> {
    this.requestsService.handleOpenLoader();
    try {
      const data = await this.requestsService.getAttestationSchedules(this.navigationState);
      this.dstSettings = {
        displayedColumns: this.displayedColumns,
        dataSource: data,
        entitySchema: this.entitySchemaAttestationSchedule,
        navigationState: this.navigationState,
        filters: this.filterOptions,
      };
      this.logger.debug(this, `Head at ${data.Data.length + this.navigationState.StartIndex} of ${data.totalCount} item(s)`);
    } finally {
      this.requestsService.handleCloseLoader();
    }
  }
}
