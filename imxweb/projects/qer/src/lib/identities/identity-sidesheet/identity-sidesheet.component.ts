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
 * Copyright 2021 One Identity LLC.
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

import { Component, OnDestroy, Inject, Injector, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, FormControl } from '@angular/forms';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { EuiLoadingService, EuiSidesheetService, EUI_SIDESHEET_DATA, EuiDownloadOptions, EuiSidesheetRef } from '@elemental-ui/core';
import { OverlayRef } from '@angular/cdk/overlay';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

import { IdentitiesService } from '../identities.service';
import { PortalAdminPerson, PortalPersonReportsInteractive, QerProjectConfig } from 'imx-api-qer';
import {
  ColumnDependentReference,
  ClassloggerService,
  BaseCdr,
  TabControlHelper,
  SnackBarService,
  ElementalUiConfigService,
  MessageDialogComponent,
  MessageDialogResult,
  AuthenticationService,
  MetadataService,
  ExtService
} from 'qbm';
import { CollectionLoadParameters, DisplayColumns } from 'imx-qbm-dbts';
import { IdentitiesReportsService } from '../identities-reports.service';
import { PasscodeService } from '../../ops/passcode.service';
import { QerApiService } from '../../qer-api-client.service';
import { Router } from '@angular/router';
import { IdentityRoleMembershipsService } from './identity-role-memberships/identity-role-memberships.service';
import { IdentityMembershipsParameters } from '../identity-memberships/identity-memberships-parameters.interface';

@Component({
  selector: 'imx-identity-sidesheet',
  templateUrl: './identity-sidesheet.component.html',
  styleUrls: ['./identity-sidesheet.component.scss'],
})
export class IdentitySidesheetComponent implements OnInit, OnDestroy {
  public readonly detailsFormGroup: FormGroup;
  public cdrList: ColumnDependentReference[] = [];
  public cdrListPersonal: ColumnDependentReference[] = [];
  public cdrListOrganizational: ColumnDependentReference[] = [];
  public cdrListLocality: ColumnDependentReference[] = [];
  public valueChanges$: Subscription;
  public reportDownload: EuiDownloadOptions;

  public readonly parameters: { objecttable: string; objectuid: string; };
  public readonly uidPerson: string;
  public hideAttestationTab = false;
  public hideAccountsTab = false;
  public hideGroupsTab = false;
  public roleParameter: IdentityMembershipsParameters;
  public groupParameter: IdentityMembershipsParameters;

  public isActiveFormControl = new FormControl();
  public isSecurityIncidentFormControl = new FormControl();

  private readonly subscriptions: Subscription[] = [];
  private currentUserUid: string;

  constructor(
    formBuilder: FormBuilder,
    @Inject(EUI_SIDESHEET_DATA) public data: {
      isAdmin: boolean,
      projectConfig: QerProjectConfig
      selectedIdentity: PortalPersonReportsInteractive | PortalAdminPerson
    },
    public identities: IdentitiesService,
    private readonly elementalUiConfigService: ElementalUiConfigService,
    private readonly reports: IdentitiesReportsService,
    private readonly logger: ClassloggerService,
    private readonly busyService: EuiLoadingService,
    private readonly snackbar: SnackBarService,
    private readonly sidesheet: EuiSidesheetService,
    private readonly sidesheetRef: EuiSidesheetRef,
    private readonly dialogService: MatDialog,
    private readonly translate: TranslateService,
    private readonly passcodeService: PasscodeService,
    private readonly api: QerApiService,
    private readonly router: Router,
    private readonly extService: ExtService,
    private readonly injector: Injector,
    private readonly metadataService: MetadataService,
    private readonly roleMembershipsService: IdentityRoleMembershipsService,
    authentication: AuthenticationService
  ) {

    this.subscriptions.push(
      authentication.onSessionResponse.subscribe((sessionState) =>
        this.currentUserUid = sessionState.UserUid
      )
    );

    this.detailsFormGroup = new FormGroup({ formArray: formBuilder.array([]) });
    this.reportDownload = {
      ... this.elementalUiConfigService.Config.downloadOptions,
      url: this.reports.personsReport(30, this.data.selectedIdentity.GetEntity().GetKeys()[0]),
    };

    this.parameters = {
      objecttable: PortalPersonReportsInteractive.GetEntitySchema().TypeName,
      objectuid: data.selectedIdentity.GetEntity().GetKeys()[0]
    };

    const accountsComponent = this.extService.Registry.AccountsExtComponent?.slice(-1)[0];
    if (!accountsComponent) {
      this.hideAccountsTab = true;
    } else {
      this.uidPerson = data.selectedIdentity.GetEntity().GetKeys()[0];
    }
  }

