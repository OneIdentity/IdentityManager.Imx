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

import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PortalRespTeamResponsibilities } from '@imx-modules/imx-api-qer';

@Component({
  selector: 'imx-team-responsibility-dialog',
  templateUrl: './team-responsibility-dialog.component.html',
  styleUrl: './team-responsibility-dialog.component.scss',
})
export class TeamResponsibilityDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<TeamResponsibilityDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PortalRespTeamResponsibilities[],
  ) {}

  public get singleSelection(): boolean {
    return this.data.length === 1;
  }

  public get getResponsibleIdentity(): string {
    return this.data[0].UID_Person.Column.GetDisplayValue();
  }

  public get getResponsibilityName(): string {
    return this.data[0].DisplayName.Column.GetDisplayValue();
  }
}
