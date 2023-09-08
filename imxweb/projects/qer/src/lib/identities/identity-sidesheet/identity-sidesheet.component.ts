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
import { Component, OnDestroy, Inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatTabGroup } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { EuiLoadingService, EuiSidesheetService, EUI_SIDESHEET_DATA, EuiSidesheetRef } from '@elemental-ui/core';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { IdentitiesService } from '../identities.service';
import { FeatureConfig, PortalAdminPerson, PortalPersonReports, QerProjectConfig } from 'imx-api-qer';
import {
  ColumnDependentReference,
  ClassloggerService,
  BaseCdr,
  SnackBarService,
  AuthenticationService,
  SystemInfoService,
  ConfirmationService,
  TabItem,
  ExtService,
  CdrFactoryService,
} from 'qbm';
import { DbObjectKey } from 'imx-qbm-dbts';
import { IdentitiesReportsService } from '../identities-reports.service';
import { PasscodeService } from '../../ops/passcode.service';
import { QerApiService } from '../../qer-api-client.service';
import { RiskAnalysisSidesheetComponent } from '../../risk/riskanalysis-sidesheet.component';
import { FeatureConfigService } from '../../admin/feature-config.service';

@Component({
  selector: 'imx-identity-sidesheet',
  templateUrl: './identity-sidesheet.component.html',
  styleUrls: ['./identity-sidesheet.component.scss'],
})
export class IdentitySidesheetComponent implements OnInit, OnDestroy {
  @ViewChild('tabs') public tabs: MatTabGroup;

  public readonly detailsFormGroup: UntypedFormGroup;
  public cdrList: ColumnDependentReference[] = [];
  public cdrListPersonal: ColumnDependentReference[] = [];
  public cdrListOrganizational: ColumnDependentReference[] = [];
  public cdrListLocality: ColumnDependentReference[] = [];
  public valueChanges$: Subscription;
  public readonly parameters: { objecttable: string; objectuid: string };
  public canAnalyzeRisk = false;
  public isActiveFormControl = new UntypedFormControl();
  public isSecurityIncidentFormControl = new UntypedFormControl();
  public dynamicTabs: TabItem[] = [];

  private readonly subscriptions: Subscription[] = [];
  private currentUserUid: string;
  private featureConfig: FeatureConfig;

  constructor(
    @Inject(EUI_SIDESHEET_DATA)
    public data: {
      isAdmin: boolean;
      projectConfig: QerProjectConfig;
      selectedIdentity: PortalPersonReports | PortalAdminPerson;
      canEdit: boolean;
    },
    public identities: IdentitiesService,
    private readonly reports: IdentitiesReportsService,
    private readonly logger: ClassloggerService,
    private readonly busyService: EuiLoadingService,
    private readonly snackbar: SnackBarService,
    private readonly sidesheet: EuiSidesheetService,
    private readonly sidesheetRef: EuiSidesheetRef,
    private readonly confirmationService: ConfirmationService,
    private readonly passcodeService: PasscodeService,
    private readonly api: QerApiService,
    private readonly router: Router,
    private readonly systemInfoService: SystemInfoService,
    private readonly translate: TranslateService,
    private readonly extService: ExtService,    
    private readonly featureConfigService: FeatureConfigService,
    private readonly cdrFactoryService: CdrFactoryService,
    authentication: AuthenticationService,
    confirm: ConfirmationService
  ) {
    this.subscriptions.push(
      this.sidesheetRef.closeClicked().subscribe(async (result) => {
        if (this.detailsFormGroup.dirty) {
          const close = await confirm.confirmLeaveWithUnsavedChanges();
          if (close) {
            this.sidesheetRef.close();
          }
        } else {
          this.sidesheetRef.close(result);
        }
      })
    );

    this.subscriptions.push(authentication.onSessionResponse.subscribe((sessionState) => (this.currentUserUid = sessionState.UserUid)));

    this.detailsFormGroup = new UntypedFormGroup({});
    this.parameters = {
      objecttable: PortalPersonReports.GetEntitySchema().TypeName,
      objectuid: data.selectedIdentity.GetEntity().GetKeys()[0],
    };

    this.systemInfoService
      .get()
      .then((i) => (this.canAnalyzeRisk = i.PreProps.includes('RISKINDEX') && data.selectedIdentity.RiskIndexCalculated.value > 0));
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
    return this.featureConfig?.EnableSetPasswords && this.data.selectedIdentity.UID_PersonHead.value === this.currentUserUid;
  }

  public async ngOnInit(): Promise<void> {
    return this.setup();
  }

