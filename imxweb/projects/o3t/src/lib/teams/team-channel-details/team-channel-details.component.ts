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
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { PortalTargetsystemTeamsChannels } from 'imx-api-o3t';
import { BaseCdr, ColumnDependentReference, SnackBarService } from 'qbm';
import { TeamsService } from '../teams.service';

@Component({
  selector: 'imx-team-channel-details',
  templateUrl: './team-channel-details.component.html'
})
export class TeamChannelDetailsComponent implements OnInit {

  public readonly formGroup: UntypedFormGroup;
  public cdrList: ColumnDependentReference[] = [];

  constructor(
    formBuilder: UntypedFormBuilder,
    @Inject(EUI_SIDESHEET_DATA) public teamChannel: PortalTargetsystemTeamsChannels,
    private teamsService: TeamsService,
    private readonly sidesheetRef: EuiSidesheetRef,
    private readonly snackbar: SnackBarService,
  ) {
    this.formGroup = new UntypedFormGroup({ formArray: formBuilder.array([]) });
  }

  get formArray(): UntypedFormArray {
    return this.formGroup.get('formArray') as UntypedFormArray;
  }

  public ngOnInit(): void {
    this.setup();
  }

  public async saveChanges(): Promise<void> {
    this.teamsService.handleOpenLoader();
    try {
      await this.teamChannel.GetEntity().Commit(true);
      this.formGroup.markAsPristine();
      this.snackbar.open({ key: '#LDS#Your changes have been successfully saved.' });
    } finally {
      this.teamsService.handleCloseLoader();
    }
  }

  public cancel(): void {
    this.sidesheetRef.close();
  }

  private setup(): void {
    this.cdrList = [
      new BaseCdr(this.teamChannel.DisplayName.Column),
      new BaseCdr(this.teamChannel.Description.Column),
    ];
  }

}
