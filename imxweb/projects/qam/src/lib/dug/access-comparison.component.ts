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

import { Component, Input, OnInit } from '@angular/core';
import { EuiLoadingService } from '@elemental-ui/core';
import { PortalDgeResourcesbyid } from '../TypedClient';
import { QamApiService } from '../qam-api-client.service';

type ComparisonData = { display: string; trusteeType: number; accessA?: string[]; accessB?: string[] };

/** Displays a comparison between security entries on two resources. */
@Component({
  templateUrl: './access-comparison.component.html',
  styleUrls: ['../qam.scss'],
  selector: 'imx-dge-access-comparison',
})
export class AccessComparisonComponent implements OnInit {
  constructor(
    private readonly qam: QamApiService,
    private loadingService: EuiLoadingService,
  ) {}

  @Input() dug: PortalDgeResourcesbyid;

  uidDugA: string;
  uidDugB: string;

  dugB: PortalDgeResourcesbyid;

  loading = false;

  comparisonData: ComparisonData[];
  trusteeTypes: { [id: number]: string };

  async ngOnInit() {
    const over = this.loadingService.show();
    try {
      this.trusteeTypes = await this.qam.getTrusteeTypes();
      const parent = this.dug.UID_QAMDuGParent.value;
      this.dugB = (await this.qam.typedClient.PortalDgeResourcesInteractivebyid.Get_byid(parent)).Data[0];

      // combine data by trustee
      const map = new Map<string, ComparisonData>();

      await this.mapTrusteeA(map);
      await this.mapTrusteeB(map, parent);

      this.comparisonData = Array.from(map.values());
    } finally {
      this.loadingService.hide(over);
    }
  }

  private async mapTrusteeA(map: Map<string, ComparisonData>): Promise<void> {
    const accessA = await this.qam.client.portal_dge_resources_trusteeandpolicyrightset_get(this.dug.UID_QAMDuG.value);
    if (accessA.Trustees) {
      accessA.Trustees.forEach((element) => {
        if (!map.has(element.Display ?? ''))
          map.set(element.Display ?? '', {
            display: element.Display ?? '',
            trusteeType: element.TrusteeType,
          });

        const mapA = map.get(element.Display ?? '');
        if (mapA) {
          mapA.accessA = element.Permissions;
        }
      });
    }
  }

  private async mapTrusteeB(map: Map<string, ComparisonData>, parent: string): Promise<void> {
    const accessB = await this.qam.client.portal_dge_resources_trusteeandpolicyrightset_get(parent);
    if (accessB.Trustees) {
      accessB.Trustees.forEach((element) => {
        if (!map.has(element.Display ?? ''))
          map.set(element.Display ?? '', {
            display: element.Display ?? '',
            trusteeType: element.TrusteeType,
          });

        const mapB = map.get(element.Display ?? '');
        if (mapB) {
          mapB.accessB = element.Permissions;
        }
      });
    }
  }

  public LdsHeader = "#LDS#Access rights comparison between '{0}' and '{1}'";

  public LdsTitle =
    '#LDS#The following displays a comparison of the access rights assigned on a security deviated resource and its parent structure.';

  public LdsSubTitle =
    "#LDS#The resource '{0}' has been identified as the parent resource of '{1}'. Without deviated security indexes, the resource '{1}' would have inherited the access permissions which are assigned to '{0}'.";
}
