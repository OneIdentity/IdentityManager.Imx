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

import { Component, Input, OnInit } from '@angular/core';
import { EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { PortalTargetsystemTeams } from 'imx-api-o3t';
import { CollectionLoadParameters, DisplayColumns, EntitySchema, IClientProperty } from 'imx-qbm-dbts';
import { ClassloggerService, DataSourceToolbarFilter, DataSourceToolbarSettings, SettingsService } from 'qbm';
import { TeamDetailsComponent } from './team-details/team-details.component';
import { TeamsService } from './teams.service';

@Component({
  selector: 'imx-o3t-teams',
  templateUrl: './teams.component.html'
})
export class TeamsComponent implements OnInit {

  @Input() public sidesheetWidth = '65%';
  public dstSettings: DataSourceToolbarSettings;
  public navigationState: CollectionLoadParameters;
  public filterOptions: DataSourceToolbarFilter[] = [];
  public readonly entitySchemaTeams: EntitySchema;
  public readonly DisplayColumns = DisplayColumns;

  private displayedColumns: IClientProperty[] = [];

  constructor(
    private readonly sideSheet: EuiSidesheetService,
    private readonly logger: ClassloggerService,
    settingsService: SettingsService,
    private readonly teamsService: TeamsService,
    private readonly translate: TranslateService
  ) {
    this.navigationState = { PageSize: settingsService.DefaultPageSize, StartIndex: 0 };
    this.entitySchemaTeams = this.teamsService.teamsSchema;
  }

  public async ngOnInit(): Promise<void> {
    this.displayedColumns = [
      this.entitySchemaTeams.Columns[DisplayColumns.DISPLAY_PROPERTYNAME],
      this.entitySchemaTeams.Columns.UID_O3EUnifiedGroup,
      this.entitySchemaTeams.Columns.WebUrl,
    ];

    await this.navigate();
  }

  public async onNavigationStateChanged(newState?: CollectionLoadParameters): Promise<void> {
    if (newState) {
      this.navigationState = newState;
    }
    await this.navigate();
  }

  public async onSearch(keywords: string): Promise<void> {
    this.logger.debug(this, `Searching for: ${keywords}`);
    this.navigationState.StartIndex = 0;
    this.navigationState.search = keywords;
    await this.navigate();
  }

  public async onTeamChanged(team: PortalTargetsystemTeams): Promise<void> {
    this.logger.debug(this, `Selected team changed`);
    this.logger.trace(this, `New team selected`, team);

    this.openDetailsSidesheet(team);
  }

  private async navigate(): Promise<void> {

    this.teamsService.handleOpenLoader();
    try {
      const data = await this.teamsService.getTeams(this.navigationState);
      this.dstSettings = {
        displayedColumns: this.displayedColumns,
        dataSource: data,
        entitySchema: this.entitySchemaTeams,
        navigationState: this.navigationState,
        filters: this.filterOptions,
      };
      this.logger.debug(this, `Head at ${data.Data.length + this.navigationState.StartIndex} of ${data.totalCount} item(s)`);
    } finally {
      this.teamsService.handleCloseLoader();
    }
  }

  private async openDetailsSidesheet( data: PortalTargetsystemTeams): Promise<void> {
    const sidesheetRef = this.sideSheet.open(TeamDetailsComponent, {
      title: await this.translate.get('#LDS#Heading View Microsoft Teams Team Details').toPromise(),
      subTitle: data.GetEntity().GetDisplay(),
      padding: '0px',
      width: `max(650px, ${this.sidesheetWidth})`,
      icon: 'usergroup',
      testId: 'teams-view-team-details',
      data
    });
    sidesheetRef.afterClosed().subscribe(() => this.navigate());
  }
}
