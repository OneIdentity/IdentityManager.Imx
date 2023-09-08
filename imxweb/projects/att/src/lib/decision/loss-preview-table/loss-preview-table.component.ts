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
import { EntitlementLossDto } from 'imx-api-att';
import { LossPreview } from '../loss-preview.interface';
import { AttestationCasesService } from '../attestation-cases.service';

@Component({
  selector: 'imx-loss-preview-table',
  templateUrl: './loss-preview-table.component.html',
  styleUrls: ['./loss-preview-table.component.scss'],
})
export class LossPreviewTableComponent implements OnInit {
  @Input() public lossPreview: LossPreview;
  @Input() public showTitle = false;
  public isLoading = false;
  public lossPreviewItems: EntitlementLossDto[];
  public lossPreviewHeaders: string[];
  public lossPreviewDisplayKeys: EntitlementLossDto;

  constructor(private caseService: AttestationCasesService) {}

  public async ngOnInit(): Promise<void> {
    if (this.lossPreview.Case) {
      // If we pass in the case, then we still need to grab the loss items
      await this.loadData();
    }
    this.lossPreviewItems = this.lossPreview.LossPreviewItems;
    this.lossPreviewHeaders = this.lossPreview.LossPreviewHeaders;
    this.lossPreviewDisplayKeys = this.lossPreview.LossPreviewDisplayKeys;
  }

  public async loadData(): Promise<void> {
    this.isLoading = true;
    try {
      this.lossPreview.LossPreviewItems = await this.caseService.getLossPreviewEntities(this.lossPreview.Case);
    } finally {
      this.isLoading = false;
    }
  }
}
