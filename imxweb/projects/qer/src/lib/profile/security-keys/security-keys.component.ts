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

import { Component, OnDestroy, OnInit } from "@angular/core";
import { SecurityKeysService } from "./security-keys.service";
import { BusyService, ClassloggerService, ConfirmationService, DataSourceToolbarSettings, SettingsService } from "qbm";
import { CollectionLoadParameters, DisplayColumns, EntitySchema, IClientProperty, ValType } from "imx-qbm-dbts";
import { TranslateService } from "@ngx-translate/core";
import { EuiSidesheetService } from "@elemental-ui/core";
import { SecurityKeysSidesheetComponent } from "./security-keys-sidesheet/security-keys-sidesheet.component";
import { PortalWebauthnkey } from "imx-api-qer";
import { Subscription } from "rxjs";

@Component({
  selector: 'imx-security-keys',
  templateUrl: './security-keys.component.html',
  styleUrls: ['./security-keys.component.scss']
})
export class SecurityKeysComponent implements OnInit, OnDestroy {
  public readonly DisplayColumns = DisplayColumns;
  public entitySchema: EntitySchema;
  public dstSettings: DataSourceToolbarSettings;
  public navigationState: CollectionLoadParameters;
  public busyService = new BusyService();
  public newKeyUrl: string;

  private displayedColumns: IClientProperty[] = [];
  private subscriptions: Subscription[] = [];

  constructor(
    private readonly securityKeysService: SecurityKeysService,
    private readonly settings: SettingsService,
    private readonly sideSheet: EuiSidesheetService,
    private readonly logger: ClassloggerService,
    private readonly translate: TranslateService,
    private readonly confirmation: ConfirmationService,
  ) { }

  public async ngOnInit(): Promise<void> {
    this.entitySchema = this.securityKeysService.getSchema();
    this.navigationState = { PageSize: this.settings.DefaultPageSize, StartIndex: 0 };
    this.displayedColumns = [
      this.entitySchema.Columns.DisplayName,
      this.entitySchema.Columns.SignatureCount,
      this.entitySchema.Columns.DateLastUsed,
      this.entitySchema.Columns.DateRegistered,
      {
        ColumnName: 'buttons',
        Type: ValType.String
      },
    ];
    await this.navigate();
  }

  /**
   * Resets StartIndex and handles search keywords.
   */
  public async onSearch(keywords: string): Promise<void> {
    this.logger.debug(this, `Searching for: ${keywords}`);
    this.navigationState.StartIndex = 0;
    this.navigationState.search = keywords;
    await this.navigate();
  }

  /**
   * Occurs when the navigation state has changed - e.g. users clicks on the next page button.
   *
   */
  public async onNavigationStateChanged(newState?: CollectionLoadParameters): Promise<void> {
    if (newState) {
      this.navigationState = newState;
    }
    await this.navigate();
  }

  /**
   * Reloads the table with the appropiate dstSettings
   */
  private async navigate(): Promise<void> {
    const isBusy = this.busyService.beginBusy();

    try {
      const data = await this.securityKeysService.get(this.navigationState);
      this.newKeyUrl = data.extendedData.NewKeyUrl;
      this.dstSettings = {
        displayedColumns: this.displayedColumns,
        dataSource: data,
        entitySchema: this.entitySchema,
        navigationState: this.navigationState,
      };
    } finally {
      isBusy?.endBusy();
    }
  }

  /**
   * Sends the user to the registry URL
   */
  public createSecurityKey() {
    window.open(this.newKeyUrl, "_blank");
  }

  /**
   * Deletes the chosen security key
   */
  public async deleteSecurityKey(e: Event, uid: string) {
    e.stopPropagation();
    await this.securityKeysService.delete(uid);
    await this.navigate();
  }

  /**
   * Opens sidesheet, when the user clicks on a row
   * @param selectedKey The key, that was selected by the user
   */
  public async onSelectedKey(selectedKey: PortalWebauthnkey): Promise<void> {
    this.subscriptions.push(this.sideSheet.open(SecurityKeysSidesheetComponent, {
      title: await this.translate.get('#LDS#Heading Edit Security Key').toPromise(),
      subTitle: selectedKey.GetEntity().GetDisplay(),
      padding: '0px',
      width: 'max(700px, 40%)',
      disableClose: true,
      data: selectedKey
    }).afterClosed().subscribe(async (data) => {if (data === 'delete') await this.navigate();}));
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
