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

import { OverlayRef } from '@angular/cdk/overlay';
import { Component, OnInit, Inject, OnDestroy, ViewChild, ViewContainerRef, ChangeDetectorRef } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { EuiLoadingService, EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { Subscription } from 'rxjs';

import { TypedEntity } from 'imx-qbm-dbts';
import { PortalCartitem } from 'imx-api-qer';
import { TermsOfUseService } from './terms-of-use.service';
import { Approval } from '../itshopapprove/approval';
import { BusyService, ExtService } from 'qbm';
import { AuthenticationFactors } from '../admin/authentication-factors.interface';

/**
 * Form information for the typed authetification form
 */
interface AuthForm {
  authenticator: FormArray<FormControl<boolean>>;
}
/**
 * Form information for the typed terms of use form
 */
interface TosForm {
  acceptTermsOfUseFormCtrl: FormControl<boolean>;
}

/**
 * A component for viewing and accepting all {@link PortalTermsofuse|terms of use} related to a
 * given list of {@link PortalCartitem|PortalCartitems} or {@link PortalItshopApproveRequests|PortalItshopApproveRequests}.
 * Depending on the server configuration, the user may have to authenticate himself with OneLogin.
 */
@Component({
  templateUrl: './terms-of-use-accept.component.html',
  styleUrls: ['./terms-of-use-accept.component.scss'],
})
export class TermsOfUseAcceptComponent implements OnInit, OnDestroy {
  @ViewChild('authFormControls', { static: true, read: ViewContainerRef }) private authFormControls: ViewContainerRef;

  /** Does accepting terms without any authentication */
  public withoutAuthenticaton: boolean;

  /** The  {@link FormGroup} for accepting the terms of use */
  public termsOfUseFormGroup = new FormGroup<TosForm>({
    acceptTermsOfUseFormCtrl: new FormControl<boolean>(null, Validators.required),
  });

  /** The  {@link FormGroup} for the authentication */
  public authenticationFormGroup = new FormGroup<AuthForm>({
    authenticator: new FormArray<FormControl<boolean>>([], (ctrl: FormArray) => {
      return ctrl.controls.some((elem) => elem.value === true) ? null : { error: true };
    }),
  });

  /**
   * Gets the items, that has to be accepted (cart items or approval)
   */
  public get items(): TypedEntity[] {
    return this.data.acceptCartItems && this.data.cartItems?.length > 0 ? this.data.cartItems : this.data.approvalItems;
  }

  /** The workflow id used for mfa */
  public workflowId: string;

  /** Indicates whether the user has authenticators defined or not */
  public hasAuthenticators: boolean = false;

  /** Indicates whether the control is loading or not */
  public isLoading: boolean = false;

  /** busy service used in the authentication control and its sub controls */
  public busyService: BusyService = new BusyService();

  public isAuthenticated: boolean;

  public ldsAcceptCartItemsInfoText: string =
    '#LDS#One or more products in your shopping cart require you to accept the terms of use before you can proceed.';
  public ldsAcceptApprovalItemsInfoText: string =
    '#LDS#One or more requests require you to accept the terms of use before you can proceed.';
  public ldsItemsHeading: string;

  private subscriptions: Subscription[] = [];

  constructor(
    @Inject(EUI_SIDESHEET_DATA)
    public readonly data: {
      acceptCartItems: boolean;
      cartItems: PortalCartitem[];
      approvalItems: Approval[];
    },
    public readonly sidesheetRef: EuiSidesheetRef,
    private readonly termsOfUseService: TermsOfUseService,
    private readonly euiBusyService: EuiLoadingService,
    private readonly extension: ExtService,
    change: ChangeDetectorRef
  ) {
    this.subscriptions.push(
      this.sidesheetRef.closeClicked().subscribe(async () => {
        this.sidesheetRef.close(false);
      })
    );
    this.subscriptions.push(
      this.busyService.busyStateChanged.subscribe((elem) => {
        this.isLoading = elem;
        change.detectChanges();
      })
    );
  }

  public async ngOnInit(): Promise<void> {
    this.ldsItemsHeading = this.data.acceptCartItems ? '#LDS#Related products' : '#LDS#Related requests';
    const busy = this.busyService.beginBusy();

    try {
      const authProvider = await this.termsOfUseService.getStepUpAuthenticationProvider();
      this.withoutAuthenticaton =
        authProvider === 'NoAuth' || this.data.approvalItems?.every((elem) => !!!elem.IsAcceptTermsRequiresMfa.value);

      if (this.withoutAuthenticaton) {
        return;
      }
      await this.initAuthentication(!this.data.acceptCartItems);
    } finally {
      busy.endBusy();
    }
  }

  /**
   * unsubscribes all events when the control is destroyed
   */
  public ngOnDestroy(): void {
    this.subscriptions.forEach((elem) => elem.unsubscribe());
  }

  /**
   * Closes the sidesheet with an empty object
   */
  public cancel(): void {
    this.sidesheetRef.close({});
  }

  /**
   * Accept the terms of use without any authentication.
   */
  public async accept(): Promise<void> {
    this.data.cartItems && this.data.cartItems.length > 0 ? await this.acceptCartItems() : await this.acceptApprovalItems();
  }

  /**
   * Accept the terms of use of the current UIDs of approval items without any authentication.
   */
  private async acceptApprovalItems(): Promise<void> {
    let overlayRef: OverlayRef;
    setTimeout(() => (overlayRef = this.euiBusyService.show()));

    try {
      for (const item of this.data.approvalItems) {
        await this.termsOfUseService.acceptApprovalItems(item.GetEntity().GetKeys()[0]);
      }
    } finally {
      setTimeout(() => this.euiBusyService.hide(overlayRef));
    }

    this.sidesheetRef.close({ isChecked: true, isAuthenticated: this.authenticationFormGroup.valid });
  }

  /**
   * Accept the terms of use of the current UIDs of cart items without any authentication.
   */
  private async acceptCartItems(): Promise<void> {
    let overlayRef: OverlayRef;
    setTimeout(() => (overlayRef = this.euiBusyService.show()));

    try {
      for (const item of this.data.cartItems) {
        await this.termsOfUseService.acceptCartItems(item.GetEntity().GetKeys()[0]);
      }
    } finally {
      setTimeout(() => this.euiBusyService.hide(overlayRef));
    }

    this.sidesheetRef.close({ isChecked: true, isAuthenticated: this.authenticationFormGroup.valid });
  }

  /**
   * Inits the authentication controls, that are registered under the id 'authenticator'
   * @param isAppove shows if approval items or cart items are used
   */
  private async initAuthentication(isAppove: boolean) {
    this.workflowId = await this.termsOfUseService.getStepupId(
      isAppove ? this.data.approvalItems.map((elem) => elem.key) : this.data.cartItems.map((elem) => elem.UID_PersonWantsOrg.value)
    );

    const test = await this.extension.getFittingComponents('authenticator', async () => true);
    for (const iterator of test) {
      // creates a form control for the given authenticator instance and sets its inputs
      const componentRef = this.authFormControls.createComponent(iterator.instance).instance as AuthenticationFactors;

      componentRef.itemId = this.workflowId;
      componentRef.busyService = this.busyService;
      this.subscriptions.push(
        componentRef.loaded.subscribe((elem) => {
          this.hasAuthenticators = this.hasAuthenticators || elem;
        })
      );
      // adds formControl to the authenticaton form array
      this.subscriptions.push(componentRef.formControl.valueChanges.subscribe((value) => (this.isAuthenticated = value)));
      this.authenticationFormGroup.controls.authenticator.push(componentRef.formControl);
    }
  }
}
