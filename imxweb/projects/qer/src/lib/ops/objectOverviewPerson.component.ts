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

import { Component, OnInit } from '@angular/core';
import { EuiLoadingService } from '@elemental-ui/core';
import { OpsupportDbObjectService } from 'qbm';

import { ObjectOverviewContainer } from './objectOverviewContainer';
import { PasscodeService } from './passcode.service';
import { OpsPermissionsService } from './permissions/ops-permissions.service';

@Component({
  templateUrl: './objectOverviewPerson.component.html',
  styleUrls: ['./objectOverviewPerson.component.scss'],
})
export class ObjectOverviewPersonComponent implements OnInit {
  [x: string]: any;

  /*-------------------------
     vaiables and properties
     -------------------------*/
  public referrer: ObjectOverviewContainer;

  public isPasswordResetAllowed: boolean;

  constructor(
    private readonly passcodeService: PasscodeService,
    private readonly busyService: EuiLoadingService,
    private readonly dbObjectService: OpsupportDbObjectService,
    private readonly opsPermissionsService: OpsPermissionsService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.isPasswordResetAllowed = await this.opsPermissionsService.isPasswordHelpdesk();
  }

  get uidPerson(): string {
    return this.referrer.objectKey.Keys[0];
  }

  // Generates a passcode and shows it on the screen
  public async generateAndShowPasscode(): Promise<void> {
    let passCode;
    let managerDisplay;
    if (this.busyService.overlayRefs.length === 0) {
      this.busyService.show();
    }
    try {
      passCode = await this.passcodeService.getPasscodeWithOpsLogin(this.referrer.objectKey.Keys[0]);
      if (passCode && passCode.UID_PersonManager) {
        const entity = await this.dbObjectService.Get({
          tableName: 'Person',
          uid: passCode.UID_PersonManager,
        });

        managerDisplay = entity?.Display;
      }
    } finally {
      this.busyService.hide();
    }
    if (!passCode) {
      return;
    }
    return this.passcodeService.showPasscode(passCode, this.referrer.display, managerDisplay, 2);
  }
}
