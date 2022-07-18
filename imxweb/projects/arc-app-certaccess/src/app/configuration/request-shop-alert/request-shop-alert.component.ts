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

import { Component } from "@angular/core";
import { DataIssuesService } from "../../data-explorer/data-issues/data-issues.service";

@Component({
  templateUrl: './request-shop-alert.component.html',
  styleUrls: ['./request-shop-alert.component.scss']
})
export class RequestShopAlertComponent {

  private requestableGroupsCount;

  constructor(private readonly dataIssues: DataIssuesService) {
    this.dataIssues
      .getRequestableGroups()
      .subscribe((requestableGroupCount: number) => (this.requestableGroupsCount = requestableGroupCount));

  }

  get noRequestableGroups(): boolean {
    let result = false;
    if (typeof this.requestableGroupsCount !== 'undefined') {
      result = this.requestableGroupsCount === 0;
    }
    return result;
  }

}