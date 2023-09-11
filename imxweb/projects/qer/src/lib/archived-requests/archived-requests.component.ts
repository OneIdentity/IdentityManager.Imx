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

import { Component, OnDestroy } from '@angular/core';
import { AuthenticationService, ColumnDependentReference } from 'qbm';
import { AbstractControl, FormGroup } from '@angular/forms';
import { ArchivedRequestsService } from './archived-requests.service';
import { Subscription } from 'rxjs';

@Component({
  templateUrl: './archived-requests.component.html',
  styleUrls: ['./archived-requests.component.scss'],
})
export class ArchivedRequestsComponent implements OnDestroy {
  public cdrPersonRecipient: ColumnDependentReference;
  public readonly recipientFormGroup = new FormGroup({});
  public selectedRecipient?: string;

  public infoText = '#LDS#Here you can get an overview of all archived requests.';

  private sessionSubscription: Subscription;

  constructor(private archived: ArchivedRequestsService, authService: AuthenticationService) {
    this.sessionSubscription = authService.onSessionResponse.subscribe(async (session) => {
      await this.initRecipientForm(session.UserUid, session.Username);
    });
  }

  public ngOnDestroy(): void {
    this.sessionSubscription?.unsubscribe();
  }

  public getSelectedRecipientValue(event) {
    this.selectedRecipient = event.DataValue;
  }

  public addControl(group: FormGroup, name: string, control: AbstractControl): void {
    setTimeout(() => group.addControl(name, control));
  }

  private async initRecipientForm(userUid: string, username: string): Promise<void> {
    this.cdrPersonRecipient = this.archived.createRecipientCdr();
    await this.cdrPersonRecipient.column.PutValueStruct({ DataValue: userUid, DisplayValue: username });
    this.selectedRecipient = userUid;
  }
}
