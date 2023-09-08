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

import { PasswordData, PasswordItemsData, PasswordresetPasswordquestions, PolicyValidationResult } from 'imx-api-qer';
import { QerApiService } from '../qer-api-client.service';

@Injectable({
  providedIn: 'root'
})
export class PasswordService {

  constructor(
    private readonly qerApiService: QerApiService
  ) { }

  public async getPasswordItems(uidPerson?: string): Promise<PasswordItemsData> {

    if (uidPerson)
      return this.qerApiService.client.opsupport_passwords_get(uidPerson);
    return this.qerApiService.client.passwordreset_passwords_get();
  }

  public async postOrCheckPassword(data: PasswordData, uidPerson?: string): Promise<PolicyValidationResult[]> {
    if(uidPerson)
      return this.qerApiService.client.opsupport_passwords_post(uidPerson, data);
    return this.qerApiService.client.passwordreset_passwords_post(data);
  }

  // ToDo later: CollectionLoadParameters anbinden oder sinnvolle max-Zahl wählen (je nachdem, was dann die User Story sagt)
  public async getQuestions(): Promise<PasswordresetPasswordquestions[]> {
    return (await this.qerApiService.typedClient.PasswordresetPasswordquestions.Get()).Data;
  }

}
