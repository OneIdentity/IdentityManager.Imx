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

import { ChangeDetectorRef, Component, Inject, OnDestroy } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { Subscription } from 'rxjs';

import { BusyService } from 'qbm';

/**
 * Form information for the typed authetification form
 */
interface AuthForm {
  authenticator: FormControl<boolean>;
}

/**
 * Component, that provides a list of OneLogin authentication factors
 *
 * Can be displayed in a side sheet, that will be closed, if one authentication method was successful
 */
@Component({
  templateUrl: './mfa.component.html',
  styleUrls: ['./mfa.component.scss'],
})
export class MfaComponent implements OnDestroy {
  public authForm = new FormGroup<AuthForm>({
    authenticator: new FormControl<boolean>(false),
  });
  /** Indicates whether the user has authenticators defined or not */
  public hasAuthenticators: boolean = false;

  /** Indicates whether the control is loading or not */
  public isLoading: boolean = false;

  /** busy service used in the authentication control and its sub controls */
  public busyService: BusyService = new BusyService();

  private subscriptions: Subscription[] = [];

  constructor(
    @Inject(EUI_SIDESHEET_DATA)
    public readonly data: {
      workflowActionId: string;
    },
    sideSheetRef: EuiSidesheetRef,
    change: ChangeDetectorRef
  ) {
    this.subscriptions.push(
      this.busyService.busyStateChanged.subscribe((state) => {
        this.isLoading = state;
        change.detectChanges();
      })
    );
    this.subscriptions.push(
      this.authForm.controls.authenticator.valueChanges.subscribe((value) => {
        if (!!value) {
          sideSheetRef.close(true);
        }
      })
    );
  }

  /**
   * unsubscribes all subscriptions, when the component is destroyed
   */
  public ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
