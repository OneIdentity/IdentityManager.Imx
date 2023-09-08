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
import { EuiLoadingService } from '@elemental-ui/core';
import { PortalPersonOrgdata } from 'imx-api-qer';
import { QerApiService } from '../qer-api-client.service';

@Component({
  templateUrl: './org-chart.component.html',
  selector: 'imx-orgchart',
  styleUrls: ['./org-chart.component.scss'],
})
export class OrgChartComponent implements OnInit {
  constructor(private readonly apiService: QerApiService, private readonly busyService: EuiLoadingService) {}

  @Input() uidPerson: string;
  data: {
    self: PortalPersonOrgdata;
    peers: PortalPersonOrgdata[];
    managers: PortalPersonOrgdata[];
    reports: PortalPersonOrgdata[];
  };

  baseUrl: string;
  maxNumberDisplay = 32;

  public isNotDisplayingAll(): boolean {
    return (
      this.data &&
      (this.data.peers.length >= this.maxNumberDisplay ||
        this.data.managers.length >= this.maxNumberDisplay ||
        this.data.reports.length >= this.maxNumberDisplay)
    );
  }

  async ngOnInit() {
    const limitOptions = { PageSize: this.maxNumberDisplay };

    const loaderRef = this.busyService.show();

    try {
      // Peers, Managers, Reports
      const peers = this.apiService.typedClient.PortalPersonOrgdata.Get('peers', this.uidPerson, limitOptions);
      const managers = this.apiService.typedClient.PortalPersonOrgdata.Get('managers', this.uidPerson, limitOptions);
      const self = this.apiService.typedClient.PortalPersonOrgdata.Get('self', this.uidPerson);
      const reports = this.apiService.typedClient.PortalPersonOrgdata.Get('reports', this.uidPerson, limitOptions);

      this.data = {
        managers: (await managers).Data,
        self: (await self).Data[0],
        peers: (await peers).Data,
        reports: (await reports).Data,
      };
    } finally {
      this.busyService.hide(loaderRef);
    }
  }
}
