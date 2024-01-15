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

import { Component, ErrorHandler, Inject, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { EuiLoadingService, EuiTheme, EuiThemeService, EuiThemeSwitcherComponent } from '@elemental-ui/core';
import { ProfileSettings} from 'imx-api-qer';
import { CollectionLoadParameters, CompareOperator, EntityCollectionData, FilterType, IEntityColumn, MetaTableRelationData, ValType, ValueStruct } from 'imx-qbm-dbts';
import { AppConfigService, BaseCdr, CustomThemeService, EntityService, SnackBarService, SystemInfoService } from 'qbm';
import { Subscription } from 'rxjs';
import { QerApiService } from '../qer-api-client.service';
import { DOCUMENT } from '@angular/common';

const portalApp = 'PORTAL';
const passwordResetApp = 'PASSWORDRESET';
const opsupportApp = 'OPSUPPORT';

@Component({
  selector: 'imx-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, OnDestroy {
  @ViewChild('themeSwitcherControl') themeSwitcherControl: EuiThemeSwitcherComponent;

  public timeZoneCdr: BaseCdr;
  public timeZoneEntityCollectionData: EntityCollectionData;
  public profileSettings : ProfileSettings;
  public serverProfileSettings: ProfileSettings;
  private app: string;
  private readonly subscriptions: Subscription[] = [];
  private userCulture: string;
  private defaultTheme: EuiTheme;
  private previousTheme: EuiTheme;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private readonly customThemeSvc: CustomThemeService,
    private readonly qerClient: QerApiService,
    private readonly errorHandler: ErrorHandler,
    private readonly euiLoadingService: EuiLoadingService,
    private readonly snackBarService: SnackBarService,
    private readonly themeService: EuiThemeService,
    private readonly entityService: EntityService,
    private readonly config: AppConfigService,
    private readonly systemInfoService: SystemInfoService,
    public dialogRef: MatDialogRef<SettingsComponent>
    ) {
      this.subscriptions.push(this.dialogRef.backdropClick().subscribe(() => this.resetThemeToDefault()));
    }

  public async ngOnInit() {
    this.app = this.config.Config.WebAppIndex.toUpperCase();
    await this.loadProfileSettings();
  }

  public get customThemes() : {name: string, class: string}[] {
    return this.customThemeSvc.customThemes;
  }

  public async loadProfileSettings()
  {
    let overlayRef = this.euiLoadingService.show();
    try
    {
      switch (this.app) {
        case portalApp:
          this.profileSettings = await this.qerClient.client.portal_profile_get();
          this.userCulture = (await this.qerClient.client.portal_profile_person_get())?.ProfileLanguage;
          break;
        case passwordResetApp:
          this.profileSettings = await this.qerClient.client.passwordreset_profile_get();
          this.userCulture = (await this.qerClient.client.passwordreset_profile_person_get())?.ProfileLanguage;
          break;
        case opsupportApp:
          this.profileSettings = await this.qerClient.client.opsupport_profile_get();
          this.userCulture = (await this.qerClient.client.opsupport_profile_person_get())?.ProfileLanguage;
          break;
      }

      this.serverProfileSettings = JSON.parse(JSON.stringify(this.profileSettings));
      this.defaultTheme = <EuiTheme>(await this.systemInfoService.getImxConfig()).DefaultHtmlTheme;
      this.timeZoneCdr = await this.createCdrForTimeZone();
    }
    catch (error) {
      this.errorHandler.handleError(error);
    }
    finally{
      this.previousTheme = <EuiTheme>localStorage.getItem('eui-theme');
      this.euiLoadingService.hide(overlayRef);
    }
  }

  public async saveProfileSettings()
  {
      let overlayRef = this.euiLoadingService.show();

      if(this.timeZoneCdr.column.GetValue()) {
        this.profileSettings.TimeZoneId = this.timeZoneCdr.column.GetValue();
      } else {
        this.profileSettings.TimeZoneId = "";
      }

      this.profileSettings.PreferredAppThemes = <EuiTheme>localStorage.getItem('eui-theme');

      try
      {
        switch (this.app) {
          case portalApp:
            await this.qerClient.client.portal_profile_post(this.profileSettings);
            break;
          case passwordResetApp:
            await this.qerClient.client.passwordreset_profile_post(this.profileSettings);
            break;
          case opsupportApp:
            await this.qerClient.client.opsupport_profile_post(this.profileSettings);
            break;
        }

        this.snackBarService.open({ key: '#LDS#The settings have been successfully saved.' });
        this.dialogRef.close();

        if(this.serverProfileSettings.UseProfileLanguage !== this.profileSettings.UseProfileLanguage) this.document.defaultView.location.reload();
      }
      catch (error) {
        this.errorHandler.handleError(error);
      }
      finally{
        this.euiLoadingService.hide(overlayRef);
      }
  }

  private resetThemeToDefault() {
    this.themeService.setTheme(this.previousTheme);
  }

  public cancelProfileSettings() {
    this.resetThemeToDefault();
  }

  public async resetProfileSettings()
  {
    this.themeService.setTheme(this.defaultTheme);

    let overlayRef = this.euiLoadingService.show();
    try
    {
      switch (this.app) {
        case portalApp:
          await this.qerClient.client.portal_profile_delete();
          break;
        case passwordResetApp:
          await this.qerClient.client.passwordreset_profile_delete();
          break;
        case opsupportApp:
          await this.qerClient.client.opsupport_profile_delete();
          break;
      }

      this.snackBarService.open({ key: '#LDS#The settings have been successfully reset.' });
      this.dialogRef.close();
    }
    catch (error) {
      this.errorHandler.handleError(error);
    }
    finally{
      this.euiLoadingService.hide(overlayRef);
    }
  }

  public async createCdrForTimeZone(): Promise<BaseCdr> {
    let DataValue = undefined;
    let DisplayValue = undefined;

    if (this.profileSettings?.TimeZoneId) {
      DataValue = this.profileSettings?.TimeZoneId;
      DisplayValue = await this.getTimezoneDisplay(DataValue);
    }

    let getDialogTimeZoneFunction: Function;

    switch (this.app) {
      case portalApp:
        getDialogTimeZoneFunction = (parameters) => this.qerClient.client.portal_candidates_DialogTimeZone_get(parameters);
        break;
      case passwordResetApp:
        getDialogTimeZoneFunction = (parameters) => this.qerClient.client.passwordreset_candidates_DialogTimeZone_get(parameters);
        break;
      case opsupportApp:
        getDialogTimeZoneFunction = (parameters) => this.qerClient.client.opsupport_candidates_DialogTimeZone_get(parameters);
        break;
    }

    const column = this.createColumn(
      {
        IsMemberRelation: false,
        ParentTableName: 'DialogTimeZone',
        ParentColumnName: 'UID_DialogTimeZone',
      },
      parameters => getDialogTimeZoneFunction(parameters),
      DataValue,
      DisplayValue
    );
    return new BaseCdr(column, '#LDS#Time zone');
  }

  private createColumn(
    fkRelation: MetaTableRelationData,
    loadFkCandidates: (parameters: CollectionLoadParameters) => Promise<EntityCollectionData>,
    DataValue: string | undefined,
    DisplayValue: string | undefined
  ): IEntityColumn {
    return this.entityService.createLocalEntityColumn(
      {
        ColumnName: fkRelation.ParentColumnName,
        Type: ValType.String,
        FkRelation: fkRelation
      },
      [{
        columnName: fkRelation.ParentColumnName,
        fkTableName: fkRelation.ParentTableName,
        parameterNames: [
          'OrderBy',
          'StartIndex',
          'PageSize',
          'filter',
          'search',
        ],
        load: async (_, parameters: CollectionLoadParameters = {}) => loadFkCandidates(parameters),
        getDataModel: async () => ({ Filters: [] }),
        getFilterTree: async () => ({ Elements: [] })
      }],
      DataValue && DisplayValue ? {Value: DataValue, DisplayValue: DisplayValue} : undefined
    );
  }

  private async getTimezoneDisplay(uid: string): Promise<string> {
    const timezoneOptions = {
      filter: [
        {
          ColumnName: 'UID_DialogTimeZone',
          Type: FilterType.Compare,
          CompareOp: CompareOperator.Equal,
          Value1: uid,
        },
      ],
    };

    let timezone = undefined;

    switch (this.app) {
      case portalApp:
        timezone = await this.qerClient.client.portal_candidates_DialogTimeZone_get(timezoneOptions);
        break;
      case passwordResetApp:
        timezone = await this.qerClient.client.passwordreset_candidates_DialogTimeZone_get(timezoneOptions);
        break;
      case opsupportApp:
        timezone = await this.qerClient.client.opsupport_candidates_DialogTimeZone_get(timezoneOptions);
        break;
    }

    if (timezone && timezone.TotalCount) {
      return timezone.Entities[0].Display;
    }
    return uid;
  }

  public async ngOnDestroy(): Promise<void> {
    await this.loadProfileSettings();
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