  get formArray(): FormArray {
    return this.detailsFormGroup.get('formArray') as FormArray;
  }

  get isIdentityMarkedForDelete(): boolean {
    let result = false;
    if (this.data.selectedIdentity && this.data.selectedIdentity.XMarkedForDeletion) {
      result = this.data.selectedIdentity.XMarkedForDeletion.value === 1;
    }
    return result;
  }

  public get canMarkedAsIncident(): boolean {
    return this.currentUserUid !== this.data.selectedIdentity.GetEntity().GetKeys()[0];
  }

  public get canGeneratePasscode(): boolean {
    return this.data.selectedIdentity.UID_PersonHead.value === this.currentUserUid;
  }

  public async ngOnInit(): Promise<void> {
    this.setup();
    return this.setupMembershipTabs();
  }

  public ngOnDestroy(): void {
    if (this.valueChanges$) {
      this.valueChanges$.unsubscribe();
    }

    this.subscriptions.forEach(s => s.unsubscribe());
  }

  public attestationControlCreated(attestationServiceAvailable: boolean): void {
    this.hideAttestationTab = !attestationServiceAvailable;
  }

  public cancel(): void {
    this.closeSidesheet();
  }

  public async initiateDelete(): Promise<void> {
    const result = await this.identities.deleteIdentity(this.data.selectedIdentity.GetEntity().GetKeys()[0]);
    if (result) {
      this.snackbar.openAtTheBottom({ key: '#LDS#The identity will be deleted. This may take some time.' });
      this.closeSidesheet();
    }
  }

  public async save(): Promise<void> {
    if (this.detailsFormGroup.valid) {
      this.logger.debug(this, `Saving identity manager change`);
      const overlayRef = this.busyService.show();
      try {
        await this.data.selectedIdentity.GetEntity().Commit(true);
        this.detailsFormGroup.markAsPristine();
        this.snackbar.openAtTheBottom({ key: '#LDS#The changes have been successfully saved.' });
        this.closeSidesheet();
      } finally {
        this.busyService.hide(overlayRef);
      }
    }
  }

  public async onIsSecurityIncidentToggleChanged(toggleChange: MatSlideToggleChange): Promise<void> {
    const message = this.data.selectedIdentity.IsSecurityIncident.value ? '#LDS#Are you sure this identity does not pose a security risk anymore?' :
      '#LDS#Are you sure this identity poses a security risk?';
    const title = this.data.selectedIdentity.IsSecurityIncident.value ? '#LDS#Heading Resolve Security Risk' :
      '#LDS#Heading Mark Identity as Security Risk';

    const dialogRef = this.dialogService.open(
      MessageDialogComponent,
      {
        data: {
          ShowYesNo: true,
          Title: await this.translate.get(title).toPromise(),
          Message: await this.translate.get(message).toPromise()
        },
        panelClass: 'imx-messageDialog'
      }
    );

    const result = await dialogRef.afterClosed().toPromise();
    if (result == null || result === MessageDialogResult.NoResult) {
      this.isSecurityIncidentFormControl.setValue(!toggleChange.checked);
      return;
    }
    this.data.selectedIdentity.IsSecurityIncident.value = !this.data.selectedIdentity.IsSecurityIncident.value;
  }

  public onIsActiveToggleChanged(toggleChange: MatSlideToggleChange): void {
    // Invert the toggle value to match with the inverted state of the column 'IsInActive'
    const value = !toggleChange?.checked;
    if (this.data.selectedIdentity.IsInActive.GetMetadata().CanEdit()) {
      this.data.selectedIdentity.IsInActive.value = value;
    }
  }

