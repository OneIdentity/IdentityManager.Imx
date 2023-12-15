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

import { Component, Inject } from '@angular/core';
import { EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { RecommendationData, RecommendationDataItem, RecommendationEnum } from 'imx-api-qer';

@Component({
  selector: 'imx-recommendation-sidesheet',
  templateUrl: './recommendation-sidesheet.component.html',
  styleUrls: ['./recommendation-sidesheet.component.scss']
})
export class RecommendationSidesheetComponent {
  public isRecApprove: boolean;
  public isRecReject: boolean;
  public isNoRec: boolean;
  public recommendationItems: RecommendationDataItem[];

  constructor(
    private sideSheetRef: EuiSidesheetRef,
    @Inject(EUI_SIDESHEET_DATA) private data: RecommendationData
  ) {
    if (data.Recommendation === RecommendationEnum.Approve) {
      this.isRecApprove = true;
    } else if (data.Recommendation === RecommendationEnum.Deny) {
      this.isRecReject = true;
    } else {
      this.isNoRec = true;
    }
    this.recommendationItems = data.Items;
  }


  public onApprove(): void {
    this.sideSheetRef.close('approve');
  }

  public onDeny(): void {
    this.sideSheetRef.close('deny');
  }

}
