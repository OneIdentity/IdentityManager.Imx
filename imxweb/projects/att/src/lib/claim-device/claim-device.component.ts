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

import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { Component, ErrorHandler, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { OverlayRef } from '@angular/cdk/overlay';
import { MatRadioChange } from '@angular/material/radio';
import { EuiLoadingService } from '@elemental-ui/core';
import { Subscription } from 'rxjs';

import { AuthenticationService, BaseCdr, ISessionState } from 'qbm';
import { PersonService } from 'qer';
import { ClaimDeviceService } from './claim-device.service';

@Component({
  styleUrls: ['./claim-device.component.scss'],
  templateUrl: './claim-device.component.html'
})
export class ClaimDeviceComponent implements OnDestroy, OnInit {
  public get ownerDisplay(): string { return this.ownerCdr ? this.ownerCdr.column.GetDisplayValue() : this.user.name; }

  public deviceCdr: BaseCdr;
  public ownerCdr: BaseCdr;
  public ownershipOptions: { title: string; createOwnerCdr: () => BaseCdr; }[];
  public ownerAssigned = false;
  public canClaimDevice = false;

  public readonly deviceForm = new UntypedFormGroup({});
  public readonly ownerForm = new UntypedFormGroup({});

  private deviceKey: string;
  private readonly user: { uid?: string; name?: string; } = {};
  private readonly subscriptions: Subscription[] = [];

  constructor(
    private readonly claimDeviceService: ClaimDeviceService,
    private readonly personService: PersonService,
    private readonly busyService: EuiLoadingService,
    private readonly authentication: AuthenticationService,
    private readonly errorHandler: ErrorHandler
  ) {
    this.initDeviceCdr();

    this.subscriptions.push(this.authentication.onSessionResponse.subscribe(async (sessionState: ISessionState) => {
      if (sessionState) {
        this.user.uid = sessionState.UserUid;
        this.user.name = sessionState.Username;
      }
    }));
  }

  public async ngOnInit(): Promise<void> {
    let overlayRef: OverlayRef;
    setTimeout(() => overlayRef = this.busyService.show());
    try {
     this.canClaimDevice = await this.claimDeviceService.canClaimDevice();
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  public resetForms(): void {
    this.initDeviceCdr();
    this.initOwnerCdr(undefined);
    this.ownerAssigned = false;
  }

  public ownerCandidateListChange(change: MatRadioChange): void {
    this.initOwnerCdr(change.value.createOwnerCdr());
  }

  public async stepChange(change: StepperSelectionEvent): Promise<void> {
    switch (change.selectedIndex) {
      case 2:
        return this.loadSuggestedOwners();
      case 3:
        return this.assignOwner();
    }
  }

  public async loadSuggestedOwners(): Promise<void> {
    const fkValue = this.deviceCdr.column.GetValue(); 

    if (this.deviceKey === fkValue) {
      return;
    }

    this.deviceKey = fkValue;
    const display = '#LDS#Designated owner';
    this.ownershipOptions = [];
    this.ownershipOptions.push({
      title: '#LDS#I want to take ownership of this device',
      createOwnerCdr: () => undefined
    });

    this.ownershipOptions.push({
      title: '#LDS#Select another owner',
      createOwnerCdr: () => new BaseCdr(
        this.personService.createColumnCandidatesPerson(),
        display
      )
    });

    this.initOwnerCdr(this.ownershipOptions[0].createOwnerCdr());
  }

  public async assignOwner(): Promise<void> {
    let overlayRef: OverlayRef;
    setTimeout(() => overlayRef = this.busyService.show());
    try {
      await this.claimDeviceService.assignOwner(
        this.deviceKey,
        this.ownerCdr ? this.ownerCdr.column.GetValue() : this.user.uid
      );

      this.ownerAssigned = true;
    } catch (error) {
      this.errorHandler.handleError(error);
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
  }

  private initDeviceCdr(): void {
    Object.keys(this.deviceForm.controls).forEach(name => this.deviceForm.removeControl(name));

    this.deviceCdr = this.claimDeviceService.createCdrForDevice();
  }

  private initOwnerCdr(cdr: BaseCdr): void {
    Object.keys(this.ownerForm.controls).forEach(name => this.ownerForm.removeControl(name));

    this.ownerCdr = cdr;
  }
}
