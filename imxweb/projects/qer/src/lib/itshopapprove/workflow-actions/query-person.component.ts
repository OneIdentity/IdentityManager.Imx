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

import { Component, Input } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { PortalItshopApproveRequests } from '@imx-modules/imx-api-qer';
import { IWriteValue } from '@imx-modules/imx-qbm-dbts';

import { TranslateService } from '@ngx-translate/core';
import { LdsReplacePipe } from 'qbm';
import { QerApiService } from '../../qer-api-client.service';

@Component({
  templateUrl: './query-person.component.html',
  selector: 'imx-itshop-queryperson',
})
export class QueryPersonComponent {
  public Notice: IWriteValue<string>;
  // TODO minlen=1, caption:#LDS#Your question

  public UID_Person: IWriteValue<string>;
  // TDO configure as FK to person

  @Input() public PersonWantsOrg: PortalItshopApproveRequests;

  constructor(
    private readonly ldsReplace: LdsReplacePipe,
    private readonly translate: TranslateService,
    private readonly snackBar: MatSnackBar,
    private readonly apiService: QerApiService,
  ) {}

  public async Button3(): Promise<void> {
    // ActionOnControl({ 'ActionType': 'PerformValidation' });

    await this.apiService.client.portal_itshop_query_post(this.PersonWantsOrg.GetEntity().GetKeys()[0], {
      Text: this.Notice.value,
      UidPerson: this.UID_Person.value,
    });

    // TODO reload all data

    this.snackBar.open(
      this.ldsReplace.transform(
        await this.translate.get('#LDS#Your question was submitted to {0}.').toPromise(),
        this.UID_Person.Column.GetDisplayValue(),
      ),
    );
  }
}
