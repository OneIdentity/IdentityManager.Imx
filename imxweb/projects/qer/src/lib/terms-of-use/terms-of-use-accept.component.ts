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

import { OverlayRef } from '@angular/cdk/overlay';
import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EuiLoadingService, EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { Subscription } from 'rxjs';

import { TypedEntity } from 'imx-qbm-dbts';
import { PortalCartitem } from 'imx-api-qer';
import { TermsOfUseService } from './terms-of-use.service';
import { Approval } from '../itshopapprove/approval';

/**
 * A component for viewing and accepting all {@link PortalTermsofuse|terms of use} related to a
 * given list of {@link PortalCartitem|PortalCartitems} or {@link PortalItshopApproveRequests|PortalItshopApproveRequests}.
 * Depending on the server configuration, the user may have to authenticate himself with OneLogin.
 */
@Component({
  templateUrl: './terms-of-use-accept.component.html',
  styleUrls: ['./terms-of-use-accept.component.scss']
})
export class TermsOfUseAcceptComponent implements OnInit, OnDestroy {

  /** Does accepting terms without any authentication */
  public withoutAuthenticaton: boolean;

  /** The  {@link FormGroup} for accepting the terms of use */
  public termsOfUseFormGroup: FormGroup;

  /** The  {@link FormGroup} for the authentication */
  public authenticationFormGroup: FormGroup;

  public get items(): TypedEntity[] {
    return this.data.acceptCartItems && this.data.cartItems?.length > 0
      ? this.data.cartItems
      : this.data.approvalItems;
  }

  public ldsAcceptCartItemsInfoText = '#LDS#One or more products in your shopping cart require that you accept the terms of use before proceeding.';
  public ldsAcceptApprovalItemsInfoText = '#LDS#One or more requests require that you accept the terms of use before proceeding.';
  public ldsItemsHeading: string;

  private closeClickSubscription: Subscription;

  constructor(
    @Inject(EUI_SIDESHEET_DATA) public readonly data: {
      acceptCartItems: boolean,
      cartItems: PortalCartitem[],
      approvalItems: Approval[]
    },
    public readonly sidesheetRef: EuiSidesheetRef,
    private readonly termsOfUseService: TermsOfUseService,
    private readonly busyService: EuiLoadingService,
    private readonly formBuilder: FormBuilder
  ) {

    this.closeClickSubscription = this.sidesheetRef.closeClicked().subscribe(async () => {
      this.sidesheetRef.close(false);
    });
  }

  public async ngOnInit(): Promise<void> {

    this.ldsItemsHeading = this.data.acceptCartItems ? '#LDS#Related products' : '#LDS#Related requests';
    
    let overlayRef: OverlayRef;
    setTimeout(() => overlayRef = this.busyService.show());

    try {
      this.termsOfUseFormGroup = this.formBuilder.group({
        acceptTermsOfUseFormCtrl: ['', Validators.required]
      });
      this.authenticationFormGroup = this.formBuilder.group({
      });


      const authProvider = await this.termsOfUseService.getStepUpAuthenticationProvider();
      this.withoutAuthenticaton = authProvider === 'NoAuth';
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
  }

  public ngOnDestroy(): void {
    this.closeClickSubscription?.unsubscribe();
  }

  public cancel(): void {
    this.sidesheetRef.close(false);
  }

  /**
   * Accept the terms of use without any authentication.
   */
  public async acceptWithoutAuthentication(): Promise<void> {
    this.data.cartItems && this.data.cartItems.length > 0
      ? await this.acceptCartItemsWithoutAuthentication()
      : await this.acceptApprovalItemsWithoutAuthentication();
  }

  /**
   * Accept the terms of use of the current UIDs of approval items without any authentication.
   */
  private async acceptApprovalItemsWithoutAuthentication(): Promise<void> {
    let overlayRef: OverlayRef;
    setTimeout(() => overlayRef = this.busyService.show());

    try {
      for (const item of this.data.approvalItems) {
        await this.termsOfUseService.acceptApprovalItemsWithoutAuthentication((item.GetEntity().GetKeys()[0]));
      }
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }

    this.sidesheetRef.close(true);
  }

  /**
   * Accept the terms of use of the current UIDs of cart items without any authentication.
   */
  private async acceptCartItemsWithoutAuthentication(): Promise<void> {
    let overlayRef: OverlayRef;
    setTimeout(() => overlayRef = this.busyService.show());

    try {
      for (const item of this.data.cartItems) {
        await this.termsOfUseService.acceptCartItemsWithoutAuthentication((item.GetEntity().GetKeys()[0]));
      }
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }

    this.sidesheetRef.close(true);
  }
}