  public async generatePasscode(): Promise<void> {
    let passcode;
    let overlayRef: OverlayRef;
    setTimeout(() => overlayRef = this.busyService.show());
    try {
      passcode = await this.passcodeService.getPasscodeWithPortalLogin(this.data.selectedIdentity.GetEntity().GetKeys()[0]);
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
    if (!passcode) {
      return;
    }
    return this.passcodeService.showPasscode(
      passcode,
      this.data.selectedIdentity.GetEntity().GetDisplay(),
      null,
      await this.passcodeService.getValidationDuration());
  }

  public async onAssignManager(): Promise<void> {
    this.busyService.show();

    try {
      const carts = await this.api.typedClient.PortalItshopCart.Get();
      const param = this.api.typedClient.PortalPersonRequestmanagerchange.createEntity();
      param.UID_PersonOrdered.value = this.data.selectedIdentity.GetEntity().GetKeys()[0];
      if (carts.totalCount > 0) {
        param.UID_ShoppingCartOrder.value = carts.Data[0].GetEntity().GetKeys()[0];
      }

      await this.api.typedClient.PortalPersonRequestmanagerchange.Post(this.data.selectedIdentity.GetEntity().GetKeys()[0], param);

    } finally {
      this.busyService.hide();
      this.sidesheetRef.close();
      this.snackbar.open({ key: '#LDS#The assignment of the manager has been successfully added to your shopping cart.' })
      this.router.navigate(['shoppingcart']);
    }

  }

  private closeSidesheet(): void {
    this.sidesheet.close();
  }

  private setup(): void {
    /**
     * Resolve an issue where the mat-tab navigation arrows could appear on first load
     */
    setTimeout(() => {
      TabControlHelper.triggerResizeEvent();
    });

    if (this.data.isAdmin) {
      this.cdrList = [
        new BaseCdr(this.data.selectedIdentity.GetEntity().GetColumn(DisplayColumns.DISPLAY_PROPERTYNAME)),
        new BaseCdr(this.data.selectedIdentity.DefaultEmailAddress.Column),
        new BaseCdr(this.data.selectedIdentity.UID_PersonHead.Column),
      ];
      // Handle the IsInActive column outside the context of a CDR editor so the UI can invert the meaning to make more sense to the user
      // This should be inversed on the api data response at some point, but until then we handle it in the UI
      this.isActiveFormControl.setValue(!this.data.selectedIdentity.IsInActive.value);
      this.formArray.push(this.isActiveFormControl);

    } else {
      const personalColumns = this.data.projectConfig.PersonConfig.VI_Employee_MasterData_Attributes;
      this.cdrListPersonal = personalColumns.map(col => new BaseCdr(this.data.selectedIdentity.GetEntity().GetColumn(col)));

      const organizationalColumns = this.data.projectConfig.PersonConfig.VI_Employee_MasterData_OrganizationalAttributes;
      this.cdrListOrganizational = organizationalColumns.map(col => new BaseCdr(this.data.selectedIdentity.GetEntity().GetColumn(col)));

      const localityColumns = this.data.projectConfig.PersonConfig.VI_Employee_MasterData_LocalityAttributes;
      this.cdrListLocality = localityColumns.map(col => new BaseCdr(this.data.selectedIdentity.GetEntity().GetColumn(col)));
    }

    this.isSecurityIncidentFormControl.setValue(this.data.selectedIdentity.IsSecurityIncident.value);
    this.formArray.push(this.isSecurityIncidentFormControl);

  }


  private async setupMembershipTabs(): Promise<void> {
    await this.metadataService.update(['UNSAccountInUNSGroup', 'AERole']);
    const roleSchema = this.roleMembershipsService.PortalPersonRolemembershipsAerole;
    this.roleParameter = {
      display: this.metadataService.tables.AERole.Display,
      entitySchema: roleSchema,
      displayedColumns: [roleSchema.Columns[DisplayColumns.DISPLAY_PROPERTYNAME],
      roleSchema.Columns.XOrigin,
      roleSchema.Columns.XDateInserted,
      roleSchema.Columns.OrderState,
      roleSchema.Columns.ValidUntil],
      getData: (navigation: CollectionLoadParameters) =>
        this.roleMembershipsService.getAeroleMemberships(this.data.selectedIdentity.GetEntity().GetKeys()[0], navigation)
    };

    const groupService = this.extService.Registry.IdentityGroupMembershipService?.slice(-1)[0];
    if (!groupService) {
      this.hideGroupsTab = true;
    } else {
      const serviceInstance = this.injector.get(groupService.instance);
      const groupSchema = serviceInstance.personGroupmembershipsSchema;

      this.groupParameter = {
        display: this.metadataService.tables.UNSAccountInUNSGroup.Display,
        entitySchema: groupSchema,
        displayedColumns: [groupSchema.Columns[DisplayColumns.DISPLAY_PROPERTYNAME],
        groupSchema.Columns.UID_UNSAccount,
        groupSchema.Columns.XOrigin,
        groupSchema.Columns.XDateInserted,
        groupSchema.Columns.OrderState,
        groupSchema.Columns.ValidUntil],
        getData: (navigation: CollectionLoadParameters) =>
          serviceInstance.getGroupMemberships(this.data.selectedIdentity.GetEntity().GetKeys()[0], navigation)
      };
    }
  }
}

