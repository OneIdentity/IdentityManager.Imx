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
import { PwoData } from 'imx-api-qer';
import { EntityData } from 'imx-qbm-dbts';

@Component({
  selector: 'imx-workflow-violation-details',
  templateUrl: './workflow-violation-details.component.html',
  styleUrls: ['./workflow-violation-details.component.scss']
})
export class WorkflowViolationDetailsComponent implements OnInit {
  public violations: EntityData[] = [];

  @Input() public pwoData: PwoData;

  constructor() { }

  public ngOnInit(): void {
    this.violations = this.pwoData.WorkflowHistory.Entities.filter(item => item.Columns['UID_ComplianceRule'].Value);
  }

}
