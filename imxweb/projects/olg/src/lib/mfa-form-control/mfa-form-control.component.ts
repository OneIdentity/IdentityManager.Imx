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

import { Component, EventEmitter, Input, OnInit, Output, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';

import { ActivateFactorData, AuthFactor, VerifyPollingResult } from 'imx-api-olg';
import { BaseCdr, BusyService, ColumnDependentReference, EntityService } from 'qbm';
import { AuthenticationFactors } from 'qer';
import { ValType } from 'imx-qbm-dbts';
import { PortalMfaService } from '../mfa/portal-mfa.service';

/**
 * Information that are used to handle each authentication factor
 */
interface AuthFactorInfo {
  factor: AuthFactor;
  authCdr?: ColumnDependentReference;
  showCdr?: boolean;
  authMessage?: string;
  loading?: boolean;
  activating?: boolean;
}

/**
 * Represents a list of OneLogin authentication factors as a FormControl<boolean> instance
 * The initial value of the FormControl is false, and changes to true, if one log in method was sucessful
 */
@Component({
  selector: 'imx-mfa-form-control',
  templateUrl: './mfa-form-control.component.html',
  styleUrls: ['./mfa-form-control.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MfaFormControlComponent),
      multi: true,
    },
  ],
})
export class MfaFormControlComponent implements OnInit, ControlValueAccessor, AuthenticationFactors {
  /** Array, that stores auth factor information */
  public authFactorInfo: AuthFactorInfo[] = [];

  /** currently activated factor */
  public activatedFactor: ActivateFactorData;

  /**
   * Gets whether the user is authenticated or not
   */
  public get isAuthenticated(): boolean {
    return this.formControl.value;
  }

  /** on change function for the ControlValueAccessor */
  public onChange: (event: boolean) => void;

  /** on touch function for the ControlValueAccessor */
  public onTouch: (event: boolean) => void;

  /** The form control associated with this control */
  public readonly formControl = new FormControl<boolean>(false);

  /** The id of the object that is tested*/
  @Input() public itemId: string;

  /** BusyService for loading */
  @Input() public busyService: BusyService;

  /** emmits, if all controls have been loaded */
  @Output() public loaded = new EventEmitter<boolean>();

  private ldsLoginFail: string = '#LDS#Authentication failed. Please try again.';

  constructor(private readonly mfa: PortalMfaService, private readonly entityService: EntityService) {}

  // ---------begin methods from value accessor-----------------
  /**
   * Updates the value of the form control
   * @param authenticated value that should be set
   */
  writeValue(authenticated: boolean): void {
    this.formControl.setValue(authenticated);
    if (this.onChange) {
      this.onChange(authenticated);
    }
    if (this.onTouch) {
      this.onTouch(authenticated);
    }
  }

  public registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  public registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  // ---------end methods from value accessor-----------------

  public async ngOnInit(): Promise<void> {
    const isBusy = this.busyService?.beginBusy();
    try {
      await this.initFacorInfo();
    } finally {
      isBusy?.endBusy();
    }
  }

  /**
   * Checks, if the factor is a one time password
   * @param factorName name of the factor to check
   * @returns true, if  one time password is used
   */
  public isOTP(factorName: string): boolean {
    return ['OneLogin Email', 'SMS'].includes(factorName);
  }

  /**
   * Checks, if the factor is using the OneLogin protectopr app
   * @param factorName name of the factor to check
   * @returns true, if the OneLogin protectopr app is used
   */
  public isProtect(factorName: string): boolean {
    return factorName === 'OneLogin';
  }

  /**
   * Checks, if the factor is using the authenticator or
   * @param factorName name of the factor to check
   * @returns true, if authenticator app is used
   */
  public isAuthenticator(factorName: string): boolean {
    return factorName === 'Google Authenticator';
  }

  /** Checks, if a cdr is valid */
  public isCDRValid(cdr: ColumnDependentReference): boolean {
    return cdr.column.GetValue().length > 0;
  }

