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

import { Component, OnInit } from '@angular/core';
import { QerPermissionsService } from  '../admin/qer-permissions.service';
import { HELP_CONTEXTUAL, HelpContextualValues } from 'qbm';

@Component({
  templateUrl: './request-history.component.html',
  styleUrls: ['./request-history.component.scss']
})
export class RequestHistoryComponent implements OnInit {

  public auditMode = false;
  contextId: HelpContextualValues;

  constructor(
    private readonly qerPermissionService: QerPermissionsService,
  ) {}

  public async ngOnInit(): Promise<void> {
    this.auditMode = await this.qerPermissionService.isShopStatistics();
    if(this.auditMode){
      this.contextId = HELP_CONTEXTUAL.RequestHistoryAuditor;
    }else{
      this.contextId = HELP_CONTEXTUAL.RequestHistory;
    }
    
  }
}
