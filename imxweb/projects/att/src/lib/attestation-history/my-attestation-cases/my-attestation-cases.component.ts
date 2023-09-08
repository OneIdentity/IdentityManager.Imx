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
import { Subscription } from 'rxjs';

import { AuthenticationService } from 'qbm';

@Component({
  templateUrl: './my-attestation-cases.component.html',
  styleUrls: ['./my-attestation-cases.component.scss'],
})
export class MyAttestationCasesComponent implements OnDestroy {
  public attestationParameters: { objecttable: string; objectuid: string } | undefined;
  private authSubscription: Subscription;

  constructor(authentication: AuthenticationService) {
    this.authSubscription = authentication.onSessionResponse.subscribe((session) => {
      this.attestationParameters = session.IsLoggedIn
        ? {
            objecttable: 'Person',
            objectuid: session.UserUid,
          }
        : undefined;
    });
  }

  public ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
  }
}
