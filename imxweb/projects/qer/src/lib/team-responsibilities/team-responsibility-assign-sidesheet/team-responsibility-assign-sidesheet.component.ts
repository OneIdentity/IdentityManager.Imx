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

import { Component, Inject, OnInit } from '@angular/core';
import { EUI_SIDESHEET_DATA, EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import {
  PortalPersonReports,
  PortalRespTeamResponsibilities,
  ResponsibilityData,
  ResponsibilityIdentityData,
} from '@imx-modules/imx-api-qer';
import {
  CollectionLoadParameters,
  DataModel,
  DisplayColumns,
  EntitySchema,
  IClientProperty,
  TypedEntityCollectionData,
} from '@imx-modules/imx-qbm-dbts';
import { DataViewInitParameters, DataViewSource } from 'qbm';
import { IdentitiesService } from '../../identities/identities.service';
import { TeamResponsibilitiesService } from '../team-responsibilities.service';

@Component({
  selector: 'imx-team-responsibility-assign-sidesheet',
  templateUrl: './team-responsibility-assign-sidesheet.component.html',
  styleUrl: './team-responsibility-assign-sidesheet.component.scss',
  providers: [DataViewSource],
})
export class TeamResponsibilityAssignSidesheetComponent implements OnInit {
  public entitySchema: EntitySchema;
  public readonly DisplayedColumns = DisplayColumns;
  public selection: PortalPersonReports[] = [];
  private displayedColumns: IClientProperty[];
  private dataModel: DataModel;
  constructor(
    @Inject(EUI_SIDESHEET_DATA)
    public data: { responsibility: PortalRespTeamResponsibilities[]; reassign: boolean; extendedData: (ResponsibilityData | undefined)[] },
    private readonly sidesheetService: EuiSidesheetService,
    private readonly identitiesService: IdentitiesService,
    private readonly teamResponsibilitiesService: TeamResponsibilitiesService,
    private readonly busyServiceElemental: EuiLoadingService,
    public dataSource: DataViewSource<PortalPersonReports>,
  ) {
    this.entitySchema = this.identitiesService.personReportsSchema;
  }

  async ngOnInit(): Promise<void> {
    this.dataModel = await this.identitiesService.getDataModelAdmin();

    this.dataModel = { ...this.dataModel, Filters: this.dataModel.Filters?.filter((filter) => filter.Name !== 'isinactive') };
    this.displayedColumns = [
      this.entitySchema.Columns[this.DisplayedColumns.DISPLAY_PROPERTYNAME],
      this.entitySchema.Columns.UID_Department,
    ];
    this.dataSource.itemStatus = {
      enabled: (item: PortalPersonReports) =>
        !this.otherIdentities().some((otherIdentities) => otherIdentities?.UidPerson === item.GetEntity().GetKeys()[0]) &&
        !this.data.responsibility.some((responsibility) => responsibility.UID_Person.value === item.GetEntity().GetKeys()[0]),
    };
    const dataViewInitParameters: DataViewInitParameters<PortalPersonReports> = {
      execute: (params: CollectionLoadParameters, signal: AbortSignal): Promise<TypedEntityCollectionData<PortalPersonReports>> =>
        this.identitiesService.getReportsOfManager({ ...params, isinactive: '0' }, signal),
      schema: this.entitySchema,
      columnsToDisplay: this.displayedColumns,
      dataModel: this.dataModel,
      selectionChange: (selection: PortalPersonReports[]) => {
        this.selection = selection;
      },
    };

    this.dataSource.init(dataViewInitParameters);
  }

  public closeSidesheet(): void {
    this.sidesheetService.close();
  }

  public async assignMore(): Promise<void> {
    const overlayRef = this.busyServiceElemental.show();
    try {
      if (this.data.reassign) {
        await this.teamResponsibilitiesService.reassignResponsibilities(this.data.responsibility, this.selection, this.data.extendedData);
      } else {
        await this.teamResponsibilitiesService.assignResponsibility(this.data.responsibility[0], this.selection, this.data.extendedData[0]);
      }
    } finally {
      this.busyServiceElemental.hide(overlayRef);
      this.sidesheetService.close(true);
    }
  }

  public otherIdentities(): ResponsibilityIdentityData[] {
    let otherIdentities: ResponsibilityIdentityData[] = [];
    this.data.extendedData.map((extendedData) => otherIdentities.push(...(extendedData?.OtherIdentities || [])));
    return otherIdentities;
  }

  public get assignButtonEnabled(): boolean {
    return this.data.responsibility[0].UID_SourceColumn.value ? this.selection.length === 1 : !!this.selection.length;
  }
}
