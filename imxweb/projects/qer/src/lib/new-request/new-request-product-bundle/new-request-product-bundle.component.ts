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

import { Component } from '@angular/core';
import { HELP_CONTEXTUAL } from 'qbm';
import { NewRequestOrchestrationService } from '../new-request-orchestration.service';
import { SelectedProductSource } from '../new-request-selected-products/selected-product-item.interface';

@Component({
  selector: 'imx-new-request-product-bundle',
  templateUrl: './new-request-product-bundle.component.html',
  styleUrls: ['./new-request-product-bundle.component.scss'],
})
export class NewRequestProductBundleComponent {
  public contextId = HELP_CONTEXTUAL.NewRequestProductBundle;
  constructor(public readonly orchestration: NewRequestOrchestrationService) {
    this.orchestration.selectedView = SelectedProductSource.ProductBundles;
  }
}
