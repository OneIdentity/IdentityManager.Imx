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
import { Router } from '@angular/router';
import { EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { ProjectConfigurationService } from '../../project-configuration/project-configuration.service';

import { AddressbookDetail } from './addressbook-detail.interface';

@Component({
  selector: 'imx-addressbook-detail',
  templateUrl: './addressbook-detail.component.html',
  styleUrls: ['./addressbook-detail.component.scss']
})
export class AddressbookDetailComponent implements OnInit {
  constructor(
    @Inject(EUI_SIDESHEET_DATA) public readonly data: AddressbookDetail,
    private readonly qerConfig: ProjectConfigurationService,
    public readonly sidesheetRef: EuiSidesheetRef,
    public readonly router: Router
  ) { }

  public isShowOrgChart: boolean;

  ngOnInit(): void {
    this.qerConfig.getConfig().then(config => this.isShowOrgChart = config.PersonConfig.ShowOrgChart);
  }
}
