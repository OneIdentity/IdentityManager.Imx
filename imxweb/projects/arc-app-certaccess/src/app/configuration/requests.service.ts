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

import { OverlayRef } from "@angular/cdk/overlay";
import { Injectable } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { EuiLoadingService } from "@elemental-ui/core";
import { TranslateService } from "@ngx-translate/core";
import { PortalAttestationSchedules } from "imx-api-att";
import { CollectionLoadParameters, EntitySchema, TypedEntityCollectionData } from "imx-qbm-dbts";
import { ArcApiService } from "../services/arc-api-client.service";

export const ACTION_DISMISS = '#LDS#Close';

@Injectable({
  providedIn: 'root'
})
export class RequestsService {

  constructor(private busyService: EuiLoadingService,
    private readonly snackbar: MatSnackBar,
    private readonly translate: TranslateService,
    private readonly arcApiClient: ArcApiService
  ) { }

  private busyIndicator: OverlayRef;

  public handleOpenLoader(): void {
    if (!this.busyIndicator) {
      this.busyIndicator = this.busyService.show();
    }
  }

  public handleCloseLoader(): void {
    if (this.busyIndicator) {
      setTimeout(() => {
        this.busyService.hide(this.busyIndicator);
        this.busyIndicator = undefined;
      });
    }
  }

  public openSnackbar(message: string, action: string): void {
    this.translate.get([message, action]).subscribe((translations: any[]) => {
      this.snackbar.open(translations[message], translations[action], { duration: 10000 });
    });
  }


  public get attestationSchedulesSchema(): EntitySchema {
    return this.arcApiClient.typedClient.PortalAttestationSchedules.GetSchema();
  }

  public async getAttestationSchedules(navigationState: CollectionLoadParameters):
    Promise<TypedEntityCollectionData<PortalAttestationSchedules>> {
    return this.arcApiClient.typedClient.PortalAttestationSchedules.Get(navigationState);
  }

}