  public ngOnDestroy(): void {
    if (this.valueChanges$) {
      this.valueChanges$.unsubscribe();
    }

    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  public cancel(): void {
    this.closeSidesheet();
  }

  public async personsManagedReport(): Promise<void> {
    this.reports.personsManagedReport(
      this.data.selectedIdentity.GetEntity().GetKeys()[0],
      '#LDS#Download report on identities this identity is directly responsible for'
    );
  }

  public async personsReport(): Promise<void> {
    this.reports.personsReport(this.data.selectedIdentity);
  }

  public async initiateDelete(): Promise<void> {
    if (
      await this.confirmationService.confirm({
        Title: '#LDS#Heading Delete Identity',
        Message: '#LDS#Are you sure you want to delete the identity?',
      })
    ) {
      const overlayRef = this.busyService.show();
      try {
        const result = await this.identities.deleteIdentity(this.data.selectedIdentity.GetEntity().GetKeys()[0]);
        if (result) {
          this.snackbar.open({ key: '#LDS#The identity will be deleted. This may take some time.' });
          this.closeSidesheet();
        }
      } finally {
        this.busyService.hide(overlayRef);
      }
    }
  }

  public async save(): Promise<void> {
    if (this.detailsFormGroup.valid) {
      this.logger.debug(this, `Saving identity manager change`);
      const overlayRef = this.busyService.show();
      try {
        await this.data.selectedIdentity.GetEntity().Commit(true);
        this.detailsFormGroup.markAsPristine();
        this.snackbar.open({ key: '#LDS#The changes have been successfully saved.' });
        this.closeSidesheet();
      } finally {
        this.busyService.hide(overlayRef);
      }
    }
  }

  public async onIsSecurityIncidentToggleChanged(toggleChange: MatSlideToggleChange): Promise<void> {
    const message = this.data.selectedIdentity.IsSecurityIncident.value
      ? '#LDS#Are you sure this identity does not pose a security risk anymore?'
      : '#LDS#Are you sure this identity poses a security risk?';
    const title = this.data.selectedIdentity.IsSecurityIncident.value
      ? '#LDS#Heading Resolve Security Risk'
      : '#LDS#Heading Mark Identity as Security Risk';

    const result = await this.confirmationService.confirm({
      Title: title,
      Message: message,
    });

    if (!result) {
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

  public async analyzeRisk(): Promise<void> {
    this.sidesheet.open(RiskAnalysisSidesheetComponent, {
      title: await this.translate.get('#LDS#Heading Analyze Risk').toPromise(),
      subTitle: this.data.selectedIdentity.GetEntity().GetDisplay(),
      padding: '0px',
      width: '60%',
      testId: 'identity-sidesheet-analyze-risk-sidesheet',
      data: { objectKey: new DbObjectKey('Person', this.data.selectedIdentity.GetEntity().GetKeys()[0]).ToXmlString() },
    });
  }

  public async generatePasscode(): Promise<void> {
    let passcode;
    let overlayRef: OverlayRef;
    setTimeout(() => (overlayRef = this.busyService.show()));
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
      await this.passcodeService.getValidationDuration()
    );
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
      this.snackbar.open({ key: '#LDS#The assignment of the manager has been successfully added to your shopping cart.' });
      this.router.navigate(['shoppingcart']);
    }
  }

  public update(cdr: ColumnDependentReference, list: ColumnDependentReference[]): void {
    const index = list.findIndex((elem) => elem.column.ColumnName === cdr.column.ColumnName);
    if (index === -1) {
      return;
    }

    this.detailsFormGroup.removeControl(cdr.column.ColumnName);
    list.splice(index, 1, new BaseCdr(cdr.column));
  }

  private closeSidesheet(): void {
    this.sidesheetRef.close();
  }

  private async setup(): Promise<void> {
    // Resolve an issue where the mat-tab navigation arrows could appear on first load
    this.subscriptions.push(
      this.sidesheetRef.componentInstance.onOpen().subscribe(() => {
        // Recalculate header
        this.tabs.updatePagination();
      })
    );

    // Handle the IsInActive column outside the context of a CDR editor so the UI can invert the meaning to make more sense to the user
    // This should be inversed on the api data response at some point, but until then we handle it in the UI
    this.isActiveFormControl.setValue(!this.data.selectedIdentity.IsInActive.value);
    this.detailsFormGroup.addControl(this.data.selectedIdentity.IsInActive.Column.ColumnName, this.isActiveFormControl);

    const personalColumns = this.data.projectConfig.PersonConfig.VI_Employee_MasterData_Attributes;
    this.cdrListPersonal = this.cdrFactoryService.buildCdrFromColumnList(this.data.selectedIdentity.GetEntity(), personalColumns, !this.data.canEdit);

    const organizationalColumns = this.data.projectConfig.PersonConfig.VI_Employee_MasterData_OrganizationalAttributes;
    this.cdrListOrganizational = this.cdrFactoryService.buildCdrFromColumnList(
      this.data.selectedIdentity.GetEntity(),
      organizationalColumns, !this.data.canEdit
    );

    const localityColumns = this.data.projectConfig.PersonConfig.VI_Employee_MasterData_LocalityAttributes;
    this.cdrListLocality = this.cdrFactoryService.buildCdrFromColumnList(this.data.selectedIdentity.GetEntity(), localityColumns, !this.data.canEdit);

    this.isSecurityIncidentFormControl.setValue(this.data.selectedIdentity.IsSecurityIncident.value);
    this.detailsFormGroup.addControl(this.data.selectedIdentity.IsSecurityIncident.Column.ColumnName, this.isSecurityIncidentFormControl);

    this.busyService.show();
    try {
      this.featureConfig = await this.featureConfigService.getFeatureConfig();
      this.dynamicTabs = (
        await this.extService.getFittingComponents<TabItem>('identitySidesheet', (ext) => ext.inputData.checkVisibility(this.parameters))
      ).sort((tab1: TabItem, tab2: TabItem) => tab1.sortOrder - tab2.sortOrder);
    } finally {
      this.busyService.hide();
    }
  }
}
