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

import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { DataIssuesService } from '../data-issues.service';

@Component({
  selector: 'imx-identities-workflow',
  templateUrl: './identities-workflow.component.html',
  styleUrls: ['./identities-workflow.component.scss'],
})
export class IdentitiesWorkflowComponent {
  constructor(public dialogRef: MatDialogRef<IdentitiesWorkflowComponent>, private readonly issues: DataIssuesService) {}

  public start(): void {
    this.issues.startIdentitiesManagerWorkflow().then(() => this.dialogRef.close('started'));
  }
}
