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

import { Component, Input, OnChanges } from '@angular/core';
import { Router } from '@angular/router';
import { DataIssues } from './data-issues.models';
import { IdentitiesWorkflowComponent } from './identities-workflow/identities-workflow.component';
import { MatDialog } from '@angular/material/dialog';
import { SnackBarService } from 'qbm';

@Component({
  selector: 'imx-data-explorer-issues',
  templateUrl: './data-issues.component.html',
  styleUrls: ['./data-issues.component.scss'],
})
export class DataIssuesComponent implements OnChanges {
  @Input() public issues: DataIssues;

  constructor(
    private readonly router: Router,
    private readonly dialog: MatDialog,
    private readonly snackbar: SnackBarService
  ) { }

  public ngOnChanges(): void {
    if (this.issues && this.issues.count === 0) {
      setTimeout(() => this.router.navigate(['data/explorer/identities']));
    }
  }

  public fixIdentities(): void {
    const dialogRef = this.dialog.open(IdentitiesWorkflowComponent, {
      width: '600px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.snackbar.open({ key: '#LDS#An attestation to assign managers to identities has been started.' });
      }
    });
  }

  public viewIdentities(): void {
    this.router.navigate(['data/explorer/identities/issues']);
  }

  public fixAccounts(): void {
    this.router.navigate(['data/explorer/accounts/issues']);
  }

  public fixAccountsManager(): void {
    this.router.navigate(['data/explorer/accounts/issues/manager']);
  }

  public fixGroups(): void {
    this.router.navigate(['data/explorer/groups/issues']);
  }

  public fixUnrequestableGroups(): void {
    this.router.navigate(['data/explorer/groups/issues/requestable']);
  }
}
