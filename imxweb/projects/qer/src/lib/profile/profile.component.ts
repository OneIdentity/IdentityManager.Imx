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

import { Component, ErrorHandler, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { MatTab } from '@angular/material/tabs';
import { EuiLoadingService } from '@elemental-ui/core';
import { Subscription } from 'rxjs';
import { OverlayRef } from '@angular/cdk/overlay';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import {
  AuthenticationService,
  ColumnDependentReference,
  ConfirmationService,
  ISessionState,
  SnackBarService,
  TabItem,
  ExtService,
  HelpContextualValues,
  HELP_CONTEXTUAL
} from 'qbm';
import { IEntity } from 'imx-qbm-dbts';
import { ProjectConfigurationService } from '../project-configuration/project-configuration.service';
import { MailInfoType, MailSubscriptionService } from './mailsubscription.service';
import { PersonService } from '../person/person.service';
import { SecurityKeysService } from './security-keys/security-keys.service';
import { TranslateService } from '@ngx-translate/core';
import { QerApiService } from '../qer-api-client.service';
import { ProfileSettings } from 'imx-api-qer';
import { QerPermissionsService } from '../admin/qer-permissions.service';

@Component({
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {

  @ViewChild('passwordQuestionTab') public set passwordTab (tab: MatTab) {
    if(tab && !this.passwordQuestionTab) { // initially setter gets called with undefined
      this.passwordQuestionTab = tab;
      if (this.hasPasswordQuestionsParam) {
        this.activatePassordQuestionTab();
      }
    }
  }

  /** The UID of the selected identity. */
  public get userUid(): string { return (this.selectedIdentity?.GetKeys() ?? []).join(''); }

  /** The UID of the authenticated identity.  */
  private authenticatedUid: string;

  public dynamicTabs: TabItem[] = [];
  public tabIndex = 0;
  public identities: IEntity[];
  public selectedIdentity: IEntity;
  public mailInfo: MailInfoType[] = [];
  public mailToBeUnsubscribed: MailInfoType;
  public hasMailSubscriptions: boolean;
  public form: UntypedFormGroup;
  public cdrList: ColumnDependentReference[] = [];
  public canManageSecurityKeys: boolean = false;
  public canManagePasswordQuestions: boolean;
  public isShowEntitlementsHyperview = false;
  public canShowEntitlementsHyperview = false;
  public readonly confirmChange = {
    check: () => this.form.pristine || this.confirmation.confirmLeaveWithUnsavedChanges()
  };
  public LdsMultipleIdentities: string = '#LDS#Here you can manage personal data, organizational information, and location information of the selected identity.';
  public LdsSingleIdentities: string = '#LDS#Here you can manage your personal data, organizational information, and location information and change the language of the user interface.';

  private useProfileCulture: boolean;
  private columns: string[];
  private hints: { [id: string]: string } = {};
  private passwordQuestionTab: MatTab;
  private readonly subscriptions: Subscription[] = [];
  private hasPasswordQuestionsParam = false;

  constructor(
    private readonly person: PersonService,
    private readonly errorHandler: ErrorHandler,
    private readonly snackBar: SnackBarService,
    private readonly busy: EuiLoadingService,
    private readonly projectConfig: ProjectConfigurationService,
    private readonly mailSvc: MailSubscriptionService,
    @Inject(DOCUMENT) private document: Document,
    private readonly authentication: AuthenticationService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly tabService: ExtService,
    private readonly securityKeysService: SecurityKeysService,
    private readonly translateService: TranslateService,
    private readonly confirmation: ConfirmationService,
    private readonly permissions: QerPermissionsService,
    private readonly qerClient: QerApiService,
  ) {
    this.subscriptions.push(this.authentication.onSessionResponse.subscribe(async (sessionState: ISessionState) => {
      if (sessionState.IsLoggedIn) {
        this.load(sessionState.UserUid);
        this.authenticatedUid = sessionState.UserUid;
      }
    }));
  }

  public async ngOnInit(): Promise<void> {
    this.dynamicTabs = this.tabService.Registry.profile as TabItem[];

    this.activatedRoute.params.subscribe(res => {
      this.checkPasswordQuestionsParam(res.id);
    });

    let overlayRef: OverlayRef;
    setTimeout(() => overlayRef = this.busy.show());
    try {
      // Security keys can only be managed for the identity that is also authenticated.
      this.canManageSecurityKeys = this.authenticatedUid && (await this.securityKeysService.canManageSecurityKeys());

      const projectConfig = await this.projectConfig.getConfig();
      this.canManagePasswordQuestions = projectConfig.PasswordConfig.VI_MyData_MyPassword_Visibility;
      this.useProfileCulture = projectConfig.PersonConfig.UseProfileCulture;

      this.canShowEntitlementsHyperview = await this.permissions.isPersonAdmin() || await this.permissions.isPersonManager();

      this.hints["UID_DialogCulture"] = await this.translateService.get(this.useProfileCulture
        ? '#LDS#Select the language in which you want to display web applications and receive emails.'
        : '#LDS#Select the language in which you want to receive emails.').toPromise();
      this.hints["UID_DialogCultureFormat"] = await this.translateService.get('#LDS#Select the language you want to use for date and number formats.')
        .toPromise();
    } finally {
      setTimeout(() => this.busy.hide(overlayRef));
    }
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  public async save(): Promise<void> {
    let overlayRef: OverlayRef;
    setTimeout(() => overlayRef = this.busy.show());
    try {
      await this.selectedIdentity.Commit(true);

      if (this.useProfileCulture && (this.form.get('UID_DialogCulture')?.dirty || this.form.get('UID_DialogCultureFormat')?.dirty)) {
        let profileSettings: ProfileSettings;
        profileSettings = await this.qerClient.client.portal_profile_get();

        profileSettings.UseProfileLanguage = (this.form.get('UID_DialogCulture')?.value || this.form.get('UID_DialogCultureFormat')?.value) !== undefined;
        await this.qerClient.client.portal_profile_post(profileSettings);

        this.document.defaultView.location.reload();
        return;
      }

      this.snackBar.open({ key: '#LDS#Your profile has been successfully updated.' });
      this.form.markAsPristine();
    } catch (error) {
      if (!(error instanceof TypeError)) {
        // TypeErrors should be ignored, because they are most likely to occure prior the reload
        this.errorHandler.handleError(error);
      }
    } finally {
      setTimeout(() => this.busy.hide(overlayRef));
    }
  }

  public async unsubscribe(uidMail: string): Promise<any> {
    let success = false;

    let overlayRef: OverlayRef;
    setTimeout(() => overlayRef = this.busy.show());
    try {
      await this.mailSvc.unsubscribe(this.userUid, [uidMail]);
      success = true;

      this.mailInfo = await this.mailSvc.getMailsThatCanBeUnsubscribed(this.userUid);
      this.hasMailSubscriptions = this.mailInfo.length > 0;
    } finally {
      setTimeout(() => this.busy.hide(overlayRef));
    }

    if (success) {
      this.snackBar.open({
        key: '#LDS#The "{0}" notification has been successfully deactivated.',
        parameters: [this.mailToBeUnsubscribed.Display]
      });
      this.showProfile();
    }
  }

  public showProfile(): void {
    this.mailToBeUnsubscribed = undefined;
    this.router.navigate([], { relativeTo: this.activatedRoute, queryParams: undefined });
  }

  public async onSelectIdentity(userUid: string): Promise<void> {
    return this.load(userUid);
  }

  public get selectedContextId(): HelpContextualValues{
    return this.identities?.length> 1 ? HELP_CONTEXTUAL.ProfileMultipleIdentities : HELP_CONTEXTUAL.Profile;
  }

  private async load(userUid: string): Promise<void> {
    this.form = new UntypedFormGroup({});

    let overlayRef: OverlayRef;
    setTimeout(() => overlayRef = this.busy.show());
    try {
      if (this.columns == null) {
        this.columns = (await this.projectConfig.getConfig()).PersonConfig.VI_PersonalData_Fields;
      }

      if (this.identities == null) {
        this.identities = (await this.person.getMasterdata()).Data.map(item => item.GetEntity());
      }

      this.selectedIdentity = (await this.person.getMasterdataInteractive(userUid)).Data[0].GetEntity();

      this.cdrList = (this.columns ?? []).map(columnName => {
        const column = this.selectedIdentity.GetColumn(columnName);
        return {
          column,
          isReadOnly: () => !column.GetMetadata().CanEdit(),
          hint: this.hints[columnName]
        };
      });

      this.mailInfo = await this.mailSvc.getMailsThatCanBeUnsubscribed(userUid);
      this.hasMailSubscriptions = this.mailInfo.length > 0;
      const mailSubscriptionUid = this.activatedRoute.snapshot.queryParams?.uid_dialogrichmail;
      this.mailToBeUnsubscribed = mailSubscriptionUid ? this.mailInfo?.find(item => item.UidMail === mailSubscriptionUid) : undefined;
    } finally {
      setTimeout(() => this.busy.hide(overlayRef));
    }
  }

  private async activatePassordQuestionTab(): Promise<void> {
    setTimeout(() => this.tabIndex = this.passwordQuestionTab.position);
  }

  /**
   * Checks the route param if it's the password-questions param.
   * @param param route param to check
   * @returns true, if it's the password-questions param
   */
  private checkPasswordQuestionsParam(param: string): void {
    this.hasPasswordQuestionsParam = param === 'profile-password-questions';
  }
}
