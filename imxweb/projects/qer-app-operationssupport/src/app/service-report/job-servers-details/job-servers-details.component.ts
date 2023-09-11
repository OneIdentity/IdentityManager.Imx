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
import { EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { OpsupportJobservers, ServerExtendedDataItem } from 'imx-api-qbm';

@Component({
  selector: 'imx-job-servers-details',
  templateUrl: './job-servers-details.component.html',
  styleUrls: ['./job-servers-details.component.scss']
})
export class JobServersDetailsComponent {

  public tags:ServerExtendedDataItem[];
  public machineRoles:ServerExtendedDataItem[];
  constructor(@Inject(EUI_SIDESHEET_DATA) public serverDetails: OpsupportJobservers,
    private translate : TranslateService) {
      this.tags = serverDetails['Tags'];
      this.machineRoles = serverDetails['MachineRoles'];
     }
}
