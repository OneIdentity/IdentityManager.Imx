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

import { Component, Inject, OnInit } from "@angular/core";
import { EUI_SIDESHEET_DATA } from "@elemental-ui/core";
import { AttestationSnapshotData } from "imx-api-att";
import { ApiService } from "../api.service";

@Component({
  templateUrl: './attestation-snapshot.component.html',
  styleUrls: ['./attestation-snapshot.component.scss']
})
export class AttestationSnapshotComponent implements OnInit {

  constructor(@Inject(EUI_SIDESHEET_DATA) private data: {
    uidCase: string,
    date: string
  },
    private readonly attApi: ApiService) {
  }

  public snapshot: AttestationSnapshotData;

  public async ngOnInit(): Promise<void> {
    this.snapshot = await this.attApi.client.portal_attestation_snapshot_get(this.data.uidCase);
  }

  public LdsHelperText = '#LDS#The following data was saved on {0} and should be reviewed.';

  public get attestationDate() { return this.data.date; }
}