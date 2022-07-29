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

import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { EuiSidesheetService, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { PortalTargetsystemTeams } from 'imx-api-o3t';
import { BaseCdr, ColumnDependentReference, SnackBarService } from 'qbm';
import { GroupSidesheetComponent, GroupSidesheetData, GroupsService } from 'tsb';
import { TeamsService } from '../teams.service';

@Component({
  selector: 'imx-team-details',
  templateUrl: './team-details.component.html'
})
export class TeamDetailsComponent implements OnInit {
  public readonly formGroup: FormGroup;
  public cdrList: ColumnDependentReference[] = [];

  constructor(
    formBuilder: FormBuilder,
    @Inject(EUI_SIDESHEET_DATA) public team: PortalTargetsystemTeams,
    private teamsService: TeamsService,
    private readonly sidesheet: EuiSidesheetService,
    private readonly groupsService: GroupsService,
    private readonly snackbar: SnackBarService,
  ) {
    this.formGroup = new FormGroup({ formArray: formBuilder.array([]) });
  }

  get formArray(): FormArray {
    return this.formGroup.get('formArray') as FormArray;
  }

  get teamId(): string {
    return this.team?.GetEntity().GetKeys().join('');
  }

  public ngOnInit(): void {
    this.setup();
  }

  public async saveChanges(): Promise<void> {
    this.teamsService.handleOpenLoader();
    try {
      this.team.GetEntity().Commit(true);
      this.formGroup.markAsPristine();
      this.snackbar.open({ key: '#LDS#Your changes have been successfully saved.' });
    } finally {
      this.teamsService.handleCloseLoader();
    }
  }

  public cancel(): void {
    this.sidesheet.close();
  }

  public async viewGroup(): Promise<void> {

    let data: GroupSidesheetData;
    this.teamsService.handleOpenLoader();
    try {
      const unsGroupDbObjectKey: any = { TableName: 'O3EUnifiedGroup', Keys: [this.team.UID_O3EUnifiedGroup.value] };
      const o3tGroup = await this.groupsService.getGroupDetails(unsGroupDbObjectKey);
      const uidAccProduct = o3tGroup?.GetEntity().GetColumn('UID_AccProduct').GetValue();
      const serviceItem = await this.groupsService.getGroupServiceItem(uidAccProduct);

      data = {
        uidAccProduct,
        unsGroupDbObjectKey,
        group: o3tGroup,
        groupServiceItem: serviceItem
      };
    } finally {
      this.teamsService.handleCloseLoader();
    }

    this.openGroupSidesheet(this.team.GetEntity().GetDisplay(), data);
  }

  private async openGroupSidesheet(title: string, data: GroupSidesheetData): Promise<void> {
    this.sidesheet.open(GroupSidesheetComponent, {
      title,
      headerColour: 'green',
      padding: '0px',
      width: 'max(650px, 60%)',
      icon: 'usergroup',
      data
    });
  }

  private setup(): void {
    this.cdrList = [
      new BaseCdr(this.team.tmsAllowDeleteChannels.Column),
      new BaseCdr(this.team.tmsAllowCreateUpdateRemoveTabs.Column),
      new BaseCdr(this.team.tmsAllowCreateUpdateRemoveConn.Column),
      new BaseCdr(this.team.tmsAllowCreateUpdateChannels.Column),
      new BaseCdr(this.team.tmsAllowAddRemoveApps.Column),
      new BaseCdr(this.team.msAllowUserEditMessages.Column),
      new BaseCdr(this.team.msAllowUserDeleteMessages.Column),
      new BaseCdr(this.team.msAllowTeamMentions.Column),
      new BaseCdr(this.team.msAllowOwnerDeleteMessages.Column),
      new BaseCdr(this.team.msAllowChannelMentions.Column),
      new BaseCdr(this.team.gsAllowDeleteChannels.Column),
      new BaseCdr(this.team.IsArchived.Column),
      new BaseCdr(this.team.gsAllowCreateUpdateChannels.Column),
      new BaseCdr(this.team.fsGiphyContentRating.Column),
      new BaseCdr(this.team.fsAllowStickersAndMemes.Column),
      new BaseCdr(this.team.fsAllowGiphy.Column),
      new BaseCdr(this.team.fsAllowCustomMemes.Column)
    ];
  }
}