  /** Checks, if a factor is activated */
  public get isActivated(): boolean {
    if (this.activatedFactor) {
      return true;
    }
    return false;
  }

  /** resets the state of an authenticator */
  public resetState(index: number): void {
    this.authFactorInfo[index].authCdr.column.PutValue('');
    this.authFactorInfo.forEach((elem) => (elem.showCdr = false));
    this.activatedFactor = null;
  }

  /**
   * Activates a factor and shows its cdr. Then the user is able to add information
   * @param factorName  the name of the factor that needs to be activated
   * @param deviceId the id for the device that should be used
   * @param index the number of the factor in the factor information array
   */
  public async activateFactor(factorName: string, deviceId: string, index: number): Promise<void> {
    this.authFactorInfo[index].activating = true;
    try {
      this.authFactorInfo.forEach((elem) => {
        elem.showCdr = false;
        elem.authMessage = '';
      });
      this.activatedFactor = await this.mfa.activateFactor(this.itemId, deviceId);
      this.authFactorInfo[index].showCdr = true;
      if (this.isProtect(factorName)) {
        this.verifyPoll(index);
      }
    } finally {
      this.authFactorInfo[index].activating = false;
    }
  }

  /**
   * Verfies, if a one time password is correct
   * @param index the index of the factor in the factor information array
   */
  public async verifyWithOTP(index: number): Promise<void> {
    this.authFactorInfo[index].loading = true;
    try {
      const result = await this.mfa.verifyWithVerificationId(
        this.itemId,
        this.activatedFactor.id,
        this.authFactorInfo[index].authCdr.column.GetValue()
      );
      if (result) {
        this.writeValue(true);
      } else {
        this.authFactorInfo[index].authMessage = this.ldsLoginFail;
        this.resetState(index);
      }
    } finally {
      this.authFactorInfo[index].loading = false;
    }
  }

  /**
   * Verfies, if a one time password is correct and the device is correct as well
   * @param index the index of the factor in the factor information array
   */
  public async verifyWithOTPAndDevice(index: number): Promise<void> {
    this.authFactorInfo[index].loading = true;
    try {
      const result = await this.mfa.verifyWithVerificationId(
        this.itemId,
        this.activatedFactor.id,
        this.authFactorInfo[index].authCdr.column.GetValue(),
        this.activatedFactor.device_id
      );
      if (result) {
        this.writeValue(true);
      } else {
        this.authFactorInfo[index].authMessage = this.ldsLoginFail;
        this.resetState(index);
      }
    } finally {
      this.authFactorInfo[index].loading = true;
    }
  }

  /**
   * Verfies the authentication using polling
   * @param index the index of the factor in the factor information array
   */
  public async verifyPoll(index: number): Promise<void> {
    this.authFactorInfo[index].loading = true;

    try {
      const pollResult = await this.mfa.verifyWithPolling(this.itemId, this.activatedFactor.id);
      if (pollResult === VerifyPollingResult.Accepted) {
        this.writeValue(true);
      } else {
        this.authFactorInfo[index].authMessage = this.ldsLoginFail;
        this.resetState(index);
      }
    } finally {
      this.authFactorInfo[index].loading = true;
    }
  }

  /**
   * Initializes the factor information array
   */
  private async initFacorInfo(): Promise<void> {
    const factors = await this.mfa.getFactors();
    factors.Factors.forEach((factor) => {
      this.authFactorInfo.push({
        factor,
        authCdr: new BaseCdr(
          this.entityService.createLocalEntityColumn({
            ColumnName: 'OTP',
            Type: ValType.Text,
            MinLen: 1,
          }),
          '#LDS#One-Time Password'
        ),
        showCdr: false,
        authMessage: '',
        activating: false,
        loading: false,
      });
    });
    this.loaded.emit(this.authFactorInfo.length > 0);
  }
}
