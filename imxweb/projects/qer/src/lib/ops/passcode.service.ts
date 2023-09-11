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

import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

import { PersonPasscodeResult } from 'imx-api-qer';
import { LdsReplacePipe } from 'qbm';
import { ProjectConfigurationService } from '../project-configuration/project-configuration.service';
import { QerApiService } from '../qer-api-client.service';
import { PasscodeViewerComponent } from './passcodeViewer.component';

@Injectable({
  providedIn: 'root'
})
export class PasscodeService {

  constructor(
    private qerClient: QerApiService,
    private dialogService: MatDialog,
    private translationProvider: TranslateService,
    private readonly ldsReplace: LdsReplacePipe,
    private readonly config: ProjectConfigurationService,
  ) { }

  public async getPasscodeWithOpsLogin(uidPerson: string): Promise<PersonPasscodeResult> {
    return this.qerClient.client.opsupport_person_passcode_post(uidPerson);
  }

  public async getPasscodeWithPortalLogin(uidPerson: string): Promise<PersonPasscodeResult> {
    return this.qerClient.client.portal_person_passcode_post(uidPerson);
  }

  public async showPasscode(passcode: PersonPasscodeResult, userDisplay: string, managerDisplay: string, duration: number): Promise<void> {
    return this.openDialogAndShowPasscode(passcode.PasscodeSplit, passcode.PassCode, managerDisplay, userDisplay, duration);
  }

  public async getValidationDuration(): Promise<number> {
    return (await this.config.getConfig()).PersonConfig.VI_Employee_MasterData_PassCode_HoursValid;
  }

  private async openDialogAndShowPasscode(passcodeSplit: boolean, passCode: string, manager: string, display: string, duration: number):
    Promise<void> {
    const value = this.ldsReplace.transform(
      await this.translationProvider.get('#LDS#Passcode for {0}').toPromise(), display);
    this.dialogService.open(PasscodeViewerComponent, {
      data: { Code: passCode, PasscodeSplit: passcodeSplit, Manager: manager, Title: value, duration },
      panelClass: 'imx-messageDialog'
    });
  }
}

