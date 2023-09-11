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

import { QerApiService } from '../qer-api-client.service';

@Injectable()
export class MailSubscriptionService {
  constructor(private readonly apiClient: QerApiService) { }

  public async getMailsThatCanBeUnsubscribed(uidPerson: string): Promise<MailInfoType[]> {
    return (await this.GetMailInfo(uidPerson)).filter(mail => mail.AllowUnsubscribe);
  }

  public getMailsToUnsubscribe(mails: MailInfoType[], selected: string[]): MailInfoType[] {
    return mails.filter(m => m.IsSubscribed && !selected.includes(m.UidMail));
  }

  public getMailsToSubscribe(mails: MailInfoType[], selected: string[]): MailInfoType[] {
    return mails.filter(m => !m.IsSubscribed && selected.includes(m.UidMail));
  }

  public async unsubscribe(uidPerson: string, uidMail: string[]): Promise<void> {
    return this.changeSubscription(uidPerson, uidMail, true);
  }

  public async subscribe(uidPerson: string, uidMail: string[]): Promise<void> {
    return this.changeSubscription(uidPerson, uidMail, false);
  }

  private async GetMailInfo(uidPerson: string): Promise<MailInfoType[]> {
    return (await this.apiClient.typedClient.PortalPersonEmail.Get(uidPerson)).Data
      .map(r => ({
        Display: r.GetEntity().GetDisplay(),
        Description: r.Description.Column.GetDisplayValue(),
        UidMail: r.GetEntity().GetKeys()[0],
        IsSubscribed: r.IsSubscribed.value,
        AllowUnsubscribe: r.AllowUnsubscribe.value
      }));
  }

  private async changeSubscription(uidPerson: string, uidMail: string[], unsubscribe: boolean): Promise<void> {
    return this.apiClient.client.portal_person_email_post(
      uidPerson,
      {
        UidMail: uidMail,
        Unsubscribe: unsubscribe
      }
    );
  }
}

export type MailInfoType = {
  UidMail: string,
  Display: string,
  Description: string,
  IsSubscribed: boolean,
  AllowUnsubscribe: boolean
};
