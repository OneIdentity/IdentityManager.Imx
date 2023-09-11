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

import { Component, OnInit } from '@angular/core';

import { PasswordresetPasswordquestions } from 'imx-api-qer';
import { PasswordService } from './password.service';

@Component({
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class PasswordDashboardComponent implements OnInit {

  public qaProfileVisible: boolean;
  public securityKeysVisible: boolean;

  public qQuestions: PasswordresetPasswordquestions[] = [];
  public get hasAnyUnlockedQuestion(): boolean {
    return this.qQuestions && 0 < this.qQuestions.filter(i => !i.IsLocked.value).length;
  }

  constructor(
    private readonly passwordSvc: PasswordService
  ) { }


  public async ngOnInit(): Promise<void> {
    // ToDo Later
    // this.qaProfileVisible = config.PasswordConfig.VI_MyData_MyPassword_Visibility;
    // this.securityKeysVisible = config.AuthenticationConfig.VI_Common_AccessControl_Webauthn_2FA_VisibleControls 
    // && Exists("Person",variable(format(getconfig("VI_Employee_QERWebAuthnKey_Filter"), GetUser())))

    this.qQuestions = await this.passwordSvc.getQuestions();

  }
}
