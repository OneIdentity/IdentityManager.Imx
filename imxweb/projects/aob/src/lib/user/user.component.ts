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

import { Component, Input, OnChanges } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

import { IReadValue, IWriteValue } from 'imx-qbm-dbts';
import { ClassloggerService } from 'qbm';

@Component({
  selector: 'imx-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnChanges {
  @Input() public uid: IReadValue<any> | IWriteValue<any>;
  @Input() public role: string;
  @Input() public noUserText: string;
  @Input() public size: 'default' | 'large' = 'default';

  public imageUrl: SafeUrl;
  public primaryValue: string;
  public secondaryValue: string;
  public hasUser: boolean;

  constructor(
    private readonly translateService: TranslateService,
    private readonly logger: ClassloggerService) {
  }

  public ngOnChanges(): void {
    if (!this.noUserText || this.noUserText.length < 1) {
      this.logger.debug(this, 'Show default noUserText because no other was specified.');
      this.noUserText = '#LDS#(not assigned)';
    }

    if (!this.hasValidUser()) {
      this.logger.debug(this, 'Show noUserText because of an empty value.');
      this.translateService.get(this.noUserText).subscribe((trans: string) => this.secondaryValue = trans);
      this.primaryValue = '';
    } else {
      this.primaryValue = this.uid.Column.GetDisplayValue();
      this.secondaryValue = this.role;
    }
  }
  private hasValidUser(): boolean {
    this.hasUser = this.uid != null && this.uid.value != null && this.uid.value.length > 0;
    return this.hasUser;
  }
}
