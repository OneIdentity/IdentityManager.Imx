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

import { Component } from '@angular/core';
import { EuiSidesheetConfig, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';

import { NewUserComponent } from './new-user.component';

@Component({
  templateUrl: './open-sidesheet.component.html',
  styleUrls: ['./open-sidesheet.component.scss']
})
export class OpenSidesheetComponent {

  constructor(
    private readonly sidesheet: EuiSidesheetService,
    private readonly translate: TranslateService) { }

  public async openSidesheet(): Promise<void> {
    const config: EuiSidesheetConfig = {
      title: await this.translate.get('#LDS#Heading Create New Account').toPromise(),
      width: '650px',
      panelClass: 'imx-sidesheet',
      headerColour: 'blue',
      bodyColour: 'asher-gray',
      padding: '0px',
      disableClose: true,
      testId: 'register-new-user',
    };
    this.sidesheet.open(NewUserComponent, config);
  }
}
