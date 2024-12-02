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

import { Component, ErrorHandler, Input, OnInit } from '@angular/core';
import { EuiLoadingService } from '@elemental-ui/core';

import { FormControl } from '@angular/forms';
import { SnackBarService } from 'qbm';
import { MailInfoType, MailSubscriptionService } from './mailsubscription.service';

@Component({
  selector: 'imx-mail-subscriptions',
  templateUrl: './mailsubscriptions.component.html',
  styleUrls: ['./mailsubscriptions.component.scss'],
})
export class MailSubscriptionsComponent implements OnInit {
  public selectedOptions: string[] = [];
  public filteredSelectedOptions: string[] = [];
  public selectionChanged = false;
  public searchControl: FormControl<string> = new FormControl();
  public filteredMailInfo: MailInfoType[];
  @Input() public set mailInfo(value: MailInfoType[]) {
    this._mailInfo = value;
    this.filteredMailInfo = value;
    this.selectedOptions = this.mailInfo.filter((item) => item.IsSubscribed).map((item) => item.UidMail);
    this.filteredSelectedOptions = this.selectedOptions;
  }
  public get mailInfo(): MailInfoType[] {
    return this._mailInfo;
  }
  @Input() public uidPerson: string;
  private _mailInfo: MailInfoType[];

  constructor(
    private readonly mailSvc: MailSubscriptionService,
    private readonly errorHandler: ErrorHandler,
    private readonly busy: EuiLoadingService,
    private readonly snackBar: SnackBarService,
  ) {}

  public async ngOnInit(): Promise<void> {
    this.searchControl.valueChanges.subscribe((searchValue) => this.filterItems(searchValue.toLowerCase()));
  }

  public async saveChanges(): Promise<void> {
    await this.wrap(async () => {
      const unsubscribed = this.mailSvc.getMailsToUnsubscribe(this.mailInfo, this.selectedOptions);
      const subscribed = this.mailSvc.getMailsToSubscribe(this.mailInfo, this.selectedOptions);

      if (unsubscribed.length > 0) {
        await this.mailSvc.unsubscribe(
          this.uidPerson,
          unsubscribed.map((c) => c.UidMail),
        );
      }
      if (subscribed.length > 0) {
        await this.mailSvc.subscribe(
          this.uidPerson,
          subscribed.map((c) => c.UidMail),
        );
      }
      for (const m of this.mailInfo) {
        m.IsSubscribed = this.selectedOptions.includes(m.UidMail);
      }
      this.selectionChanged = false;
      this.snackBar.open({ key: '#LDS#The changes have been successfully saved.' });
    });
  }

  public onSelectionChanged(): void {
    this.selectionChanged = true;
  }
  public onSelectAllChange(checked: boolean): void {
    if (checked) {
      this.filteredSelectedOptions = this.filteredMailInfo.map((item) => item.UidMail);
    } else {
      this.filteredSelectedOptions = [];
    }
    this.selectionChanged = true;
  }

  public get allSelected(): boolean {
    return this.filteredMailInfo.length == this.filteredSelectedOptions.length && !!this.filteredSelectedOptions.length;
  }

  public get partiallySelected(): boolean {
    return this.filteredMailInfo.length != this.filteredSelectedOptions.length && !!this.filteredSelectedOptions.length;
  }

  private async wrap(call: () => Promise<void>): Promise<void> {
    if (this.busy.overlayRefs.length === 0) {
      this.busy.show();
    }

    try {
      await call();
    } catch (error) {
      this.errorHandler.handleError(error);
    } finally {
      this.busy.hide();
    }
  }

  private filterItems(search: string): void {
    this.filteredMailInfo = this.mailInfo.filter(
      (item) => item.Display.toLowerCase().includes(search) || item.Description.toLowerCase().includes(search),
    );
    this.filteredSelectedOptions = this.selectedOptions.filter((option) =>
      this.filteredMailInfo.some((mailInfo) => mailInfo.UidMail === option),
    );
  }
}
